
// App.tsx: Gestor Central de Estado e Navegação
import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, ServiceTask, Boat, KnowledgeArticle, GalleryImage, AppNotification, DocumentResource, StaffMember, EmergencyContact, LogisticsTaskEntry, NavStatus } from './types';
import Login from './views/Login';
import HomeLanding from './views/HomeLanding';
import HomeGuide from './views/HomeGuide';
import AdminDashboard from './views/AdminDashboard';
import ServiceDetail from './views/ServiceDetail';
import GuideContent from './views/GuideContent';
import Financials from './views/Financials';
import MarketingStudio from './views/MarketingStudio';
import StressTest from './views/StressTest';
import RadioOps from './views/RadioOps';
import AppTutorial from './views/AppTutorial';
import { Home, Info, DollarSign, Menu, X, Settings, LogOut, Shield, Bell, CheckCircle, AlertTriangle, Info as InfoIcon, BookOpen, Radio, Ship, LayoutGrid, ChevronRight, Zap, InfoIcon as LocalInfo } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { INITIAL_FLEET, INITIAL_TEAM, INITIAL_GUIDES, PARTNERS, SERVICE_TYPES, INITIAL_KNOWLEDGE_BASE, INITIAL_GALLERY, INITIAL_EMERGENCY_CONTACTS } from './data/companyData';
import { mediaDB } from './services/storageService';
import { getNavigationNotices } from './services/geminiService';

