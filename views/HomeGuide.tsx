
import React, { useState, useEffect, useRef } from 'react';
import { ServiceTask, UserProfile, AppView, WeatherConditions, Boat, StaffMember, LogisticsTaskEntry, LogisticsTaskType, NavStatus } from '../types';
import {
    Ship, ChevronRight, Waves, Zap, AlertTriangle, ShieldCheck,
    Thermometer, Wind, RefreshCw, Loader2, Info, Navigation2,
    Map as MapIcon, Calendar, Clock, Users, MapPin, Phone,
    FileText, ExternalLink, Siren, CloudSun, Radar, Wine, User, Anchor, FileWarning, CheckSquare, Camera, CheckCircle, X, Droplets, MessageCircle, Radio
} from 'lucide-react';
import { getLiveWeatherAndRiverConditions, getPredictiveRiverSafety } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import NumberTicker from '../components/magicui/NumberTicker';
import ShimmerButton from '../components/magicui/ShimmerButton';
import { SwipeAction } from '../components/magicui/SwipeAction';

interface HomeGuideProps {
    user: UserProfile;
    tasks: ServiceTask[];
    onNavigate: (view: AppView, task?: ServiceTask) => void;
    fleet?: Boat[];
    team?: StaffMember[];
    onUpdateFleet?: (f: Boat[]) => void;
    logisticsRegistry?: LogisticsTaskEntry[];
    onUpdateLogistics?: (items: LogisticsTaskEntry[]) => void;
    navStatus: NavStatus | null;
    isUpdatingNav: boolean;
    onRefreshNav: () => void;
}

