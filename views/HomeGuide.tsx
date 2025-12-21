
import React, { useState, useEffect, useRef } from 'react';
import { ServiceTask, UserProfile, AppView, WeatherConditions, Boat, StaffMember, LogisticsTaskEntry, LogisticsTaskType } from '../types';
import { 
  Ship, ChevronRight, Waves, Zap, AlertTriangle, ShieldCheck, 
  Thermometer, Wind, RefreshCw, Loader2, Info, Navigation2, 
  Map as MapIcon, Calendar, Clock, Users, MapPin, 
  FileText, ExternalLink, Siren, CloudSun, Radar, Wine, User, Anchor, FileWarning, CheckSquare, Camera, CheckCircle, X, Droplets, MessageCircle
} from 'lucide-react';
import { getLiveWeatherAndRiverConditions, getPredictiveRiverSafety } from '../services/geminiService';

interface HomeGuideProps {
  user: UserProfile;
  tasks: ServiceTask[];
  onNavigate: (view: AppView, task?: ServiceTask) => void;
  // Passing Fleet for logistics check
  fleet?: Boat[]; 
  team?: StaffMember[]; // Needed to find user ID
  onUpdateFleet?: (f: Boat[]) => void;
  logisticsRegistry?: LogisticsTaskEntry[];
  onUpdateLogistics?: (items: LogisticsTaskEntry[]) => void;
}