const INITIAL_TASKS: ServiceTask[] = [
    {
        id: '1',
        time: '09:30',
        clientName: 'Manuel Porto (Privado)',
        isPrivate: true,
        boat: 'Delta III',
        pax: 4,
        assignedGuides: ['Caria'],
        type: 'Passeio de Barco Privado',
        status: 'IN_PROGRESS',
        notes: 'Cliente VIP antigo. Paragem na Quinta do Bomfim para prova.',
        estimatedValue: 450,
        crew: { condutor: 'Rui Jesus', assistente: 'Leandro', guia: 'Caria' }
    }
];

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [preselectedRole, setPreselectedRole] = useState<'GUIDE' | 'ADMIN'>('GUIDE');

    const [tasks, setTasks] = useState<ServiceTask[]>([]);
    const [fleet, setFleet] = useState<Boat[]>([]);
    const [team, setTeam] = useState<StaffMember[]>([]);
    // Novo State para Logística Granular
    const [logisticsRegistry, setLogisticsRegistry] = useState<LogisticsTaskEntry[]>([]);

    const [guides, setGuides] = useState<string[]>([]);
    const [partners, setPartners] = useState<string[]>([]);
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [documents, setDocuments] = useState<DocumentResource[]>([]);
    const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Navigation Intelligence Shared State
    const [navStatus, setNavStatus] = useState<NavStatus | null>(null);
    const [isUpdatingNav, setIsUpdatingNav] = useState(false);

    const pushNotification = (title: string, message: string, type: 'INFO' | 'ALERT' | 'SUCCESS' = 'INFO') => {
        const newNotif: AppNotification = {
            id: Date.now().toString() + Math.random().toString(),
            title, message, type, timestamp: new Date()
        };
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
    };

    // Motor de Monitorização de Alertas (Executa a cada 60s)
    useEffect(() => {
        if (!user) return; // Só corre se houver utilizador logado

        const checkUpcomingTasks = () => {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;

            setTasks(currentTasks => {
                let hasUpdates = false;
                const updatedTasks = currentTasks.map(task => {
                    // Ignorar tarefas concluídas ou já notificadas
                    if (task.status === 'DONE' || task.notifiedSoon) return task;

                    const [tHours, tMinutes] = task.time.split(':').map(Number);
                    const taskTimeInMinutes = tHours * 60 + tMinutes;
                    const diff = taskTimeInMinutes - currentTimeInMinutes;

                    // Alerta se faltarem 15 minutos ou menos (e a tarefa for futura)
                    if (diff > 0 && diff <= 15) {
                        pushNotification(
                            "Preparação Imediata",
                            `O serviço de ${task.clientName} (${task.boat}) inicia em ${diff} min.`,
                            "ALERT"
                        );
                        hasUpdates = true;
                        return { ...task, notifiedSoon: true };
                    }
                    return task;
                });

                return hasUpdates ? updatedTasks : currentTasks;
            });
        };

        const intervalId = setInterval(checkUpcomingTasks, 60000); // Check every 60s
        checkUpcomingTasks(); // Check immediately on mount/login

        return () => clearInterval(intervalId);
    }, [user]); // Re-run effect only when user logs in/out

    useEffect(() => {
        const safeParse = (key: string, fallback: any) => {
            const item = localStorage.getItem(key);
            if (!item) return fallback;
            try { return JSON.parse(item); } catch (e) { return fallback; }
        };
        setTasks(safeParse('deltatur_db_tasks_v2', INITIAL_TASKS));
        setFleet(safeParse('deltatur_db_fleet_v2', INITIAL_FLEET));
        setTeam(safeParse('deltatur_db_team_v3', INITIAL_TEAM));
        setLogisticsRegistry(safeParse('deltatur_db_logistics', [])); // Carrega logística
        setGuides(safeParse('deltatur_db_guides', INITIAL_GUIDES));
        setPartners(safeParse('deltatur_db_partners', PARTNERS));
        setServiceTypes(safeParse('deltatur_db_types', SERVICE_TYPES));
        setEmergencyContacts(safeParse('deltatur_db_emergency', INITIAL_EMERGENCY_CONTACTS));

        const loadMedia = async () => {
            try {
                const galleryData = await mediaDB.gallery.load();
                setGallery(galleryData.length > 0 ? galleryData : INITIAL_GALLERY);
                const kbData = await mediaDB.knowledgeBase.load();
                setKnowledgeBase(kbData.length > 0 ? kbData : INITIAL_KNOWLEDGE_BASE);
                const docData = await mediaDB.documents.load();
                setDocuments(docData);
            } catch (e) { console.error(e); }
        };
        loadMedia();

        // REAL-TIME SYNC (Local Storage Event Listener)
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                switch (e.key) {
                    case 'deltatur_db_tasks_v2':
                        setTasks(parsed);
                        if (user?.role === 'GUIDE') pushNotification("Agenda Atualizada", "O Admin fez alterações na escala (Tempo Real)", "INFO");
                        break;
                    case 'deltatur_db_fleet_v2':
                        setFleet(parsed);
                        break;
                    case 'deltatur_db_logistics':
                        setLogisticsRegistry(parsed);
                        if (user?.role === 'GUIDE') pushNotification("Logística Atualizada", "Novos abastecimentos registados", "INFO");
                        break;
                    case 'deltatur_db_chat':
                        if (parsed && parsed.length > 0) {
                            const lastMsg = parsed[parsed.length - 1];
                            if (lastMsg.senderName !== user?.name) {
                                pushNotification(`Nova Mensagem: ${lastMsg.senderName}`, lastMsg.text, 'INFO');
                            }
                        }
                        break;
                    // Add other syncs as necessary
                }
            } catch (error) {
                console.error("Sync error:", error);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user]);

    const updateKB = (items: KnowledgeArticle[]) => { setKnowledgeBase(items); mediaDB.knowledgeBase.save(items); };
    const updateGallery = (items: GalleryImage[]) => { setGallery(items); mediaDB.gallery.save(items); };
    const updateDocuments = (items: DocumentResource[]) => { setDocuments(items); mediaDB.documents.save(items); };

    // Persistência Logística
    const updateLogistics = (items: LogisticsTaskEntry[]) => {
        setLogisticsRegistry(items);
        localStorage.setItem('deltatur_db_logistics', JSON.stringify(items));
    };

    const fetchNavNotices = async () => {
        setIsUpdatingNav(true);
        try {
            const data = await getNavigationNotices();
            setNavStatus(data);
            pushNotification("Inteligência Douro", "Dados sintetizados com sucesso através de IA.", "SUCCESS");
        } catch (e) {
            console.error(e);
            pushNotification("Erro de Sincronização", "Não foi possível contactar o motor de IA.", "ALERT");
        } finally {
            setIsUpdatingNav(false);
        }
    };

    const handleLogin = (loggedInUser: UserProfile) => {
        setUser(loggedInUser);
        setCurrentView(loggedInUser.role === 'ADMIN' ? AppView.ADMIN_DASHBOARD : AppView.HOME);
    };

    const handleLogout = () => {
        setUser(null); setIsMenuOpen(false); setCurrentView(AppView.LANDING);
    };

    const navigateTo = (view: AppView) => { setCurrentView(view); setIsMenuOpen(false); };

    const renderContent = () => {
        const goBackToDash = () => setCurrentView(user?.role === 'ADMIN' ? AppView.ADMIN_DASHBOARD : AppView.HOME);

        switch (currentView) {
            case AppView.HOME: return (
                <HomeGuide
                    user={user!}
                    tasks={tasks}
                    onNavigate={(v, t) => { if (t) setSelectedTask(t); setCurrentView(v); }}
                    fleet={fleet}
                    team={team}
                    onUpdateFleet={setFleet}
                    logisticsRegistry={logisticsRegistry}
                    onUpdateLogistics={updateLogistics}
                    navStatus={navStatus}
                    isUpdatingNav={isUpdatingNav}
                    onRefreshNav={fetchNavNotices}
                />
            );
            case AppView.ADMIN_DASHBOARD:
                return (
                    <AdminDashboard
                        tasks={tasks} fleet={fleet} team={team} guides={guides} partners={partners}
                        serviceTypes={serviceTypes} knowledgeBase={knowledgeBase} gallery={gallery} documents={documents}
                        logisticsRegistry={logisticsRegistry}
                        navStatus={navStatus}
                        isUpdatingNav={isUpdatingNav}
                        onRefreshNav={fetchNavNotices}
                        onAddTask={t => setTasks(prev => [...prev, t])} onUpdateTask={t => setTasks(prev => prev.map(old => old.id === t.id ? t : old))}
                        onDeleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))} onUpdateFleet={setFleet} onUpdateTeam={setTeam}
                        onUpdateGuides={setGuides} onUpdatePartners={setPartners} onUpdateServiceTypes={setServiceTypes}
                        onUpdateKB={updateKB} onUpdateGallery={updateGallery} onUpdateDocuments={updateDocuments}
                        onUpdateLogistics={updateLogistics}
                        onNavigate={setCurrentView} notify={pushNotification}
                    />
                );
            case AppView.ADMIN_CONFIG:
                return (
                    <AdminDashboard
                        tasks={tasks} fleet={fleet} team={team} guides={guides} partners={partners}
                        serviceTypes={serviceTypes} knowledgeBase={knowledgeBase} gallery={gallery} documents={documents}
                        logisticsRegistry={logisticsRegistry}
                        initialTab="CONFIG"
                        navStatus={navStatus}
                        isUpdatingNav={isUpdatingNav}
                        onRefreshNav={fetchNavNotices}
                        onAddTask={t => setTasks(prev => [...prev, t])} onUpdateTask={t => setTasks(prev => prev.map(old => old.id === t.id ? t : old))}
                        onDeleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))} onUpdateFleet={setFleet} onUpdateTeam={setTeam}
                        onUpdateGuides={setGuides} onUpdatePartners={setPartners} onUpdateServiceTypes={setServiceTypes}
                        onUpdateKB={updateKB} onUpdateGallery={updateGallery} onUpdateDocuments={updateDocuments}
                        onUpdateLogistics={updateLogistics}
                        onNavigate={setCurrentView} notify={pushNotification}
                    />
                );
            case AppView.RADIO_OPS: return <RadioOps onBack={goBackToDash} user={user!} />;
            case AppView.STRESS_TEST: return <StressTest onBack={goBackToDash} fleet={fleet} team={team} />;
            case AppView.SERVICE_DETAIL: return <ServiceDetail task={selectedTask} onBack={goBackToDash} onUpdate={t => setTasks(prev => prev.map(old => old.id === t.id ? t : old))} fleet={fleet} />;
            case AppView.GUIDE_CONTENT:
                return (
                    <GuideContent
                        knowledgeBase={knowledgeBase}
                        gallery={gallery}
                        documents={documents}
                        emergencyContacts={emergencyContacts}
                        isAdmin={user?.role === 'ADMIN'}
                        onUpdateEmergency={setEmergencyContacts}
                        onUpdateGallery={updateGallery}
                        onBack={goBackToDash}
                    />
                );
            case AppView.FINANCIALS: return <Financials user={user!} team={team} tasks={tasks} onBack={goBackToDash} />;
            case AppView.MARKETING: return <MarketingStudio onBack={goBackToDash} />;
            case AppView.TUTORIAL: return <AppTutorial onBack={goBackToDash} user={user!} />;
            default: return null;
        }
    };

    if (currentView === AppView.LANDING) return <HomeLanding onSelectRole={role => { setPreselectedRole(role); setCurrentView(AppView.LOGIN); }} heroImage="" />;
    if (currentView === AppView.LOGIN || !user) return <Login onLogin={handleLogin} initialMode={preselectedRole} onBack={() => setCurrentView(AppView.LANDING)} teamList={team} />;

    return (
        <div className="flex flex-col h-screen bg-brand-bg text-brand-text overflow-hidden font-sans relative">
            <header className="h-16 px-6 glass flex items-center justify-between z-20 shrink-0 sticky top-0 border-b border-brand-border/40 shadow-sm">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(user.role === 'ADMIN' ? AppView.ADMIN_DASHBOARD : AppView.HOME)}>
                    <BrandLogo variant="icon" />
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Deltatur</p>
                        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-brand-muted">Ops Core v2.9.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        title="Abrir Menu"
                        className="hidden md:flex p-2.5 bg-brand-bg hover:bg-white rounded-2xl border border-brand-border/50 text-brand-muted hover:text-brand-primary transition-all shadow-sm active:scale-95 items-center justify-center"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
                        <div className="p-8 border-b border-brand-border/50 flex items-center justify-between bg-brand-bg/30">
                            <div><p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Navegação</p><h3 className="text-xl font-roboto font-bold text-brand-dark">Menu Principal</h3></div>
                            <button onClick={() => setIsMenuOpen(false)} title="Fechar Menu" className="p-2 hover:bg-white rounded-full text-brand-muted transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <p className="px-4 py-2 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-4">Operações</p>
                            <button onClick={() => navigateTo(user.role === 'ADMIN' ? AppView.ADMIN_DASHBOARD : AppView.HOME)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.HOME || currentView === AppView.ADMIN_DASHBOARD ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><LayoutGrid className="w-5 h-5" /><span className="font-bold text-sm">{user.role === 'ADMIN' ? 'Consola Admin (Agenda)' : 'Agenda / Escala'}</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            <button onClick={() => navigateTo(AppView.GUIDE_CONTENT)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.GUIDE_CONTENT ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><Zap className="w-5 h-5" /><span className="font-bold text-sm">Concierge & Info Hub</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            <button onClick={() => navigateTo(AppView.RADIO_OPS)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.RADIO_OPS ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><Radio className="w-5 h-5" /><span className="font-bold text-sm">Radio Ops (Voz)</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            <button onClick={() => navigateTo(AppView.TUTORIAL)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.TUTORIAL ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><InfoIcon className="w-5 h-5" /><span className="font-bold text-sm">Como Funciona a App?</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>

                            <p className="px-4 py-2 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-6">Gestão</p>
                            {user.role === 'ADMIN' && (
                                <button onClick={() => navigateTo(AppView.ADMIN_CONFIG)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.ADMIN_CONFIG ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><Settings className="w-5 h-5" /><span className="font-bold text-sm">Configurações (Admin)</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            )}
                            <button onClick={() => navigateTo(AppView.FINANCIALS)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.FINANCIALS ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><DollarSign className="w-5 h-5" /><span className="font-bold text-sm">{user.role === 'ADMIN' ? 'Produtividade Staff' : 'Meus Ganhos'}</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            {user.role === 'ADMIN' && (
                                <button onClick={() => navigateTo(AppView.MARKETING)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentView === AppView.MARKETING ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg text-brand-dark'}`}><div className="flex items-center gap-4"><Zap className="w-5 h-5" /><span className="font-bold text-sm">Marketing Studio (Admin)</span></div><ChevronRight className="w-4 h-4 opacity-30" /></button>
                            )}
                        </div>
                        <div className="p-6 border-t border-brand-border/50 bg-brand-bg/30">
                            <div className="flex items-center gap-4 mb-6 px-2"><div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">{user.name.charAt(0)}</div><div className="overflow-hidden"><p className="text-sm font-bold text-brand-dark truncate">{user.name}</p><p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{user.role}</p></div></div>
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors active:scale-95"><LogOut className="w-5 h-5" /><span>Terminar Sessão</span></button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:pb-6 bg-brand-bg">
                <div className="max-w-6xl mx-auto h-full">{renderContent()}</div>
            </main>

            {/* M3 EXPRESSIVE MOBILE BOTTOM NAVIGATION BAR */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[32px] z-50 flex items-center justify-around px-2 py-2 shadow-spatial">
                {user.role === 'ADMIN' ? (
                    <>
                        <button onClick={() => navigateTo(AppView.ADMIN_DASHBOARD)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.ADMIN_DASHBOARD ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <LayoutGrid className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.ADMIN_DASHBOARD ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Comando</span>
                        </button>
                        <button onClick={() => navigateTo(AppView.ADMIN_CONFIG)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.ADMIN_CONFIG ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <Settings className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.ADMIN_CONFIG ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Config</span>
                        </button>
                        <button onClick={() => navigateTo(AppView.MARKETING)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.MARKETING ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <Zap className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.MARKETING ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Market</span>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 text-brand-muted hover:bg-brand-bg`}>
                            {user.photoUrl ? (
                                <img src={user.photoUrl} alt="Menu" className="w-6 h-6 rounded-full mb-1 object-cover border border-brand-border" />
                            ) : (
                                <Menu className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">Mais</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigateTo(AppView.HOME)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.HOME || currentView === AppView.SERVICE_DETAIL ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <LayoutGrid className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.HOME || currentView === AppView.SERVICE_DETAIL ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Agenda</span>
                        </button>
                        <button onClick={() => navigateTo(AppView.GUIDE_CONTENT)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.GUIDE_CONTENT ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <Zap className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.GUIDE_CONTENT ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Hub</span>
                        </button>
                        <button onClick={() => navigateTo(AppView.RADIO_OPS)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 ${currentView === AppView.RADIO_OPS ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg'}`}>
                            <Radio className={`w-5 h-5 mb-1 transition-transform ${currentView === AppView.RADIO_OPS ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Rádio</span>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-[24px] transition-all duration-300 text-brand-muted hover:bg-brand-bg`}>
                            {user.photoUrl ? (
                                <img src={user.photoUrl} alt="Menu" className="w-6 h-6 rounded-full mb-1 object-cover border border-brand-border" />
                            ) : (
                                <Menu className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">Mais</span>
                        </button>
                    </>
                )}
            </nav>

            <div className="fixed bottom-24 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto animate-slideUp bg-white p-5 rounded-[24px] shadow-2xl border border-brand-border flex items-start gap-4 max-w-sm backdrop-blur-md">
                        <div className={`p-3 rounded-2xl shrink-0 ${n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : (n.type === 'ALERT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600')}`}>
                            {n.type === 'SUCCESS' ? <CheckCircle className="w-6 h-6" /> : (n.type === 'ALERT' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <InfoIcon className="w-6 h-6" />)}
                        </div>
                        <div>
                            <h4 className="font-black text-brand-dark text-sm uppercase tracking-tight">{n.title}</h4>
                            <p className="text-xs font-medium text-brand-muted mt-1 leading-relaxed">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