const HomeGuide: React.FC<HomeGuideProps> = ({
    user, tasks, onNavigate, fleet = [], team = [], onUpdateFleet,
    logisticsRegistry = [], onUpdateLogistics,
    navStatus, isUpdatingNav, onRefreshNav
}) => {
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // REDESIGNED TELEMETRY ENGINE (Operational Realism)
    const [vesselState, setVesselState] = useState<'NAVIGATING' | 'ANCHORED' | 'DOCKED'>('DOCKED');
    const [sog, setSog] = useState(0); // Speed Over Ground
    const [hdg, setHdg] = useState(165); // Heading
    const [dbt, setDbt] = useState(8.4); // Depth Below Transducer
    const [targetSpeed, setTargetSpeed] = useState(0);
    const [nearbyVessels, setNearbyVessels] = useState(0);

    const [isSunsetMode, setIsSunsetMode] = useState(false);
    const [isAnchorModalOpen, setIsAnchorModalOpen] = useState(false);
    const [isAnchorArmed, setIsAnchorArmed] = useState(false);

    // Physics Simulation Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const telemetryLoop = setInterval(() => {
            // AIS Logic (Realistic appearances)
            if (Math.random() > 0.99) {
                setNearbyVessels(Math.floor(Math.random() * 4));
            }

            // Speed Damping Simulation
            setSog(prev => {
                if (vesselState === 'DOCKED') return 0;

                const diff = targetSpeed - prev;
                const accel = diff * (diff > 0 ? 0.02 : 0.08); // Decelerate faster than accelerate
                const jitter = vesselState === 'ANCHORED' ? ((Math.random() - 0.5) * 0.05) : ((Math.random() - 0.5) * 0.1);

                const nextSog = prev + accel + jitter;
                return Math.max(0, Math.min(22, nextSog));
            });

            // Heading micro-drift - Reduced when anchored
            setHdg(prev => {
                const driftIntensity = vesselState === 'ANCHORED' ? 0.3 : 1.2;
                return (prev + (Math.random() - 0.5) * driftIntensity + 360) % 360;
            });

            // Depth fluctuation based on riverbed simulation
            setDbt(prev => {
                const drift = (Math.random() - 0.5) * 0.15;
                return Math.max(2.5, Math.min(30, prev + drift));
            });

            // Dynamic Target Speed changes occasionally during navigation
            if (vesselState === 'NAVIGATING' && Math.random() > 0.98) {
                setTargetSpeed(8 + Math.random() * 8);
            }
        }, 500);

        return () => { clearInterval(timer); clearInterval(telemetryLoop); };
    }, [targetSpeed, vesselState]);

    // Vessel State Side Effects
    useEffect(() => {
        if (vesselState === 'DOCKED') setTargetSpeed(0);
        else if (vesselState === 'ANCHORED') setTargetSpeed(0.1); // Simulated drift
        else if (vesselState === 'NAVIGATING') setTargetSpeed(12.5);
    }, [vesselState]);

    const nextTask = tasks.find(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const [activeLogisticsTask, setActiveLogisticsTask] = useState<LogisticsTaskEntry | null>(null);
    const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
    const [waterPhoto, setWaterPhoto] = useState<string | null>(null);
    const [champagneCount, setChampagneCount] = useState<number>(0);
    const fileInputFuelRef = useRef<HTMLInputElement>(null);
    const fileInputWaterRef = useRef<HTMLInputElement>(null);

    const currentStaffId = team.find(t => t.name === user.name || t.email === user.email)?.id;
    const todayDate = new Date().toISOString().split('T')[0];

    const vibrate = (pattern: number | number[]) => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const live = await getLiveWeatherAndRiverConditions();
            const predictive = await getPredictiveRiverSafety(live);
            setWeather({ ...live, ...predictive } as WeatherConditions);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        if (!navStatus && !isUpdatingNav) {
            onRefreshNav();
        }
        const hour = new Date().getHours();
        if (hour >= 18 || hour <= 7) {
            setIsSunsetMode(true);
            document.body.classList.add('sunset-glow');
        } else {
            setIsSunsetMode(false);
            document.body.classList.remove('sunset-glow');
        }
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'FUEL' | 'WATER') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'FUEL') setFuelPhoto(reader.result as string);
                else setWaterPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const completeLogisticsTask = () => {
        if (!activeLogisticsTask || !onUpdateLogistics) return;
        const updatedRegistry = logisticsRegistry.map(t => {
            if (t.id !== activeLogisticsTask.id) return t;
            return {
                ...t, status: 'DONE', completedAt: new Date().toISOString(),
                fuelPhoto: fuelPhoto || undefined, waterPhoto: waterPhoto || undefined,
                champagneStock: champagneCount
            } as LogisticsTaskEntry;
        });
        onUpdateLogistics(updatedRegistry);
        setActiveLogisticsTask(null);
        setFuelPhoto(null);
        setWaterPhoto(null);
        setChampagneCount(0);
    };

    const myPendingTasks = logisticsRegistry.filter(t =>
        t.staffId === currentStaffId &&
        t.date === todayDate &&
        t.status === 'PENDING'
    );

    const getTaskLabel = (type: LogisticsTaskType) => {
        switch (type) {
            case 'PREP_BARCO': return 'Preparação de Deck';
            case 'DEGUSTACAO': return 'Setup de Vinhos & Tapas';
            case 'ABASTECER_COMB': return 'Nível de Combustível';
            case 'ABASTECER_AGUA': return 'Nível de Água Potável';
            case 'FECHO_COMPLETO': return 'Checklist de Fim de Dia';
            default: return type;
        }
    };

    const getTaskIcon = (type: LogisticsTaskType) => {
        switch (type) {
            case 'PREP_BARCO': return CheckSquare;
            case 'DEGUSTACAO': return Wine;
            case 'ABASTECER_COMB': return Zap;
            case 'ABASTECER_AGUA': return Droplets;
            case 'FECHO_COMPLETO': return Camera;
            default: return CheckCircle;
        }
    };

    return (
        <div className="pb-32 max-w-6xl mx-auto px-4 animate-fadeIn space-y-8 mt-6">

            {/* 1. WELCOME HEADER - MORE BRANDED */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 bg-white rounded-[40px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group shadow-glass border border-brand-border/40">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                        <Waves className="w-56 h-56 text-[#C5A028]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Active Duty Protocol
                        </p>
                        <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] font-bold text-brand-dark tracking-tight leading-none">
                            Bem-vindo, <span className="italic text-brand-gold">{user.name.split(' ')[0]}</span>.
                        </h2>
                        <p className="text-brand-muted text-sm md:text-base mt-4 font-medium max-w-md">O Rio Douro apresenta condições de navegabilidade <span className="text-green-600 font-bold">excelentes</span> para o seu turno.</p>
                    </div>
                </div>
                <div className="bg-[#0A2F1F] rounded-[40px] p-8 text-white flex flex-col items-center justify-center text-center shadow-spatial overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-3xl mb-4 shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                        {user.name.charAt(0)}
                    </div>
                    <p className="font-black text-[9px] uppercase tracking-[0.3em] text-brand-gold relative z-10">{user.role}</p>
                </div>
            </section>

            {/* 2. LOGISTICS TASKS */}
            {myPendingTasks.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-brand-gold" /> Protocolo de Segurança e Apoio
                        </h3>
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">Pendente</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myPendingTasks.map(task => {
                            const boat = fleet.find(b => b.id === task.boatId);
                            const Icon = getTaskIcon(task.type);
                            const isCritical = task.type === 'FECHO_COMPLETO';

                            return (
                                <button
                                    key={task.id}
                                    onClick={() => setActiveLogisticsTask(task)}
                                    className={`p-7 rounded-[32px] border shadow-glass hover:shadow-spatial hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left flex items-center justify-between group relative overflow-hidden
                                    ${isCritical ? 'bg-[#0A2F1F] border-[#0A2F1F]' : 'bg-white border-brand-border/60'}
                                `}
                                >
                                    <div className="relative z-10">
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${isCritical ? 'text-white/40' : 'text-brand-gold'}`}>
                                            {isCritical ? 'Fim de Operação' : 'Preparação Exclusiva'}
                                        </p>
                                        <h4 className={`text-xl font-bold font-['Cormorant_Garamond'] ${isCritical ? 'text-white' : 'text-brand-dark'}`}>
                                            {getTaskLabel(task.type)}
                                        </h4>
                                        <p className={`text-xs mt-1.5 font-medium ${isCritical ? 'text-white/60' : 'text-brand-muted'}`}>
                                            Vessel: <span className="italic">{boat?.name || 'Frota Deltatur'}</span>
                                        </p>
                                    </div>
                                    <Icon className={`w-8 h-8 group-hover:scale-110 transition-transform ${isCritical ? 'text-brand-gold' : 'text-brand-muted/40'}`} />
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 3. RADAR / COCKPIT CO-PILOT */}
            <section className="bg-[#070b14] rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden group border border-white/5">
                {/* Visual depth background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

                <div className="flex flex-col gap-10 relative z-10 text-white">

                    {/* AIS & RADAR STATUS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 gap-6 md:gap-0">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <Radar className="w-7 h-7 text-brand-gold" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1 flex items-center gap-2">
                                    Inteligência Náutica IA
                                    {isUpdatingNav && <Loader2 className="w-3 h-3 animate-spin text-brand-gold" />}
                                </p>
                                <h4 className="text-sm font-bold text-white/90 leading-tight">
                                    {navStatus?.summary || "Sincronizando editais da via navegável..."}
                                </h4>
                            </div>
                        </div>

                        {/* VESSEL STATE SELECTOR */}
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setVesselState('NAVIGATING')}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vesselState === 'NAVIGATING' ? 'bg-brand-gold text-brand-primary-dark' : 'text-white/40 hover:text-white'}`}
                            >
                                Navegação
                            </button>
                            <button
                                onClick={() => { setVesselState('ANCHORED'); setIsAnchorArmed(true); }}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vesselState === 'ANCHORED' ? 'bg-brand-gold text-brand-primary-dark' : 'text-white/40 hover:text-white'}`}
                            >
                                Fundeado
                            </button>
                            <button
                                onClick={() => setVesselState('DOCKED')}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vesselState === 'DOCKED' ? 'bg-brand-gold text-brand-primary-dark' : 'text-white/40 hover:text-white'}`}
                            >
                                No Cais
                            </button>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Vessels Target (AIS)</p>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${nearbyVessels > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    <h4 className="text-sm font-black italic">{nearbyVessels === 0 ? 'Rio Desimpedido' : `${nearbyVessels} embarcações perto`}</h4>
                                </div>
                            </div>
                            {/* Scanning Radar */}
                            <button
                                onClick={onRefreshNav}
                                disabled={isUpdatingNav}
                                className="relative w-14 h-14 bg-black/40 rounded-full overflow-hidden border border-brand-gold/20 flex items-center justify-center shadow-inner hover:bg-brand-gold/10 transition-colors"
                                title="Sincronizar IA"
                            >
                                <div className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(197,160,40,0.3)_15%,transparent_16%)] ${isUpdatingNav ? 'animate-radar-sweep' : ''}`}></div>
                                <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>
                                <RefreshCw className={`w-4 h-4 text-brand-gold relative z-10 ${isUpdatingNav ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* TELEMETRY CENTER */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16 py-4">
                        <div className="flex flex-col items-center md:items-start">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 ml-1">Universal Time (UTC+0)</p>
                            <h2 className="text-[110px] md:text-[150px] font-black font-roboto leading-none tracking-tighter text-white drop-shadow-2xl">
                                {currentTime.getHours().toString().padStart(2, '0')}
                                <span className="text-brand-gold/30 animate-pulse">:</span>
                                {currentTime.getMinutes().toString().padStart(2, '0')}
                            </h2>
                            <div className="flex items-center gap-3 mt-4 px-1">
                                <MapPin className="w-5 h-5 text-brand-gold" />
                                <p className="text-xl font-medium text-white/60 tracking-tight italic uppercase">
                                    Douro • {currentTime.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end text-center md:text-right bg-white/5 p-10 rounded-[48px] border border-white/10 min-w-[280px] shadow-2xl backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Real SOG (Speed Over Ground)</p>
                            <div className="flex items-baseline gap-4">
                                <h3 className="text-9xl font-black font-roboto text-brand-gold leading-none">
                                    <NumberTicker value={sog} decimalPlaces={1} />
                                </h3>
                                <span className="text-2xl font-black text-white/20 italic tracking-tighter uppercase">Knots</span>
                            </div>
                            <div className="flex items-center gap-3 mt-8 bg-white/5 py-2 px-4 rounded-full border border-white/5">
                                <Wind className="w-4 h-4 text-brand-gold" />
                                <span className="text-[11px] font-bold tracking-widest text-white/70">{weather?.windSpeed || 4} km/h Wind • NW 310°</span>
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION HUD */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-10 border-t border-white/5">
                        <div className="group cursor-default">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2 group-hover:text-brand-gold transition-colors">Course (HDG)</p>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Navigation2 className="w-4 h-4 text-brand-gold transition-transform duration-1000" style={{ transform: `rotate(${hdg}deg)` }} />
                                </div>
                                <h5 className="text-2xl font-black font-roboto"><NumberTicker value={Math.round(hdg)} />°</h5>
                            </div>
                        </div>
                        <div className="group cursor-default">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2 group-hover:text-cyan-500 transition-colors">Digital Depth (DBT)</p>
                            <h5 className="text-2xl font-black font-roboto flex items-baseline gap-2">
                                <NumberTicker value={dbt} decimalPlaces={1} />
                                <span className="text-sm text-white/20 uppercase font-black tracking-widest">Meters</span>
                            </h5>
                        </div>
                        <div className="group cursor-default">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2 group-hover:text-white transition-colors">River Levels</p>
                            <div className="flex items-center gap-3">
                                <Waves className="w-5 h-5 text-brand-gold" />
                                <h5 className="text-base font-black uppercase tracking-tighter">{weather?.dams?.[0]?.dischargeRate || 420} m³/s</h5>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <button onClick={fetchData} className="w-14 h-14 bg-white/5 hover:bg-brand-gold text-white hover:text-brand-primary-dark rounded-2xl transition-all border border-white/10 shadow-lg active:scale-95 flex items-center justify-center">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK PROTOCOLS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className={`p-8 rounded-[48px] text-left shadow-glass hover:shadow-spatial transition-all hover:-translate-y-1 group relative overflow-hidden focus:outline-none ${isAnchorArmed ? 'bg-gradient-to-br from-green-500 to-[#0A2F1F] text-white' : 'bg-[#0A2F1F] text-white'}`} onClick={() => { vibrate(50); setIsAnchorModalOpen(true); }}>
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Anchor className="w-32 h-32" /></div>
                    <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isAnchorArmed ? 'bg-white/10 text-brand-gold' : 'bg-white/10 text-brand-gold'}`}>
                            {isAnchorArmed ? <CheckCircle className="w-7 h-7" strokeWidth={3} /> : <Anchor className="w-7 h-7" strokeWidth={3} />}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isAnchorArmed ? 'text-white/60' : 'text-brand-gold'} mb-2`}>Safety Protocol</p>
                        <h4 className="text-2xl font-bold font-['Cormorant_Garamond'] italic">{isAnchorArmed ? 'Armado 50m' : 'Anchor Alarm'}</h4>
                    </div>
                </button>

                <div className="bg-white p-8 rounded-[48px] border border-brand-border/60 flex flex-col justify-between shadow-glass hover:shadow-spatial transition-shadow group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center border border-brand-border/40 group-hover:bg-brand-gold transition-colors"><CloudSun className="w-7 h-7 text-brand-gold group-hover:text-brand-primary-dark" /></div>
                        <div>
                            <h4 className="font-bold text-brand-dark font-['Cormorant_Garamond'] text-xl">Previsão Solar</h4>
                            <p className="text-[10px] uppercase font-black text-brand-muted tracking-[0.2em]">Base Régua/Pinhão</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2">Nascer Sol</p>
                            <p className="text-3xl font-roboto font-black text-brand-dark">06:42</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2">Pôr do Sol</p>
                            <p className="text-3xl font-roboto font-black text-brand-gold">20:15</p>
                        </div>
                    </div>
                </div>

                <button className="bg-red-50 p-8 rounded-[48px] border border-red-100 text-left text-red-900 shadow-glass hover:bg-red-100/30 hover:shadow-spatial transition-all hover:-translate-y-1 group relative overflow-hidden focus:outline-none" onClick={() => vibrate([100, 50, 100])}>
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform"><Siren className="w-32 h-32" /></div>
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors shadow-sm"><Radio className="w-7 h-7 text-red-600 animate-pulse" strokeWidth={3} /></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Comunicação Crítica</p>
                    <h4 className="text-2xl font-bold font-['Cormorant_Garamond'] italic">SOS Direct Line</h4>
                </button>
            </section>

            {/* MISSION LOG */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-brand-muted uppercase tracking-[0.4em] flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-brand-gold" /> Manifesto de Navegação
                    </h3>
                    <div className="px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{tasks.length} Ativos</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {tasks.length > 0 ? tasks.map(task => (
                        <SwipeAction
                            key={task.id}
                            rightActions={
                                <button
                                    onClick={() => onNavigate(AppView.SERVICE_DETAIL, task)}
                                    className="w-full h-full bg-[#0A2F1F] text-brand-gold flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-[0.3em] rounded-r-[40px] active:scale-95 transition-transform border-l border-brand-gold/20"
                                >
                                    Logbook
                                </button>
                            }
                        >
                            <button
                                onClick={() => onNavigate(AppView.SERVICE_DETAIL, task)}
                                className={`w-full bg-white p-0 rounded-[40px] border border-brand-border/60 hover:border-brand-gold/40 transition-all text-left flex flex-col shadow-glass group relative overflow-hidden ${task.status === 'IN_PROGRESS' ? 'ring-2 ring-brand-gold' : ''}`}
                            >
                                <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className={`w-20 h-20 rounded-[28px] flex flex-col items-center justify-center shadow-inner border transition-colors ${task.status === 'IN_PROGRESS' ? 'bg-[#0A2F1F] border-brand-gold text-brand-gold' : 'bg-brand-bg border-brand-border/40 text-brand-dark/40'}`}>
                                            <span className="text-lg font-black tracking-tighter">{task.time}</span>
                                            <div className="w-6 h-[2px] bg-brand-gold/30 my-1"></div>
                                            <Clock className="w-3.5 h-3.5 opacity-50" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Ship className="w-4 h-4 text-brand-gold" />
                                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">{task.boat}</p>
                                            {task.isPrivate && <span className="px-3 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest">Privado</span>}
                                        </div>
                                        <h4 className="text-3xl font-['Cormorant_Garamond'] font-bold text-brand-dark tracking-tight truncate leading-tight">{task.clientName}</h4>
                                        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-brand-border/40 w-full">
                                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-brand-muted/70">
                                                <Users className="w-4 h-4 text-brand-gold" /> {task.pax} Passageiros
                                            </div>
                                            {task.crew?.condutor && (
                                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-brand-muted/70">
                                                    <Anchor className="w-4 h-4 text-brand-gold" /> Mestre: {task.crew.condutor.split(' ')[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 self-end md:self-center">
                                        <div className="w-14 h-14 rounded-full border border-brand-border flex items-center justify-center group-hover:bg-[#0A2F1F] group-hover:text-brand-gold group-hover:border-[#0A2F1F] transition-all shadow-sm">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </SwipeAction>
                    )) : (
                        <div className="p-20 text-center glass-card rounded-[48px] opacity-20 border-2 border-dashed border-brand-border">
                            <Ship className="w-16 h-16 mx-auto mb-6 text-brand-muted" />
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-muted">Manifesto Vazio</p>
                        </div>
                    )}
                </div>
            </section>

            {/* LOGISTICS MODAL */}
            <AnimatePresence>
                {activeLogisticsTask && (
                    <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-[#070b14]/95 backdrop-blur-xl" onClick={() => setActiveLogisticsTask(null)}></motion.div>
                        <motion.div
                            initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg bg-white rounded-t-[48px] sm:rounded-[48px] p-8 pb-10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border-t border-white/20"
                        >
                            <div className="w-full flex justify-center pb-6 sm:hidden"><div className="w-12 h-1.5 bg-brand-border rounded-full"></div></div>

                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-2">{getTaskLabel(activeLogisticsTask.type)}</p>
                                    <h3 className="text-3xl font-['Cormorant_Garamond'] font-bold text-brand-dark italic">
                                        Embarcação: {fleet.find(b => b.id === activeLogisticsTask.boatId)?.name}
                                    </h3>
                                </div>
                                <button onClick={() => setActiveLogisticsTask(null)} className="w-12 h-12 flex items-center justify-center bg-brand-bg rounded-2xl text-brand-muted hover:text-brand-dark transition-colors" aria-label="Fechar Modal" title="Fechar Modal"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                                {activeLogisticsTask.notes && (
                                    <div className="bg-brand-gold/5 p-6 rounded-3xl border-l-[6px] border-brand-gold shadow-sm">
                                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">Instruções do Comando</p>
                                        <p className="text-sm font-medium text-brand-dark italic leading-relaxed">"{activeLogisticsTask.notes}"</p>
                                    </div>
                                )}

                                {activeLogisticsTask.type === 'FECHO_COMPLETO' ? (
                                    <div className="space-y-8">
                                        <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex gap-4">
                                            <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                                            <p className="text-[11px] font-bold text-orange-900 leading-normal uppercase tracking-wide">Protocolo de Evidência Digital: Fotografia dos níveis (Gasóleo/Água) é obrigatória para encerramento.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <button
                                                onClick={() => fileInputFuelRef.current?.click()}
                                                className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3 transition-all ${fuelPhoto ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'border-brand-border text-brand-muted active:scale-95'}`}
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"><Camera className="w-6 h-6" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Nível Gasóleo</span>
                                                {fuelPhoto && <CheckCircle className="w-4 h-4 shadow-2xl" />}
                                            </button>
                                            <input type="file" accept="image/*" ref={fileInputFuelRef} onChange={e => handlePhotoUpload(e, 'FUEL')} className="hidden" title="Foto do nível de combustível" aria-label="Upload de foto do nível de combustível" />

                                            <button
                                                onClick={() => fileInputWaterRef.current?.click()}
                                                className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3 transition-all ${waterPhoto ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'border-brand-border text-brand-muted active:scale-95'}`}
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"><Droplets className="w-6 h-6" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Nível Água</span>
                                                {waterPhoto && <CheckCircle className="w-4 h-4 shadow-2xl" />}
                                            </button>
                                            <input type="file" accept="image/*" ref={fileInputWaterRef} onChange={e => handlePhotoUpload(e, 'WATER')} className="hidden" title="Foto do nível de água" aria-label="Upload de foto do nível de água" />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] ml-1">Contagem Stock (Bar)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2"><Wine className="w-5 h-5 text-brand-gold" /></div>
                                                <input
                                                    type="number"
                                                    value={champagneCount}
                                                    onChange={(e) => setChampagneCount(Number(e.target.value))}
                                                    className="w-full bg-brand-bg pl-12 pr-6 py-5 rounded-3xl font-black text-brand-dark outline-none border-2 border-transparent focus:border-brand-gold transition-all text-xl"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-[#0A2F1F] p-8 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-brand-gold" strokeWidth={3} /></div>
                                            <p className="text-base font-bold text-white relative z-10">
                                                Confirmar reporte de conclusão para <br /><strong>{getTaskLabel(activeLogisticsTask.type)}</strong>?
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 flex justify-center w-full">
                                <ShimmerButton
                                    onClick={completeLogisticsTask}
                                    disabled={activeLogisticsTask.type === 'FECHO_COMPLETO' && (!fuelPhoto || !waterPhoto)}
                                    className="w-full font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-[32px] shadow-2xl"
                                    shimmerColor="#ffffff"
                                    background={activeLogisticsTask.type === 'FECHO_COMPLETO' && (!fuelPhoto || !waterPhoto) ? "#cccccc" : "#C5A028"}
                                    shimmerSize="0.1em"
                                >
                                    <span className="flex items-center gap-4 text-[#070b14]"><ShieldCheck className="w-6 h-6" strokeWidth={3} /> Submeter para Auditoria</span>
                                </ShimmerButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ANCHOR ALARM MODAL */}
            <AnimatePresence>
                {isAnchorModalOpen && (
                    <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-xl" onClick={() => setIsAnchorModalOpen(false)}></motion.div>
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white max-w-sm w-full rounded-t-[56px] sm:rounded-[56px] shadow-2xl relative z-10 overflow-hidden border-t border-white/20 pb-safe"
                        >
                            <div className={`p-10 pt-12 text-center text-white ${isAnchorArmed ? 'bg-gradient-to-br from-green-600 to-[#0A2F1F]' : 'bg-[#0A2F1F]'}`}>
                                <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-md">
                                    {isAnchorArmed ? <ShieldCheck className="w-10 h-10 text-brand-gold" strokeWidth={3} /> : <Anchor className="w-10 h-10 text-brand-gold" strokeWidth={3} />}
                                </div>
                                <h3 className="text-3xl font-black font-['Cormorant_Garamond']">{isAnchorArmed ? 'Vigilância Ativa' : 'Alarme de Fundeio'}</h3>
                                <p className="text-white/60 text-[10px] mt-2 font-black uppercase tracking-[0.4em]">Passive Safety System v2.0</p>
                            </div>
                            <div className="p-10">
                                <p className="text-sm text-brand-dark/70 text-center leading-relaxed font-medium">
                                    {isAnchorArmed
                                        ? "O perímetro de segurança (raio de 50m) está em monitorização contínua. Qualquer deriva será reportada ao Comando Central e emitirá um alerta sonoro imediato."
                                        : "O sistema irá registar as coordenadas atuais para monitorizar a posição GPS. Ative esta função sempre que estiver fundeado no Douro."}
                                </p>

                                <div className="mt-10 flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            const newState = !isAnchorArmed;
                                            setIsAnchorArmed(newState);
                                            if (newState) setVesselState('ANCHORED');
                                            setIsAnchorModalOpen(false);
                                            vibrate([100, 50, 100]);
                                        }}
                                        className={`w-full py-5 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all
                                        ${isAnchorArmed ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-brand-gold text-[#070b14] shadow-brand-gold/30 hover:bg-brand-gold/90'}
                                        `}
                                    >
                                        {isAnchorArmed ? 'Desativar Monitorização' : 'Ativar Alarme (50 metros)'}
                                    </button>
                                    <button
                                        onClick={() => setIsAnchorModalOpen(false)}
                                        className="w-full py-4 text-brand-muted hover:text-brand-dark rounded-full font-black uppercase tracking-[0.2em] text-[9px] active:scale-95 transition-all"
                                    >
                                        Pausar Sistema
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .animate-radar-sweep { animation: radar-sweep 5s linear infinite; }
                @keyframes radar-sweep {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default HomeGuide;