const HomeGuide: React.FC<HomeGuideProps> = ({ user, tasks, onNavigate, fleet = [], team = [], onUpdateFleet, logisticsRegistry = [], onUpdateLogistics }) => {
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSunsetMode, setIsSunsetMode] = useState(false);

  // Logistics Modal State
  const [activeLogisticsTask, setActiveLogisticsTask] = useState<LogisticsTaskEntry | null>(null);
  const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
  const [waterPhoto, setWaterPhoto] = useState<string | null>(null);
  const [champagneCount, setChampagneCount] = useState<number>(0);
  const fileInputFuelRef = useRef<HTMLInputElement>(null);
  const fileInputWaterRef = useRef<HTMLInputElement>(null);

  // Find current staff ID based on user email/name
  const currentStaffId = team.find(t => t.name === user.name || t.email === user.email)?.id;
  const todayDate = new Date().toISOString().split('T')[0];

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
    const hour = new Date().getHours();
    if (hour >= 18 || hour <= 7) {
      setIsSunsetMode(true);
      document.body.classList.add('sunset-glow');
    } else {
      setIsSunsetMode(false);
      document.body.classList.remove('sunset-glow');
    }
    return () => document.body.classList.remove('sunset-glow');
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
              ...t, 
              status: 'DONE', 
              completedAt: new Date().toISOString(),
              fuelPhoto: fuelPhoto || undefined,
              waterPhoto: waterPhoto || undefined,
              champagneStock: champagneCount
          } as LogisticsTaskEntry;
      });
      
      onUpdateLogistics(updatedRegistry);
      setActiveLogisticsTask(null);
      setFuelPhoto(null);
      setWaterPhoto(null);
      setChampagneCount(0);
  };

  // Filtrar tarefas atribuídas ao utilizador hoje
  const myPendingTasks = logisticsRegistry.filter(t => 
      t.staffId === currentStaffId && 
      t.date === todayDate && 
      t.status === 'PENDING'
  );

  const getTaskLabel = (type: LogisticsTaskType) => {
      switch(type) {
          case 'PREP_BARCO': return 'Preparação Geral';
          case 'DEGUSTACAO': return 'Mise en Place Degustação';
          case 'ABASTECER_COMB': return 'Abastecer Combustível';
          case 'ABASTECER_AGUA': return 'Abastecimento Água';
          case 'FECHO_COMPLETO': return 'Protocolo de Fecho (PM)';
          default: return type;
      }
  };

  const getTaskIcon = (type: LogisticsTaskType) => {
      switch(type) {
          case 'PREP_BARCO': return CheckSquare;
          case 'DEGUSTACAO': return Wine;
          case 'ABASTECER_COMB': return Zap;
          case 'ABASTECER_AGUA': return Droplets;
          case 'FECHO_COMPLETO': return Camera;
          default: return CheckCircle;
      }
  };

  return (
    <div className={`pb-32 max-w-6xl mx-auto px-4 animate-fadeIn space-y-8 mt-6`}>
      
      {/* 1. SPATIAL WELCOME HEADER */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 glass-card rounded-[40px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group shadow-glass border border-brand-border/40">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <Waves className="w-56 h-56 text-brand-primary" />
            </div>
            <div className="relative z-10">
                <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-3">Staff Protocol</p>
                <h2 className="text-3xl md:text-4xl font-roboto font-black text-brand-dark tracking-tighter leading-none">
                    Olá, <span className="text-brand-primary">{user.name.split(' ')[0]}</span>.
                </h2>
                <p className="text-brand-muted text-xs md:text-sm mt-3 font-medium">O rio está {weather ? weather.condition.toLowerCase() : 'calmo'} hoje. Bom turno.</p>
            </div>
        </div>
        <div className="liquid-bg rounded-[40px] p-8 text-white flex flex-col items-center justify-center text-center shadow-spatial overflow-hidden group">
            <div className="w-20 h-20 rounded-[28px] bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center font-black text-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
                {user.name.charAt(0)}
            </div>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] text-brand-gold">{user.role}</p>
        </div>
      </section>

      {/* 2. LOGISTICS MISSIONS (NEW GRANULAR SECTION) */}
      {myPendingTasks.length > 0 && (
          <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-brand-gold" /> Protocolos Logísticos
                  </h3>
                  <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">Ação Requerida</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPendingTasks.map(task => {
                      const boat = fleet.find(b => b.id === task.boatId);
                      const Icon = getTaskIcon(task.type);
                      
                      return (
                          <button 
                            key={task.id}
                            onClick={() => setActiveLogisticsTask(task)}
                            className={`p-6 rounded-[32px] border-l-8 border-y border-r shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group
                                ${task.type === 'FECHO_COMPLETO' ? 'bg-brand-dark border-brand-primary border-gray-800' : 'bg-white border-brand-gold border-gray-200'}
                            `}
                          >
                              <div>
                                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${task.type === 'FECHO_COMPLETO' ? 'text-brand-primary' : 'text-brand-gold'}`}>
                                      {task.type === 'FECHO_COMPLETO' ? 'Missão Crítica' : 'Tarefa Operacional'}
                                  </p>
                                  <h4 className={`text-lg font-black ${task.type === 'FECHO_COMPLETO' ? 'text-white' : 'text-brand-dark'}`}>
                                      {getTaskLabel(task.type)}
                                  </h4>
                                  <p className={`text-xs mt-1 ${task.type === 'FECHO_COMPLETO' ? 'text-white/60' : 'text-brand-muted'}`}>
                                      Embarcação: {boat?.name || 'Geral'}
                                  </p>
                                  {task.notes && (
                                      <div className={`mt-3 p-2 rounded-lg text-[10px] font-medium italic ${task.type === 'FECHO_COMPLETO' ? 'bg-white/10 text-white/80' : 'bg-brand-bg text-brand-dark'}`}>
                                          "{task.notes}"
                                      </div>
                                  )}
                              </div>
                              <Icon className={`w-6 h-6 group-hover:scale-110 transition-transform ${task.type === 'FECHO_COMPLETO' ? 'text-white' : 'text-brand-muted'}`} />
                          </button>
                      );
                  })}
              </div>
          </section>
      )}

      {/* 3. BENTO GRID TELEMETRY (LIVE DATA) */}
      <section className="bg-brand-dark rounded-[48px] p-8 md:p-10 shadow-spatial relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Zap className="w-48 h-48 text-white" />
          </div>
          
          <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-brand-gold rounded-3xl flex items-center justify-center shadow-gold-glow animate-float">
                        <ShieldCheck className="text-brand-primary w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-white font-roboto font-black text-2xl uppercase tracking-tighter">Cockpit Oficial</h3>
                        <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-80">
                            Pinhão • Douro
                        </p>
                    </div>
                </div>
                <button onClick={fetchData} className="p-3 bg-white/10 rounded-2xl text-white/40 hover:text-brand-gold hover:bg-white/20 transition-all border border-white/5">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <RefreshCw className="w-5 h-5"/>}
                </button>
              </div>

              {/* Dynamic Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-center spatial-layer">
                      <p className="text-[9px] text-white/40 font-black uppercase mb-1 tracking-widest">Barragens</p>
                      <p className="text-white font-mono font-bold text-xl">{weather?.dams?.[0]?.dischargeRate || '---'}</p>
                      <p className="text-[8px] text-brand-gold font-bold uppercase mt-1">Descarga (m³/s)</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-center spatial-layer">
                      <p className="text-[9px] text-white/40 font-black uppercase mb-1 tracking-widest">Vento</p>
                      <div className="flex items-center justify-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-brand-gold" />
                          <p className="text-white font-mono font-bold text-xl">{weather?.windSpeed || '---'}</p>
                      </div>
                      <p className="text-[8px] text-brand-gold font-bold uppercase mt-1">{weather?.windDirection || 'VAR'} km/h</p>
                  </div>
                   <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-center spatial-layer col-span-2 md:col-span-2 flex flex-col justify-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                         <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Alerta Preditivo (6h)</p>
                         {weather?.riskLevel === 'HIGH' && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse"/>}
                      </div>
                      <p className="text-white font-medium text-xs leading-tight opacity-90">
                        {weather?.predictiveAlert || 'Analisando tendências hidrográficas...'}
                      </p>
                  </div>
              </div>

              {/* Quick Links (Compact) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
                 <a href="https://www.ipma.pt" target="_blank" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest border border-white/5 whitespace-nowrap">IPMA Radar</a>
                 <a href="https://geoanavnet.hidrografico.pt/" target="_blank" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest border border-white/5 whitespace-nowrap">Hidrográfico</a>
                 <a href="https://www.amn.pt" target="_blank" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest border border-white/5 whitespace-nowrap">Edital 185</a>
              </div>
          </div>
      </section>

      {/* 4. MISSION LOG (Tasks) */}
      <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" /> Missões do Dia
              </h3>
              <span className="text-[10px] font-bold text-brand-muted uppercase">{tasks.length} Agendadas</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
              {tasks.length > 0 ? tasks.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => onNavigate(AppView.SERVICE_DETAIL, task)}
                    className={`bg-white p-0 rounded-[32px] border border-brand-border hover:border-brand-primary transition-all text-left flex flex-col shadow-sm group relative overflow-hidden ${task.status === 'IN_PROGRESS' ? 'ring-2 ring-brand-gold border-brand-gold' : ''}`}
                  >
                      {/* Progress Indicator Strip */}
                      {task.status === 'IN_PROGRESS' && <div className="absolute top-0 inset-x-0 h-1 bg-brand-gold animate-pulse"></div>}

                      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                          
                          {/* Time & Boat Pod */}
                          <div className="flex items-center gap-4 shrink-0">
                              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-inner border border-brand-border/50 ${task.status === 'IN_PROGRESS' ? 'bg-brand-primary text-brand-gold' : 'bg-brand-bg text-brand-primary'}`}>
                                  <span className="text-xs font-black">{task.time}</span>
                                  <Clock className="w-3 h-3 opacity-50 mt-0.5" />
                              </div>
                              <div className="hidden md:block w-px h-10 bg-brand-border"></div>
                          </div>

                          {/* Info Core */}
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                  <Ship className="w-3.5 h-3.5 text-brand-gold" />
                                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{task.boat}</p>
                                  {task.isPrivate && <span className="px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-dark text-[8px] font-bold uppercase tracking-wide">Privado</span>}
                              </div>
                              <h4 className="text-xl font-bold text-brand-dark tracking-tight truncate leading-tight">{task.clientName}</h4>
                              <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-brand-muted">
                                      <Users className="w-3 h-3" /> {task.pax} Pax
                                  </div>
                                  {task.crew?.condutor && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-brand-muted">
                                        <Anchor className="w-3 h-3 text-brand-primary" /> Skipper {task.crew.condutor.split(' ')[0]}
                                    </div>
                                  )}
                              </div>
                              {/* OBSERVAÇÕES IMPORTANTES - ADICIONADO PARA STAFF VER */}
                              {task.notes && (
                                  <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-3">
                                      <MessageCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5"/>
                                      <div>
                                          <p className="text-[9px] font-black uppercase text-brand-gold tracking-widest mb-0.5">Observações Importantes</p>
                                          <p className="text-xs font-medium text-brand-dark leading-snug">{task.notes}</p>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* Action */}
                          <div className="shrink-0 self-end md:self-center">
                              <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                  <ChevronRight className="w-5 h-5" />
                              </div>
                          </div>
                      </div>
                  </button>
              )) : (
                  <div className="p-12 text-center glass-card rounded-[32px] opacity-40">
                      <Calendar className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Sem serviços agendados para hoje</p>
                  </div>
              )}
          </div>
      </section>

      {/* LOGISTICS MODAL */}
      {activeLogisticsTask && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={() => setActiveLogisticsTask(null)}></div>
              <div className="relative w-full max-w-lg bg-white rounded-[48px] p-8 shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-1">
                              {getTaskLabel(activeLogisticsTask.type)}
                          </p>
                          <h3 className="text-2xl font-black text-brand-dark">
                              {fleet.find(b => b.id === activeLogisticsTask.boatId)?.name}
                          </h3>
                      </div>
                      <button onClick={() => setActiveLogisticsTask(null)} className="p-3 hover:bg-brand-bg rounded-2xl"><X className="w-6 h-6"/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                      {/* NOTAS ESPECÍFICAS DA TAREFA */}
                      {activeLogisticsTask.notes && (
                          <div className="bg-brand-bg p-4 rounded-2xl border-l-4 border-brand-primary">
                              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Instruções Específicas</p>
                              <p className="text-sm font-medium text-brand-dark italic">"{activeLogisticsTask.notes}"</p>
                          </div>
                      )}

                      {activeLogisticsTask.type === 'FECHO_COMPLETO' ? (
                          <div className="space-y-6">
                              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3">
                                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0"/>
                                  <p className="text-xs font-medium text-red-700">Para concluir o fecho, é <strong>obrigatório</strong> tirar foto aos níveis de combustível e água.</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <button 
                                      onClick={() => fileInputFuelRef.current?.click()}
                                      className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${fuelPhoto ? 'bg-green-50 border-green-500 text-green-700' : 'border-brand-border text-brand-muted'}`}
                                  >
                                      <Camera className="w-6 h-6"/>
                                      <span className="text-[10px] font-bold uppercase">Combustível</span>
                                      {fuelPhoto && <CheckCircle className="w-4 h-4"/>}
                                  </button>
                                  <input type="file" accept="image/*" ref={fileInputFuelRef} onChange={e => handlePhotoUpload(e, 'FUEL')} className="hidden" capture="environment" />

                                  <button 
                                      onClick={() => fileInputWaterRef.current?.click()}
                                      className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${waterPhoto ? 'bg-green-50 border-green-500 text-green-700' : 'border-brand-border text-brand-muted'}`}
                                  >
                                      <Droplets className="w-6 h-6"/>
                                      <span className="text-[10px] font-bold uppercase">Água</span>
                                      {waterPhoto && <CheckCircle className="w-4 h-4"/>}
                                  </button>
                                  <input type="file" accept="image/*" ref={fileInputWaterRef} onChange={e => handlePhotoUpload(e, 'WATER')} className="hidden" capture="environment" />
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Garrafas Champagne (Restantes)</label>
                                  <input 
                                      type="number" 
                                      value={champagneCount}
                                      onChange={(e) => setChampagneCount(Number(e.target.value))}
                                      className="w-full bg-brand-bg p-4 rounded-2xl font-bold text-brand-dark outline-none border border-transparent focus:border-brand-primary"
                                  />
                              </div>
                          </div>
                      ) : (
                          // TAREFAS SIMPLES (PREP, DEGUSTAÇÃO, ETC)
                          <div className="space-y-4">
                              <div className="bg-brand-bg p-6 rounded-3xl text-center">
                                  <p className="text-sm font-medium text-brand-muted">
                                      Confirmo que a tarefa <strong>{getTaskLabel(activeLogisticsTask.type)}</strong> foi realizada com sucesso na embarcação.
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={completeLogisticsTask}
                      disabled={activeLogisticsTask.type === 'FECHO_COMPLETO' && (!fuelPhoto || !waterPhoto)}
                      className="mt-6 w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                      Confirmar Conclusão
                  </button>
              </div>
          </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default HomeGuide;
