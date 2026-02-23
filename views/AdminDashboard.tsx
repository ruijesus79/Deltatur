import React, { useState, useEffect } from 'react';
import {
    ServiceTask, Boat, StaffMember, AppView, KnowledgeArticle, GalleryImage, DocumentResource, WeatherConditions, LogisticsTaskEntry, LogisticsTaskType
} from '../types';
import {
    Plus, Calendar, Users, Ship, Settings, Trash2, Edit2,
    Save, X, ShieldCheck, Lock, Loader2, Briefcase, Tag, UserPlus, Anchor, CheckCircle, AlertTriangle, Clock, FileText, UserCheck, MessageSquare, Info, Play, ExternalLink, Navigation2, Zap, Phone, Mail,
    Thermometer, Wind, Waves, RefreshCw, ArrowUpRight, ArrowDownRight, Droplets, Camera, CheckSquare, List, MessageCircle, Mic, StopCircle, Radio, Map, MapPin, LayoutDashboard, Search, LogOut, ChevronRight, CheckCircle2, Filter, MoreVertical, Menu, DollarSign, Wine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveWeatherAndRiverConditions, transcribeAudio, parseVoiceTask, getNavigationNotices } from '../services/geminiService';
import { NavStatus, RiverAlert } from '../types';

interface AdminDashboardProps {
    tasks: ServiceTask[];
    fleet: Boat[];
    team: StaffMember[];
    guides: string[];
    partners: string[];
    serviceTypes: string[];
    knowledgeBase: KnowledgeArticle[];
    gallery: GalleryImage[];
    documents: DocumentResource[];
    logisticsRegistry?: LogisticsTaskEntry[];
    initialTab?: 'AGENDA' | 'EQUIPA' | 'FROTA' | 'CONFIG' | 'LOGISTICA' | 'NAVEGACAO' | 'TASKS' | 'SETTINGS';
    navStatus: NavStatus | null;
    isUpdatingNav: boolean;
    riverAlerts?: RiverAlert[];
    onUpdateRiverAlert?: (a: RiverAlert) => void;
    onRefreshNav: () => void;
    onAddTask: (t: ServiceTask) => void;
    onUpdateTask: (t: ServiceTask) => void;
    onDeleteTask: (id: string) => void;
    onUpdateFleet: (f: Boat[]) => void;
    onUpdateTeam: (t: StaffMember[]) => void;
    onUpdateGuides: (g: string[]) => void;
    onUpdatePartners: (p: string[]) => void;
    onUpdateServiceTypes: (s: string[]) => void;
    onUpdateKB: (items: KnowledgeArticle[]) => void;
    onUpdateGallery: (items: GalleryImage[]) => void;
    onUpdateDocuments: (items: DocumentResource[]) => void;
    onUpdateLogistics?: (items: LogisticsTaskEntry[]) => void;
    onNavigate: (v: any) => void;
    notify: (t: string, m: string, type?: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    tasks, fleet, team, guides, partners, serviceTypes, initialTab = 'AGENDA', logisticsRegistry = [],
    onAddTask, onUpdateTask, onDeleteTask, onUpdateFleet, onUpdateTeam,
    onUpdatePartners, onUpdateServiceTypes, onUpdateLogistics,
    navStatus,
    isUpdatingNav,
    riverAlerts = [],
    onUpdateRiverAlert,
    onRefreshNav,
    onNavigate,
    notify
}) => {
    const [activeTab, setActiveTab] = useState<'AGENDA' | 'EQUIPA' | 'FROTA' | 'CONFIG' | 'LOGISTICA' | 'NAVEGACAO' | 'TASKS' | 'SETTINGS'>(initialTab);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTask, setEditingTask] = useState<ServiceTask | null>(null);
    const [isAddingResource, setIsAddingResource] = useState<'STAFF' | 'BOAT' | 'PARTNER' | 'TYPE' | null>(null);

    // Weather & Telemetry
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    // Resource Editing States
    const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    // LOGISTICS MANAGEMENT STATE
    const [logisticsDate, setLogisticsDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [newLogisticsBoatId, setNewLogisticsBoatId] = useState('');
    const [newLogisticsType, setNewLogisticsType] = useState<LogisticsTaskType>('PREP_BARCO');
    const [newLogisticsStaffId, setNewLogisticsStaffId] = useState('');
    const [newLogisticsNotes, setNewLogisticsNotes] = useState(''); // Estado para notas logísticas

    const [viewingLogisticsEntry, setViewingLogisticsEntry] = useState<LogisticsTaskEntry | null>(null);

    // VOICE RECORDING STATES
    const [isRecording, setIsRecording] = useState(false);
    const [isParsingVoice, setIsParsingVoice] = useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);

    const [isAuthoritiesModalOpen, setIsAuthoritiesModalOpen] = useState(false);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        fetchTelemetry();
    }, []);

    const fetchTelemetry = async () => {
        setLoadingWeather(true);
        try {
            const data = await getLiveWeatherAndRiverConditions();
            setWeather(data);
        } catch (e) { console.error(e); }
        finally { setLoadingWeather(false); }
    };

    // Navigation Intelligence (LIFTED TO APP.TSX)

    useEffect(() => {
        if (activeTab === 'NAVEGACAO' && !navStatus && !isUpdatingNav) {
            onRefreshNav();
        }
    }, [activeTab, navStatus, isUpdatingNav, onRefreshNav]);

    // Service Form State
    const [newTask, setNewTask] = useState<Partial<ServiceTask>>({
        time: '10:00',
        clientName: '',
        pax: 2,
        isPrivate: true,
        status: 'PENDING',
        notes: '',
        crew: { condutor: '', assistente: '', guia: '' }
    });

    // Resource Form States
    const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ name: '', role: 'SKIPPER', active: true, email: '', phone: '' });
    const [newBoat, setNewBoat] = useState<Partial<Boat>>({ name: '', cap: 10, photoUrl: '', info: '', videoUrl: '', tiktokUrl: '' });
    const [newPartner, setNewPartner] = useState('');
    const [newType, setNewType] = useState('');

    // Admin Access States
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('deltatur_admin_creds');
        return saved ? JSON.parse(saved).user : 'admin';
    });
    const [adminPass, setAdminPass] = useState(() => {
        const saved = localStorage.getItem('deltatur_admin_creds');
        return saved ? JSON.parse(saved).pass : 'admin';
    });
    const [isSavingCreds, setIsSavingCreds] = useState(false);

    const handleSaveTask = () => {
        if (!newTask.clientName || !newTask.boat) {
            notify("Campos em falta", "Por favor preencha pelo menos o cliente e o barco.", "ALERT");
            return;
        }
        const task: ServiceTask = {
            ...newTask as ServiceTask,
            id: editingTask?.id || Date.now().toString(),
            estimatedValue: 0,
            crew: newTask.crew || { condutor: '', assistente: '', guia: '' },
            notifiedSoon: false
        };

        if (editingTask) {
            onUpdateTask(task);
            notify("Atualização Confirmada", `O serviço de ${task.clientName} foi reajustado.`, "SUCCESS");
        } else {
            onAddTask(task);
            notify("Ordem de Serviço Emitida", `Serviço criado com sucesso.Equipa notificada para ${task.boat} às ${task.time}.`, "SUCCESS");
        }

        setIsAddingTask(false);
        setEditingTask(null);
    };

    const handleSaveStaff = () => {
        if (!newStaff.name) return;

        if (editingStaff) {
            const updatedTeam = team.map(t => t.id === editingStaff.id ? { ...newStaff, id: t.id } as StaffMember : t);
            onUpdateTeam(updatedTeam);
            notify("Equipa Atualizada", `Dados de ${newStaff.name} atualizados.`, "SUCCESS");
        } else {
            const member: StaffMember = { ...newStaff as StaffMember, id: Date.now().toString() };
            onUpdateTeam([...team, member]);
            notify("Equipa Atualizada", `${member.name} adicionado(a) com sucesso.`, "SUCCESS");
        }

        setIsAddingResource(null);
        setEditingStaff(null);
        setNewStaff({ name: '', role: 'SKIPPER', active: true, email: '', phone: '' });
    };

    const handleAddBoat = () => {
        if (!newBoat.name) return;

        if (editingBoat) {
            const updatedFleet = fleet.map(b => b.id === editingBoat.id ? { ...newBoat, id: b.id } as Boat : b);
            onUpdateFleet(updatedFleet);
            notify("Frota Atualizada", `${newBoat.name} atualizado com sucesso.`, "SUCCESS");
        } else {
            const boat: Boat = { ...newBoat as Boat, id: Date.now().toString() };
            onUpdateFleet([...fleet, boat]);
            notify("Frota Atualizada", `${boat.name} adicionado(a).`, "SUCCESS");
        }

        setIsAddingResource(null);
        setEditingBoat(null);
        setNewBoat({ name: '', cap: 10, photoUrl: '', info: '', videoUrl: '', tiktokUrl: '' });
    };

    const handleAddPartner = () => {
        if (!newPartner) return;
        onUpdatePartners([...partners, newPartner]);
        setIsAddingResource(null);
        setNewPartner('');
        notify("Parceiro Adicionado", newPartner, "SUCCESS");
    };

    const handleAddType = () => {
        if (!newType) return;
        onUpdateServiceTypes([...serviceTypes, newType]);
        setIsAddingResource(null);
        setNewType('');
        notify("Tipo de Serviço Adicionado", newType, "SUCCESS");
    };

    const handleUpdateCreds = () => {
        setIsSavingCreds(true);
        setTimeout(() => {
            localStorage.setItem('deltatur_admin_creds', JSON.stringify({ user: adminUser, pass: adminPass }));
            setIsSavingCreds(false);
            notify("Segurança Atualizada", "Credenciais de acesso alteradas.", "SUCCESS");
        }, 800);
    };

    // Funções Logísticas (Novo Sistema)
    const addLogisticsTask = () => {
        if (!newLogisticsBoatId || !newLogisticsStaffId || !onUpdateLogistics) {
            notify("Dados Incompletos", "Selecione barco, tarefa e staff.", "ALERT");
            return;
        }

        const newTask: LogisticsTaskEntry = {
            id: Date.now().toString(),
            date: logisticsDate,
            boatId: newLogisticsBoatId,
            staffId: newLogisticsStaffId,
            type: newLogisticsType,
            status: 'PENDING',
            notes: newLogisticsNotes // Salvar notas
        };

        onUpdateLogistics([...logisticsRegistry, newTask]);
        notify("Tarefa Atribuída", "Equipa notificada da nova missão.", "SUCCESS");
        setNewLogisticsNotes(''); // Limpar notas após salvar
    };

    const deleteLogisticsTask = (id: string) => {
        if (!onUpdateLogistics) return;
        onUpdateLogistics(logisticsRegistry.filter(t => t.id !== id));
    };

    // Filtra as tarefas logísticas para a data selecionada
    const filteredLogistics = logisticsRegistry.filter(l => l.date === logisticsDate);

    const getTaskLabel = (type: LogisticsTaskType) => {
        switch (type) {
            case 'PREP_BARCO': return 'Preparação Geral';
            case 'DEGUSTACAO': return 'Prep. Degustação';
            case 'ABASTECER_COMB': return 'Abastecer Combustível';
            case 'ABASTECER_AGUA': return 'Abastecer Água';
            case 'FECHO_COMPLETO': return 'Fecho & Limpeza';
            default: return type;
        }
    };

    const getTaskIcon = (type: LogisticsTaskType) => {
        switch (type) {
            case 'PREP_BARCO': return CheckSquare;
            case 'DEGUSTACAO': return Zap;
            case 'ABASTECER_COMB': return Zap;
            case 'ABASTECER_AGUA': return Droplets;
            case 'FECHO_COMPLETO': return Camera;
            default: return CheckCircle;
        }
    };

    // VOICE RECORDING LOGIC
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processVoiceAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            notify("Gravação Iniciada", "Pode ditar os detalhes da nova missão.", "INFO");
        } catch (err) {
            console.error("Erro ao aceder ao microfone:", err);
            notify("Erro de Microfone", "Por favor permita o acesso ao microfone no navegador.", "ALERT");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processVoiceAudio = async (blob: Blob) => {
        setIsParsingVoice(true);
        notify("Processando Áudio", "A Inteligência Artificial está a analisar a missão ditada...", "INFO");

        try {
            const buffer = await blob.arrayBuffer();
            const base64Audio = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            const mimeType = "audio/webm";

            const transcript = await transcribeAudio(base64Audio, mimeType);

            if (transcript) {
                const parsedTask = await parseVoiceTask(transcript);

                // Merge parsed data with default new task state
                setNewTask({
                    time: parsedTask.time || '10:00',
                    clientName: parsedTask.clientName || '',
                    pax: parsedTask.pax || 2,
                    isPrivate: parsedTask.isPrivate !== undefined ? parsedTask.isPrivate : true,
                    boat: parsedTask.boat || '',
                    type: parsedTask.type || 'Passeio',
                    estimatedValue: parsedTask.estimatedValue || 0,
                    notes: parsedTask.notes || transcript, // Save full transcript if nothing else matched as notes
                    status: 'PENDING',
                    crew: {
                        condutor: parsedTask.crew?.condutor || '',
                        assistente: parsedTask.crew?.assistente || '',
                        guia: parsedTask.crew?.guia || ''
                    }
                });
                setIsAddingTask(true);
                setEditingTask(null);
                notify("Missão Processada", "Verifique e confirme os dados preenchidos pela IA.", "SUCCESS");
            } else {
                notify("Erro na Análise", "Não foi possível compreender o áudio. Tente novamente.", "ALERT");
            }

        } catch (error) {
            console.error("Erro ao processar voz:", error);
            notify("Erro na Análise", "Ocorreu um erro ao comunicar com a Inteligência Artificial.", "ALERT");
        } finally {
            setIsParsingVoice(false);
        }
    };

    const handleVoiceInput = async () => {
        // This function is called from the modal, it should trigger the voice processing
        // For now, it's a placeholder, as the actual voice recording is handled by startRecording/stopRecording
        // and processVoiceAudio. If this button is meant to re-process, it needs a way to get the audio.
        // Assuming it's a redundant button or needs more logic.
        notify("Funcionalidade em Desenvolvimento", "A entrada de voz direta no modal será implementada em breve.", "INFO");
    };

    const INITIAL_FLEET = fleet; // Placeholder for fleet data, assuming it's passed as prop

    return (
        <div className="space-y-6 pb-24 animate-fadeIn">
            <div className="relative min-h-screen bg-[#070b14] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-brand-gold/30 selection:text-white">

                {/* GRAIN TEXTURE OVERLAY */}
                <div className="absolute inset-0 z-[5] opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                {/* SIDEBAR */}
                <div className="relative z-10 w-full md:w-80 bg-[#0A101C]/80 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl shrink-0">
                    <div className="p-8 flex items-center justify-between border-b border-white/10">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Deltatur</h2>
                            <span className="text-[10px] font-black tracking-[0.2em] text-brand-gold uppercase bg-brand-gold/15 px-3 py-1 rounded-full border border-brand-gold/20 shadow-lg shadow-brand-gold/5">OS Core</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                        <div className="p-8 border-t border-white/10 text-center bg-gradient-to-b from-transparent to-white/5">
                            <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mb-1">Deltatur Digital</p>
                            <p className="font-bold text-xs text-brand-gold tracking-tight">Modo Administrador</p>
                        </div>

                        <nav className="flex-1 space-y-2 py-6 px-4">
                            {[
                                { id: 'AGENDA', label: 'Agenda Central', icon: Calendar },
                                { id: 'NAVEGACAO', label: 'Inteligência Náutica', icon: Map },
                                { id: 'LOGISTICA', label: 'Manutenção & Logística', icon: CheckSquare },
                                { id: 'EQUIPA', label: 'Gestão de Tripulação', icon: Users },
                                { id: 'FROTA', label: 'Controlo de Frota', icon: Ship },
                                { id: 'CONFIG', label: 'Configurações', icon: Settings }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${isActive ? 'bg-brand-gold/10 text-brand-gold shadow-lg shadow-brand-gold/10 border border-brand-gold/20' : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <Icon className="w-5 h-5" /> {tab.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="p-8 border-t border-white/10 mt-auto bg-[#0A101C]/50">
                            <button onClick={() => onNavigate(AppView.LANDING)} className="flex items-center gap-4 text-white/40 hover:text-brand-gold group transition-all duration-300 w-full">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/10 transition-all border border-white/5 group-hover:border-brand-gold/20 shadow-glass">
                                    <Lock className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </div>
                                <span className="font-bold text-sm tracking-wide">Bloquear Sessão</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative z-10 flex-1 h-screen overflow-y-auto custom-scrollbar">
                    <div className="p-6 md:p-12 md:max-w-7xl mx-auto space-y-8 animate-fadeIn">

                        {/* 1. TOP ACTION CENTER & TELEMETRY */}
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch animate-fadeIn">

                            {/* HEADER LEFT: ACTION CENTER */}
                            <div className="flex-1 min-w-[340px] bg-[#0A101C]/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden group shadow-spatial">
                                <div className="absolute -right-12 -top-12 opacity-[0.02] group-hover:scale-110 group-hover:opacity-[0.04] transition-all duration-1000">
                                    <Ship className="w-80 h-80 text-white" />
                                </div>

                                <div className="relative z-10 flex flex-col justify-center h-full">
                                    <h1 className="text-3xl md:text-[42px] font-black uppercase tracking-tighter leading-tight text-white mb-2">Centro de Comando</h1>
                                    <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Deltatur Operational Intelligence</p>

                                    <div className="mt-10 flex flex-wrap items-center gap-4">
                                        <button
                                            onClick={() => {
                                                setIsAddingTask(true);
                                                setEditingTask(null);
                                                setNewTask({
                                                    time: '10:00',
                                                    clientName: '',
                                                    pax: 2,
                                                    isPrivate: true,
                                                    status: 'PENDING',
                                                    notes: '',
                                                    crew: { condutor: '', assistente: '', guia: '' }
                                                });
                                            }}
                                            className="px-10 py-5 bg-brand-gold text-[#0A101C] rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-500"
                                            aria-label="Criar Novo Passeio"
                                            title="Criar Novo Passeio"
                                        >
                                            <Plus className="w-5 h-5" /> Novo Passeio
                                        </button>

                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isParsingVoice}
                                            className={`px - 8 py - 5 rounded - full font - black text - xs uppercase tracking - widest flex items - center justify - center gap - 3 shadow - glass border border - white / 10 hover: border - brand - gold / 30 hover: -translate - y - 1 transition - all duration - 500 ${isRecording ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' : 'bg-white/5 text-brand-gold hover:bg-white/10'} `}
                                            title="Gravar Missão (Inteligência Artificial)"
                                        >
                                            {isParsingVoice ? <Loader2 className="w-5 h-5 animate-spin" /> : isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            {isParsingVoice ? 'A Analisar...' : isRecording ? 'A Gravar...' : 'Gravar Missão'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TELEMETRY GRID: DECOUPLED & SPACIOUS */}
                            <div className="flex-[1.5] w-full bg-[#0A101C]/40 backdrop-blur-xl rounded-[40px] px-8 py-10 border border-white/10 relative z-10 shadow-spatial group flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-8 px-2">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-brand-gold fill-brand-gold" /> Telemetria River-Core
                                        </p>
                                        <h4 className="text-white font-black text-sm uppercase tracking-tighter mt-1">Pinhão (Live Ops)</h4>
                                    </div>
                                    <button
                                        onClick={fetchTelemetry}
                                        disabled={loadingWeather}
                                        className="w-12 h-12 bg-white/5 hover:bg-brand-gold/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 hover:border-brand-gold/20 group/btn"
                                        title="Atualizar Telemetria"
                                        aria-label="Atualizar Telemetria"
                                    >
                                        {loadingWeather ? <Loader2 className="w-5 h-5 animate-spin text-brand-gold" /> : <RefreshCw className="w-5 h-5 text-white/40 group-hover/btn:text-brand-gold transition-colors" />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
                                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                                        <div className="flex justify-center mb-4 opacity-40"><Thermometer className="w-6 h-6 text-brand-gold" /></div>
                                        <p className="text-3xl font-black text-white tracking-tighter text-center">{weather?.temp ?? '--'}<span className="text-brand-gold text-sm ml-0.5">º</span></p>
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] text-center mt-3">Temperatura</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500">
                                        <div className="flex justify-center mb-4 opacity-40"><Wind className="w-6 h-6 text-brand-gold" /></div>
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="text-3xl font-black text-white tracking-tighter">{weather?.windSpeed ?? '--'}</p>
                                            <span className="text-[10px] font-bold text-brand-gold/60 uppercase">{weather?.windDirection}</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] text-center mt-3">Vento (km/h)</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500">
                                        <div className="flex justify-center mb-4 opacity-40"><Waves className="w-6 h-6 text-brand-gold" /></div>
                                        <p className="text-3xl font-black text-white tracking-tighter text-center">{weather?.dams?.[0]?.dischargeRate ?? '--'}</p>
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] text-center mt-3">Caudal m³/s</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500">
                                        <div className="flex justify-center mb-4">
                                            {weather?.tideTrend === 'SUBIR' ? <ArrowUpRight className="w-6 h-6 text-red-500/60" /> : <ArrowDownRight className="w-6 h-6 text-green-500/60" />}
                                        </div>
                                        <p className="text-3xl font-black text-white tracking-tighter text-center">{weather?.tideHeight ?? '2.1'}</p>
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] text-center mt-3">Nível do Rio</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. NAVIGATION BAR */}
                        <div className="bg-[#0A101C]/60 backdrop-blur-2xl p-2 rounded-[32px] border border-white/10 shadow-glass-premium flex overflow-x-auto no-scrollbar gap-2 relative z-20">
                            {[
                                { id: 'AGENDA', label: 'Agenda & Escala', icon: Calendar },
                                { id: 'NAVEGACAO', label: 'Navegação IA', icon: Map },
                                { id: 'LOGISTICA', label: 'Logística & Ops', icon: CheckSquare },
                                { id: 'EQUIPA', label: 'Equipa', icon: Users },
                                { id: 'FROTA', label: 'Frota', icon: Ship },
                                { id: 'CONFIG', label: 'Configurações', icon: Settings },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex - 1 flex items - center justify - center gap - 3 px - 8 py - 5 rounded - [24px] text - [11px] font - black uppercase tracking - widest transition - all duration - 500 whitespace - nowrap ${activeTab === tab.id ? 'bg-brand-gold text-[#0A101C] shadow-lg shadow-brand-gold/10 scale-100' : 'bg-transparent text-white/30 hover:bg-white/5 hover:text-white/70 hover:scale-[1.02]'} `}
                                >
                                    <tab.icon className={`w - 4 h - 4 transition - transform ${activeTab === tab.id ? 'text-[#0A101C] scale-110' : 'text-white/30 group-hover:text-white'} `} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 3. DYNAMIC CONTENT */}
                        <div className="animate-fadeIn">

                            {/* NAVEGAÇÃO & INTELIGÊNCIA IA TAB */}
                            {activeTab === 'NAVEGACAO' && (
                                <div className="space-y-8 animate-fadeIn">
                                    {/* CABEÇALHO DA TAB */}
                                    <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/10 shadow-glass relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                                            <Map className="w-64 h-64 text-brand-gold" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w - 3 h - 3 rounded - full animate - pulse ${navStatus?.riverStatus === 'CLOSED' ? 'bg-red-500' : navStatus?.riverStatus === 'CAUTION' ? 'bg-brand-gold' : 'bg-green-500'} `} />
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Estado da Via Navegável</h3>
                                            </div>

                                            <p className="text-xl font-medium text-white/80 leading-relaxed max-w-2xl">
                                                {isUpdatingNav ? "A IA está a consultar os editais da APDL e do Instituto Hidrográfico..." : navStatus?.summary}
                                            </p>

                                            <div className="mt-8 flex flex-wrap gap-4">
                                                <button
                                                    onClick={onRefreshNav}
                                                    disabled={isUpdatingNav}
                                                    className="px-8 py-4 bg-brand-gold text-[#0A101C] rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg"
                                                >
                                                    {isUpdatingNav ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                                    {isUpdatingNav ? "Sincronizando..." : "Pesquisar Fontes Oficiais (IA Deep Scan)"}
                                                </button>

                                                <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-full">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sincronização:</span>
                                                    <span className="text-xs font-bold text-brand-gold">{navStatus?.lastAIGeneration || 'Nunca'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LINKS RÁPIDOS (BACKUP) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Via Navegável (APDL)', url: 'https://douro.apdl.pt/', icon: Ship },
                                            { label: 'Avisos aos Navegantes (IH)', url: 'https://avisos.hidrografico.pt/', icon: AlertTriangle },
                                            { label: 'GeoAnavNet (Marinha)', url: 'https://geoanavnet.hidrografico.pt/', icon: Navigation2 }
                                        ].map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/10 hover:border-brand-gold/30 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-black/40 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold/10 transition-transform">
                                                        <link.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{link.label}</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-brand-gold transition-colors" />
                                            </a>
                                        ))}
                                    </div>

                                    {/* LISTA DE AVISOS EXTRAÍDOS */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Despachos & Avisos Recentes</h4>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* FEED COMUNITÁRIO (RIVER SECURITY FEED) */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h5 className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Zap className="w-4 h-4" /> River Security Feed (Staff)
                                                    </h5>
                                                    <span className="text-[10px] font-black text-white/30 uppercase">{riverAlerts.filter(a => a.active).length} Ativos</span>
                                                </div>

                                                <div className="space-y-4">
                                                    {riverAlerts.length === 0 ? (
                                                        <div className="p-12 text-center bg-white/[0.02] rounded-[40px] border border-dashed border-white/10 opacity-40">
                                                            <Ship className="w-10 h-10 mx-auto mb-4 text-white/20" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operações Limpas</p>
                                                        </div>
                                                    ) : (
                                                        riverAlerts.map(alert => (
                                                            <div key={alert.id} className={`p - 8 rounded - [40px] bg - gradient - to - br from - white / [0.05] to - transparent border backdrop - blur - md transition - all duration - 500 shadow - glass ${alert.active ? (alert.type === 'DANGER' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10') : 'opacity-30 grayscale border-transparent scale-95'} `}>
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w - 12 h - 12 rounded - 2xl flex items - center justify - center shadow - inner ${alert.type === 'DANGER' ? 'bg-red-500/20 text-red-500' : 'bg-brand-gold/20 text-brand-gold'} `}>
                                                                            {alert.type === 'DANGER' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Reporte {alert.reporter}</p>
                                                                            <p className="text-[9px] font-bold text-white/20 uppercase mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => onUpdateRiverAlert && onUpdateRiverAlert({ ...alert, active: !alert.active })}
                                                                        className={`px - 6 py - 2.5 rounded - full text - [9px] font - black uppercase tracking - widest transition - all duration - 300 ${alert.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'} `}
                                                                    >
                                                                        {alert.active ? 'Arquivar' : 'Reativar'}
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm text-white/90 font-medium italic leading-relaxed bg-white/5 p-4 rounded-3xl border border-white/5">"{alert.message}"</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* AVISOS OFICIAIS */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h5 className="text-[11px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4" /> Editais Oficiais (APDL/IH)
                                                    </h5>
                                                    <span className="text-[10px] font-black text-white/30 uppercase">{navStatus?.notices?.length || 0} Detetados</span>
                                                </div>

                                                <div className="space-y-4">
                                                    {isUpdatingNav ? (
                                                        <div className="p-16 text-center bg-white/[0.02] rounded-[40px] border border-white/10">
                                                            <RefreshCw className="w-10 h-10 text-brand-gold animate-spin mx-auto mb-6" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Analisando Editais...</p>
                                                        </div>
                                                    ) : !navStatus?.notices?.length ? (
                                                        <div className="p-16 text-center bg-white/[0.02] rounded-[40px] border border-dashed border-white/10 opacity-40">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Canais de Informação Limpos</p>
                                                        </div>
                                                    ) : (
                                                        navStatus.notices.map(notice => (
                                                            <div key={notice.id} className="p-8 rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-brand-gold/30 hover:bg-white/[0.08] transition-all duration-500 group/notice shadow-glass backdrop-blur-sm">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <span className="px-4 py-1.5 bg-brand-gold/10 rounded-full text-[9px] font-black text-brand-gold uppercase tracking-widest border border-brand-gold/20">{notice.source}</span>
                                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(notice.timestamp).toLocaleDateString()}</span>
                                                                </div>
                                                                <h6 className="text-sm font-black text-white uppercase mb-3 tracking-tighter group-hover/notice:text-brand-gold transition-colors">{notice.title}</h6>
                                                                <p className="text-[11px] text-white/50 leading-relaxed font-medium line-clamp-3 bg-black/20 p-4 rounded-2xl">{notice.description}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SEÇÃO DE DIRETÓRIO & DADOS TÉCNICOS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-glass">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Directório de Autoridades</h4>
                                                <Users className="w-4 h-4 text-brand-gold" />
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'Capitania Douro', phone: '+351 222 070 970' },
                                                    { name: 'Polícia Marítima', phone: '+351 916 352 918' },
                                                    { name: 'Sede APDL (Régua)', phone: '+351 254 320 030' }
                                                ].map((auth, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                                                        <span className="text-xs font-bold text-white/80">{auth.name}</span>
                                                        <a href={`tel:${auth.phone.replace(/\s/g, '')} `} className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline">{auth.phone}</a>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setIsAuthoritiesModalOpen(true)}
                                                className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                            >
                                                Ver Todos os Contactos
                                            </button>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-glass">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Roteiro Técnico (Eclusas)</h4>
                                                <Anchor className="w-4 h-4 text-brand-gold" />
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'Crestuma-Lever', km: '21.6', height: '13.9m' },
                                                    { name: 'Carrapatelo', km: '71.4', height: '35.0m' },
                                                    { name: 'Bagaúste', km: '125.2', height: '28.5m' },
                                                    { name: 'Valeira', km: '173.2', height: '33.0m' }
                                                ].map((lock, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-white/80">{lock.name}</span>
                                                            <span className="text-[9px] font-black text-white/20 uppercase">Km {lock.km}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Queda: {lock.height}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LOGÍSTICA & OPS TAB */}
                            {activeTab === 'LOGISTICA' && (
                                <div className="space-y-6">

                                    {/* CONTROLOS DE CRIAÇÃO */}
                                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-6 items-end mb-4">
                                            <div className="flex-1 space-y-2 w-full">
                                                <label htmlFor="logisticsDate" className="text-[9px] font-bold text-brand-gold uppercase tracking-widest ml-1">Data da Missão</label>
                                                <input
                                                    id="logisticsDate"
                                                    type="date"
                                                    title="Data da Missão"
                                                    value={logisticsDate}
                                                    onChange={(e) => setLogisticsDate(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-gold custom-date-input"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2 w-full">
                                                <label htmlFor="logisticsBoat" className="text-[9px] font-bold text-brand-gold uppercase tracking-widest ml-1">Embarcação</label>
                                                <select
                                                    id="logisticsBoat"
                                                    title="Selecionar Embarcação"
                                                    value={newLogisticsBoatId}
                                                    onChange={(e) => setNewLogisticsBoatId(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-gold"
                                                >
                                                    <option value="">Selecionar Barco...</option>
                                                    {fleet.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 space-y-2 w-full">
                                                <label htmlFor="logisticsType" className="text-[9px] font-bold text-brand-gold uppercase tracking-widest ml-1">Tipo de Tarefa</label>
                                                <select
                                                    id="logisticsType"
                                                    title="Selecionar Tipo de Tarefa"
                                                    value={newLogisticsType}
                                                    onChange={(e) => setNewLogisticsType(e.target.value as LogisticsTaskType)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-gold"
                                                >
                                                    <option value="PREP_BARCO">Preparação Geral (Manhã)</option>
                                                    <option value="DEGUSTACAO">Prep. Degustação</option>
                                                    <option value="ABASTECER_COMB">Abastecer Combustível</option>
                                                    <option value="ABASTECER_AGUA">Abastecer Água</option>
                                                    <option value="FECHO_COMPLETO">Fecho de Dia (Fotos Obrigatórias)</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 space-y-2 w-full">
                                                <label htmlFor="logisticsStaff" className="text-[9px] font-bold text-brand-gold uppercase tracking-widest ml-1">Staff Responsável</label>
                                                <select
                                                    id="logisticsStaff"
                                                    title="Selecionar Staff Responsável"
                                                    value={newLogisticsStaffId}
                                                    onChange={(e) => setNewLogisticsStaffId(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-gold"
                                                >
                                                    <option value="">Selecionar Staff...</option>
                                                    {team.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 items-end">
                                            <div className="flex-[3] space-y-2 w-full">
                                                <label htmlFor="logisticsNotes" className="text-[9px] font-bold text-brand-muted uppercase tracking-widest ml-1">Instruções Específicas</label>
                                                <input
                                                    id="logisticsNotes"
                                                    title="Instruções Específicas"
                                                    type="text"
                                                    value={newLogisticsNotes}
                                                    onChange={(e) => setNewLogisticsNotes(e.target.value)}
                                                    placeholder="Ex: Levar 2 jarricas cheias; Verificar nível óleo motor direito..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white outline-none focus:border-brand-gold"
                                                />
                                            </div>
                                            <button
                                                onClick={addLogisticsTask}
                                                className="flex-1 px-6 py-3.5 bg-brand-gold text-[#0A101C] rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all mb-0.5"
                                                aria-label="Adicionar Tarefa Logística"
                                                title="Adicionar Tarefa Logística"
                                            >
                                                Adicionar Tarefa
                                            </button>
                                        </div>
                                    </div>

                                    {/* LISTAGEM DE TAREFAS */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-[40px] shadow-glass border border-white/10 overflow-hidden">
                                        <div className="p-8 border-b border-white/10 text-center">
                                            <h3 className="text-xl font-bold text-white flex flex-col items-center justify-center gap-2">
                                                Missões Logísticas
                                                <span className="text-sm font-medium text-brand-gold bg-black/40 border border-white/10 px-4 py-1 rounded-full">{logisticsDate}</span>
                                            </h3>
                                        </div>

                                        {filteredLogistics.length === 0 ? (
                                            <div className="p-12 text-center text-white/40">
                                                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma tarefa atribuída para este dia.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/10">
                                                {fleet.map(boat => {
                                                    const boatTasks = filteredLogistics.filter(t => t.boatId === boat.id);
                                                    if (boatTasks.length === 0) return null;

                                                    return (
                                                        <div key={boat.id} className="p-6 hover:bg-white/5 transition-colors">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <Ship className="w-4 h-4 text-brand-gold" />
                                                                <h4 className="font-black text-white uppercase">{boat.name}</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {boatTasks.map(task => {
                                                                    const assignee = team.find(t => t.id === task.staffId);
                                                                    const Icon = getTaskIcon(task.type);

                                                                    return (
                                                                        <div key={task.id} className={`p - 4 rounded - 2xl border flex flex - col gap - 2 ${task.status === 'DONE' ? 'bg-green-500/20 border-green-500/50' : 'bg-black/40 border-white/10'} `}>
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`p - 2 rounded - xl ${task.status === 'DONE' ? 'bg-green-500/30 text-green-400' : 'bg-white/5 text-brand-gold'} `}>
                                                                                        <Icon className="w-4 h-4" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-white">{getTaskLabel(task.type)}</p>
                                                                                        <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{assignee?.name || 'Desconhecido'}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    {task.status === 'DONE' && task.type === 'FECHO_COMPLETO' && (
                                                                                        <button
                                                                                            onClick={() => setViewingLogisticsEntry(task)}
                                                                                            className="p-2 bg-black/40 rounded-lg border border-green-500/50 text-green-400 hover:scale-110 transition-transform"
                                                                                            title="Ver Provas Logísticas"
                                                                                            aria-label="Ver Provas Logísticas"
                                                                                        >
                                                                                            <Camera className="w-3 h-3" />
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => deleteLogisticsTask(task.id)}
                                                                                        className="p-2 hover:bg-red-50 text-brand-muted hover:text-red-500 rounded-lg transition-colors"
                                                                                        title="Eliminar Tarefa Logística"
                                                                                        aria-label="Eliminar Tarefa Logística"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            {task.notes && (
                                                                                <div className="bg-brand-bg/50 p-2 rounded-lg border border-brand-border/50">
                                                                                    <p className="text-[10px] text-brand-muted italic leading-tight">"{task.notes}"</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* AGENDA TAB - MANTIDA */}
                            {activeTab === 'AGENDA' && (
                                <div className="space-y-4">
                                    {tasks.length === 0 ? (
                                        <div className="bg-white/5 backdrop-blur-md p-20 rounded-[40px] text-center border border-dashed border-white/20 opacity-50 shadow-glass">
                                            <Calendar className="w-16 h-16 mx-auto mb-4 text-brand-gold" />
                                            <p className="text-sm font-bold uppercase tracking-widest text-white/50">Nenhum serviço agendado para hoje</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {tasks.sort((a, b) => a.time.localeCompare(b.time)).map(task => (
                                                <div key={task.id} className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-brand-gold/30 hover:bg-white/10 transition-all shadow-glass">
                                                    <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                                                        <div className="w-16 h-16 bg-black/40 rounded-3xl flex flex-col items-center justify-center text-brand-gold border border-white/10 shadow-inner shrink-0" aria-label={`Hora da missão: ${task.time} `} title={`Hora da missão: ${task.time} `}>
                                                            <span className="text-xs font-black">{task.time}</span>
                                                            <Clock className="w-3 h-3 mt-1 opacity-50" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                <span className={`px - 4 py - 1.5 rounded - full text - [9px] font - black uppercase tracking - widest ${task.isPrivate ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'bg-white/5 text-white/50 border border-white/10'} `}>
                                                                    {task.type || (task.isPrivate ? 'Privado' : 'Partilhado')}
                                                                </span>
                                                                <span className="text-[10px] font-black text-brand-gold uppercase bg-brand-gold/5 border border-brand-gold/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                                                                    <Ship className="w-3 h-3" /> {task.boat}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase truncate">{task.clientName}</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Skipper</p>
                                                                    <p className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase">
                                                                        <Anchor className="w-3 h-3 text-brand-gold" /> {task.crew?.condutor || 'Pendente'}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Ajudante</p>
                                                                    <p className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase">
                                                                        <Navigation2 className="w-3 h-3 text-brand-gold" /> {task.crew?.assistente || 'Leandro'}
                                                                    </p>
                                                                </div>
                                                                {task.crew?.guia && (
                                                                    <div className="space-y-1">
                                                                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Guia</p>
                                                                        <p className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase">
                                                                            <Zap className="w-3 h-3 text-brand-gold" /> {task.crew.guia}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="space-y-1">
                                                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Lotação</p>
                                                                    <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                                                        <Users className="w-3 h-3 text-white/50" /> {task.pax} PAX
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <button onClick={() => { setEditingTask(task); setNewTask(task); setIsAddingTask(true); }} className="p-4 bg-white/5 border border-white/10 text-white/50 hover:text-brand-gold hover:border-brand-gold/30 rounded-2xl transition-all shadow-glass" aria-label="Editar Missão" title="Editar Missão"><Edit2 className="w-5 h-5" /></button>
                                                        <button onClick={() => onDeleteTask(task.id)} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all shadow-glass" aria-label="Eliminar Missão" title="Eliminar Missão"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ... OUTRAS SECÇÕES (EQUIPA, FROTA, CONFIG) MANTIDAS ... */}
                            {activeTab === 'EQUIPA' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <button
                                        onClick={() => {
                                            setEditingStaff(null);
                                            setNewStaff({ name: '', role: 'SKIPPER', active: true, email: '', phone: '' });
                                            setIsAddingResource('STAFF');
                                        }}
                                        className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-dashed border-white/20 flex flex-col items-center justify-center text-center group hover:border-brand-gold/50 hover:bg-white/10 transition-all shadow-glass"
                                        aria-label="Novo Elemento da Equipa"
                                        title="Novo Elemento da Equipa"
                                    >
                                        <div className="w-20 h-20 bg-black/40 rounded-[28px] flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:text-[#0A101C] transition-all text-white/50">
                                            <UserPlus className="w-10 h-10" />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-brand-gold">Novo Staff</p>
                                    </button>
                                    {team.map(member => (
                                        <div key={member.id} className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 flex flex-col shadow-glass relative overflow-hidden group hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-[24px] flex items-center justify-center font-black text-2xl shadow-inner uppercase">{member.name.charAt(0)}</div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-white uppercase text-lg tracking-tighter truncate">{member.name}</h4>
                                                    <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-[9px] font-black uppercase tracking-widest">{member.role}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                {member.email && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-white/50">
                                                        <Mail className="w-3 h-3" /> <span className="truncate">{member.email}</span>
                                                    </div>
                                                )}
                                                {member.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-white/50">
                                                        <Phone className="w-3 h-3" /> <span className="truncate">{member.phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${member.active ? 'text-green-400' : 'text-red-400'} `}>{member.active ? 'Ativo' : 'Inativo'}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingStaff(member);
                                                                setNewStaff(member);
                                                                setIsAddingResource('STAFF');
                                                            }}
                                                            className="p-3 text-white/40 hover:text-brand-gold bg-black/40 hover:bg-white/10 border border-transparent hover:border-brand-gold/30 rounded-xl transition-all"
                                                            aria-label="Editar Membro"
                                                            title="Editar Membro da Equipa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onUpdateTeam(team.filter(t => t.id !== member.id))}
                                                            className="p-3 text-white/40 hover:text-red-400 bg-black/40 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-xl transition-all"
                                                            aria-label="Eliminar Membro"
                                                            title="Eliminar Membro da Equipa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* QUICK ACTIONS - WHATSAPP & CALL */}
                                                {member.phone && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a
                                                            href={`tel:${member.phone.replace(/\s/g, '')} `}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white/30 transition-all font-sans"
                                                        >
                                                            <Phone className="w-4 h-4" /> Ligar
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/${member.phone.replace(/\s/g, '').replace('+', '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#25D366]/20 transition-all font-sans"
                                                        >
                                                            <MessageCircle className="w-4 h-4" /> WhatsApp
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                        </div >
                                    ))}
                                </div >
                            )}

                            {/* ... OUTRAS SECÇÕES (FROTA, CONFIG, MODAIS) ... MANTIDAS IGUAIS ... */}
                            {
                                activeTab === 'FROTA' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <button
                                            onClick={() => {
                                                setEditingBoat(null);
                                                setNewBoat({ name: '', cap: 10, photoUrl: '', info: '', videoUrl: '', tiktokUrl: '' });
                                                setIsAddingResource('BOAT');
                                            }}
                                            className="bg-white/5 backdrop-blur-md min-h-[300px] rounded-[48px] border border-dashed border-white/20 flex flex-col items-center justify-center text-center group hover:border-brand-gold/50 hover:bg-white/10 transition-all shadow-glass"
                                            aria-label="Adicionar Embarcação"
                                            title="Adicionar Embarcação"
                                        >
                                            <div className="w-20 h-20 bg-black/40 rounded-[28px] flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:text-[#0A101C] transition-all shadow-lg text-white/50">
                                                <Anchor className="w-10 h-10" />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-brand-gold">Adicionar Embarcação</p>
                                        </button>
                                        {fleet.map(boat => (
                                            <div key={boat.id} className="bg-white/5 backdrop-blur-md rounded-[48px] border border-white/10 shadow-glass flex flex-col overflow-hidden group hover:border-white/20 hover:shadow-xl transition-all">
                                                <div className="h-48 relative overflow-hidden bg-black/40 border-b border-white/10">
                                                    {boat.photoUrl ? (
                                                        <img src={boat.photoUrl} alt={boat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                                            <Ship className="w-20 h-20" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <div className="px-4 py-2 bg-[#0A101C]/80 backdrop-blur-md border border-brand-gold/20 text-brand-gold rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                            {boat.cap} PAX
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-8 flex-1 flex flex-col">
                                                    <h4 className="font-black text-white uppercase text-2xl tracking-tighter mb-3">{boat.name}</h4>
                                                    <p className="text-xs text-white/50 font-medium leading-relaxed line-clamp-2">{boat.info || "Sem especificações."}</p>
                                                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between gap-4">
                                                        <button
                                                            onClick={() => {
                                                                setEditingBoat(boat);
                                                                setNewBoat(boat);
                                                                setIsAddingResource('BOAT');
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 text-white/40 hover:text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/20 border border-transparent rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> Editar
                                                        </button>
                                                        <button
                                                            onClick={() => onUpdateFleet(fleet.filter(b => b.id !== boat.id))}
                                                            className="p-3 text-white/40 hover:text-red-400 bg-white/5 border border-transparent hover:bg-red-500/10 hover:border-red-500/30 rounded-2xl transition-all"
                                                            aria-label="Eliminar Embarcação"
                                                            title="Eliminar Embarcação"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }

                            {/* TAB: LOGÍSTICA (Monitor de Tarefas Real-time) */}
                            {
                                activeTab === 'TASKS' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Monitor de Logística</h3>
                                            <div className="flex gap-4">
                                                <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl border border-green-500/20 text-[10px] font-black uppercase tracking-widest">Barcos Prontos: 2</div>
                                                <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest">Pendentes: 1</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {INITIAL_FLEET.map(boat => (
                                                <div key={boat.id} className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-spatial relative overflow-hidden group">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20 group-hover:bg-brand-primary/20 transition-all"><Ship className="w-7 h-7 text-brand-primary" /></div>
                                                        <div><h3 className="text-xl font-bold text-white">{boat.name}</h3><p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Estado de Prontidão</p></div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Limpeza WC/Vidros</span>
                                                            <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[8px] font-black rounded-lg uppercase tracking-widest">OK</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Setup Champanhe</span>
                                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[8px] font-black rounded-lg uppercase tracking-widest">Pendente</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            {/* TAB: CONFIG - GESTÃO DE DADOS */}
                            {
                                activeTab === 'CONFIG' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                                        <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-spatial">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20"><Users className="w-7 h-7 text-brand-primary" /></div>
                                                <div><h3 className="text-xl font-bold text-white">Gestão de Parceiros</h3><p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Base de Dados Comercial</p></div>
                                            </div>
                                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
                                                {partners.map((p, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                                                        <span className="text-sm font-bold text-white">{p}</span>
                                                        <button title="Remover Parceiro" aria-label="Remover Parceiro" onClick={() => onUpdatePartners?.(partners.filter((_, i) => i !== idx))} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" id="newPartnerInput" placeholder="Nome do Parceiro..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-brand-primary outline-none" />
                                                <button
                                                    title="Adicionar parceiro"
                                                    aria-label="Adicionar parceiro"
                                                    onClick={() => {
                                                        const el = document.getElementById('newPartnerInput') as HTMLInputElement;
                                                        if (el.value) { onUpdatePartners?.([...partners, el.value]); el.value = ''; }
                                                    }}
                                                    className="p-3 bg-brand-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all"
                                                ><Plus className="w-5 h-5" /></button>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-spatial">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20"><Zap className="w-7 h-7 text-brand-primary" /></div>
                                                <div><h3 className="text-xl font-bold text-white">Tipologias de Serviço</h3><p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Catálogo de Operações</p></div>
                                            </div>
                                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
                                                {serviceTypes.map((s, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                                                        <span className="text-sm font-bold text-white">{s}</span>
                                                        <button title="Remover Serviço" aria-label="Remover Serviço" onClick={() => onUpdateServiceTypes?.(serviceTypes.filter((_, i) => i !== idx))} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" id="newServiceInput" placeholder="Novo Serviço..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-brand-primary outline-none" />
                                                <button
                                                    title="Adicionar serviço"
                                                    aria-label="Adicionar serviço"
                                                    onClick={() => {
                                                        const el = document.getElementById('newServiceInput') as HTMLInputElement;
                                                        if (el.value) { onUpdateServiceTypes?.([...serviceTypes, el.value]); el.value = ''; }
                                                    }}
                                                    className="p-3 bg-brand-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all"
                                                ><Plus className="w-5 h-5" /></button>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-spatial cursor-pointer hover:bg-white/[0.07] transition-all" onClick={() => onNavigate(AppView.STRESS_TEST)}>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20"><AlertTriangle className="w-7 h-7 text-red-500" /></div>
                                                <div><h3 className="text-xl font-bold text-white">Operational Stress-Test</h3><p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Simulação de Escala</p></div>
                                            </div>
                                            <p className="text-sm text-white/60 mb-6">Ferramenta de auditoria para testar a robustez da plataforma sob carga máxima de agendamento.</p>
                                            <div className="flex items-center gap-2 text-brand-gold font-black text-[10px] uppercase tracking-widest">Entrar no Ambiente de Teste <ChevronRight className="w-4 h-4" /></div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === 'SETTINGS' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                                        <div className="lg:col-span-2 bg-[#0A101C]/80 backdrop-blur-xl border border-white/10 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 z-[5] opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                            <ShieldCheck className="absolute -right-8 -top-8 w-64 h-64 opacity-5 text-brand-gold" />
                                            <div className="relative z-10 max-w-4xl">
                                                <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-6">
                                                    <Lock className="w-8 h-8 text-brand-gold" /> Segurança Administrativa
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label htmlFor="adminUser" className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-1">Utilizador Mestre</label>
                                                        <input id="adminUser" type="text" title="Utilizador Mestre" placeholder="Utilizador" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[24px] px-8 py-5 text-lg font-bold text-white outline-none focus:border-brand-gold focus:bg-white/5 transition-all" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label htmlFor="adminPass" className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-1">Chave de Acesso</label>
                                                        <input id="adminPass" type="password" title="Chave de Acesso" placeholder="Senha" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[24px] px-8 py-5 text-lg font-bold text-white outline-none focus:border-brand-gold focus:bg-white/5 transition-all" />
                                                    </div>
                                                </div>
                                                <button onClick={handleUpdateCreds} disabled={isSavingCreds} className="mt-12 px-12 py-5 bg-brand-gold text-[#0A101C] rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-gold/20 hover:scale-[1.02] hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                                    {isSavingCreds ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    {isSavingCreds ? 'A Criptografar...' : 'Atualizar Protocolo de Segurança'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                        </div >

                        {/* MODAL PARA VER FOTOS LOGISTICAS (Granular) */}
                        {
                            viewingLogisticsEntry && (
                                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={() => setViewingLogisticsEntry(null)}></div>
                                    <div className="relative w-full max-w-2xl bg-white rounded-[48px] p-10 shadow-2xl animate-slideUp overflow-hidden">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">
                                                    Auditoria: {fleet.find(b => b.id === viewingLogisticsEntry.boatId)?.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">
                                                    {viewingLogisticsEntry.date} • {team.find(t => t.id === viewingLogisticsEntry.staffId)?.name}
                                                </p>
                                            </div>
                                            <button aria-label="Fechar Modal de Auditoria" title="Fechar Modal de Auditoria" onClick={() => setViewingLogisticsEntry(null)} className="p-3 hover:bg-brand-bg rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Foto Combustível */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                                                    <Zap className="w-4 h-4" /> Combustível
                                                </h4>
                                                <div className="aspect-square bg-brand-bg rounded-2xl border-2 border-brand-border overflow-hidden flex items-center justify-center relative group">
                                                    {viewingLogisticsEntry.fuelPhoto ? (
                                                        <img src={viewingLogisticsEntry.fuelPhoto} className="w-full h-full object-cover" alt="Combustível" />
                                                    ) : (
                                                        <span className="text-xs text-brand-muted">Sem foto</span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Foto Água */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                                                    <Droplets className="w-4 h-4" /> Nível de Água
                                                </h4>
                                                <div className="aspect-square bg-brand-bg rounded-2xl border-2 border-brand-border overflow-hidden flex items-center justify-center relative group">
                                                    {viewingLogisticsEntry.waterPhoto ? (
                                                        <img src={viewingLogisticsEntry.waterPhoto} className="w-full h-full object-cover" alt="Água" />
                                                    ) : (
                                                        <span className="text-xs text-brand-muted">Sem foto</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-brand-border flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Garrafas Champagne</p>
                                                <p className="text-2xl font-black text-brand-gold">{viewingLogisticsEntry.champagneStock || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {/* MODAL: NOVO PASSEIO / MISSÃO (EXCEL KILLER) */}
                        <AnimatePresence>
                            {isAddingTask && (
                                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-xl" onClick={() => setIsAddingTask(false)}></motion.div>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        className="relative w-full max-w-4xl bg-[#0a121e] rounded-[48px] p-8 md:p-12 shadow-spatial text-white overflow-hidden border border-white/10"
                                    >
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none"><Zap className="w-64 h-64 text-brand-gold" /></div>

                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div>
                                                <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-2">Comando & Controlo</p>
                                                <h3 className="text-4xl font-['Cormorant_Garamond'] font-bold italic tracking-tight">Criar Nova Missão</h3>
                                            </div>
                                            <button onClick={() => setIsAddingTask(false)} title="Fechar Modal" aria-label="Fechar Modal" className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-center text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                                            {/* COLUNA 1: DADOS PRIMÁRIOS */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label htmlFor="clientInput" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Cliente / Referência</label>
                                                    <input
                                                        id="clientInput"
                                                        type="text" value={newTask.clientName} onChange={e => setNewTask({ ...newTask, clientName: e.target.value })}
                                                        placeholder="ex: João Silva (Viking IV)"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 outline-none focus:border-brand-gold transition-all"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label htmlFor="timeInput" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Horário</label>
                                                        <input
                                                            id="timeInput"
                                                            type="time" title="Horário da Missão" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-gold transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor="paxInput" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Passageiros (PAX)</label>
                                                        <input
                                                            id="paxInput"
                                                            type="number" title="Número de Passageiros" placeholder="0" value={newTask.pax} onChange={e => setNewTask({ ...newTask, pax: Number(e.target.value) })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-gold transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="boatSelect" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Embarcação</label>
                                                    <select
                                                        id="boatSelect"
                                                        title="Selecionar Embarcação" value={newTask.boat} onChange={e => setNewTask({ ...newTask, boat: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-gold transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-[#0a121e]">Selecionar Barco...</option>
                                                        {fleet.map(b => <option key={b.id} value={b.name} className="bg-[#0a121e]">{b.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="typeSelect" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tipo de Serviço</label>
                                                    <select
                                                        id="typeSelect"
                                                        title="Tipo de Serviço" value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-gold transition-all appearance-none"
                                                    >
                                                        {serviceTypes.map(s => <option key={s} value={s} className="bg-[#0a121e]">{s}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="partnerSelect" className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Parceiro / Canal</label>
                                                    <select
                                                        id="partnerSelect"
                                                        title="Selecionar Parceiro" value={newTask.partnerName} onChange={e => setNewTask({ ...newTask, partnerName: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-gold transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-[#0a121e]">Venda Direta / Sem Parceiro</option>
                                                        {partners.map(p => <option key={p} value={p} className="bg-[#0a121e]">{p}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* COLUNA 2: EQUIPA & LOGÍSTICA */}
                                            <div className="space-y-6">
                                                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-4">
                                                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-2 flex items-center gap-2"><Anchor className="w-3 h-3" /> Escala de Tripulação</p>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Condutor</label>
                                                                <select
                                                                    title="Selecionar Condutor" value={newTask.crew?.condutor || ''} onChange={e => setNewTask({ ...newTask, crew: { ...newTask.crew!, condutor: e.target.value } })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                                                                >
                                                                    <option value="" className="bg-[#0a121e]">Nenhum</option>
                                                                    {team.filter(t => t.active).map(t => <option key={t.id} value={t.name} className="bg-[#0a121e]">{t.name}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Assistente</label>
                                                                <select
                                                                    title="Selecionar Assistente" value={newTask.crew?.assistente || ''} onChange={e => setNewTask({ ...newTask, crew: { ...newTask.crew!, assistente: e.target.value } })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                                                                >
                                                                    <option value="" className="bg-[#0a121e]">Nenhum</option>
                                                                    {team.filter(t => t.active).map(t => <option key={t.id} value={t.name} className="bg-[#0a121e]">{t.name}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Guia (Anfitrião)</label>
                                                            <select
                                                                title="Selecionar Guia" value={newTask.crew?.guia || ''} onChange={e => setNewTask({ ...newTask, crew: { ...newTask.crew!, guia: e.target.value } })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                                                            >
                                                                <option value="" className="bg-[#0a121e]">Não necessário</option>
                                                                {guides.map(g => <option key={g} value={g} className="bg-[#0a121e]">{g}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-4">
                                                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-2 flex items-center gap-2"><Wine className="w-3 h-3" /> Detalhes da Experiência</p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => setNewTask({ ...newTask, hasTasting: !newTask.hasTasting })}
                                                            className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newTask.hasTasting ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' : 'bg-white/5 border-white/10 text-white/30'}`}
                                                        >
                                                            Degustação
                                                        </button>
                                                        <button
                                                            onClick={() => setNewTask({ ...newTask, hasLunch: !newTask.hasLunch })}
                                                            className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newTask.hasLunch ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-white/5 border-white/10 text-white/30'}`}
                                                        >
                                                            Almoço
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-4 relative z-10">
                                            <button onClick={handleSaveTask} className="flex-1 py-5 bg-brand-primary text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-brand-primary-dark transition-all">Confirmar e Mobilizar</button>
                                            <button onClick={() => setIsAddingTask(false)} className="px-8 py-5 border border-white/10 text-white/40 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:text-white transition-all">Cancelar</button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* OUTROS MODAIS (ADMIN, RESOURCES, DIRECTORY) */}
                        <AnimatePresence>
                            {isAddingResource && (
                                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-md" onClick={() => setIsAddingResource(null)}></motion.div>
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-[#0A101C] rounded-[48px] p-10 shadow-2xl overflow-hidden border border-white/10">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gestão de Ativos</h3>
                                            <button title="Fechar Modal" aria-label="Fechar Modal" onClick={() => setIsAddingResource(null)} className="p-3 bg-white/5 text-white/50 hover:text-white rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                                        </div>
                                        <div className="space-y-6">
                                            {isAddingResource === 'STAFF' && (
                                                <div className="space-y-4">
                                                    <input type="text" placeholder="Nome do Membro" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-2xl outline-none" />
                                                    <button onClick={handleSaveStaff} className="w-full py-4 bg-brand-gold text-brand-dark rounded-xl font-black uppercase text-[10px] tracking-widest">Guardar Staff</button>
                                                </div>
                                            )}
                                            {isAddingResource === 'BOAT' && (
                                                <div className="space-y-4">
                                                    <input type="text" placeholder="Nome do Barco" value={newBoat.name} onChange={e => setNewBoat({ ...newBoat, name: e.target.value })} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-2xl outline-none" />
                                                    <button onClick={handleAddBoat} className="w-full py-4 bg-brand-gold text-brand-dark rounded-xl font-black uppercase text-[10px] tracking-widest">Guardar Barco</button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {isAuthoritiesModalOpen && (
                                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsAuthoritiesModalOpen(false)}></motion.div>
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0A101C] border border-white/10 rounded-[40px] p-10 text-white shadow-2xl flex flex-col max-h-[85vh]">
                                        <div className="flex justify-between items-center mb-10">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Directório de Autoridades</h3>
                                            <button title="Fechar Modal" aria-label="Fechar Modal" onClick={() => setIsAuthoritiesModalOpen(false)} className="p-3 bg-white/5 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                                            <p className="text-sm text-white/40 italic">Mantenha os contatos de navegação APDL e Douro em dia...</p>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .shadow-spatial { box-shadow: 0 32px 64px -16px rgba(0,0,0,0.5); }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
