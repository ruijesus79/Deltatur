
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wallet, Star, DollarSign, X, Save, Trash2, BarChart3, TrendingUp, Info, Edit2, CheckCircle, Users, Briefcase, CalendarCheck } from 'lucide-react';
import { ServiceTask, UserProfile, DailyActivity, StaffMember } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinancialsProps {
    user: UserProfile;
    tasks: ServiceTask[];
    team: StaffMember[];
    onBack?: () => void;
}

const Financials: React.FC<FinancialsProps> = ({ user, tasks, team, onBack }) => {
  const isAdmin = user.role === 'ADMIN';
  
  // Se for admin, precisamos selecionar qual staff ver. 
  // Se for staff normal, vê apenas o seu.
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  
  // Utilizador cujos dados estão a ser visualizados
  const viewUser = useMemo(() => {
      if (!isAdmin) return user;
      if (!selectedStaffId) return null;
      const staff = team.find(t => t.id === selectedStaffId);
      return staff ? { name: staff.name, email: staff.email || '', role: staff.role as any, commissionRate: 0 } as UserProfile : null;
  }, [user, isAdmin, selectedStaffId, team]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyLogs, setDailyLogs] = useState<DailyActivity[]>([]);
  const [editingDay, setEditingDay] = useState<DailyActivity | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Inicializar seleção do Admin
  useEffect(() => {
      if (isAdmin && team.length > 0 && !selectedStaffId) {
          setSelectedStaffId(team[0].id);
      }
  }, [isAdmin, team, selectedStaffId]);

  const monthName = currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load Data based on VIEW USER (not necessarily logged in user)
  useEffect(() => {
    if (!viewUser) return;

    const saved = localStorage.getItem(`deltatur_finance_logs_${viewUser.name}`);
    if (saved) {
        setDailyLogs(JSON.parse(saved));
    } else {
        // Initialize empty month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const initialLogs: DailyActivity[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            initialLogs.push({ date: dateStr, isWorked: false, baseWage: 60, tips: 0 });
        }
        setDailyLogs(initialLogs);
    }
  }, [viewUser, currentMonth, currentYear]);

  // Persistent Save
  const persistData = (logs: DailyActivity[]) => {
      if (!viewUser) return;
      localStorage.setItem(`deltatur_finance_logs_${viewUser.name}`, JSON.stringify(logs));
      setDailyLogs(logs);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const currentMonthLogs = useMemo(() => {
    return dailyLogs.filter(log => {
        const d = new Date(log.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyLogs, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const workedDays = currentMonthLogs.filter(l => l.isWorked).length;
    const daysOff = currentMonthLogs.length - workedDays;
    const attendanceRate = currentMonthLogs.length > 0 ? Math.round((workedDays / currentMonthLogs.length) * 100) : 0;
    
    // Financials (Only useful if !isAdmin)
    const totalWage = currentMonthLogs.reduce((acc, curr) => curr.isWorked ? acc + curr.baseWage : acc, 0);
    const totalTips = currentMonthLogs.reduce((acc, curr) => acc + curr.tips, 0);
    
    return { workedDays, daysOff, attendanceRate, totalWage, totalTips, totalEarned: totalWage + totalTips };
  }, [currentMonthLogs]);

  const chartData = useMemo(() => {
      return currentMonthLogs.filter(l => l.isWorked || l.tips > 0).map(l => ({
          day: new Date(l.date).getDate(),
          Base: l.isWorked ? l.baseWage : 0,
          Gorjeta: l.tips
      }));
  }, [currentMonthLogs]);

  const handleDayEdit = (log: DailyActivity) => {
    setEditingDay({ ...log });
  };

  const saveEditingDay = () => {
    if (!editingDay) return;
    const updated = dailyLogs.map(l => l.date === editingDay.date ? editingDay : l);
    persistData(updated);
    setEditingDay(null);
  };

  if (!viewUser) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div>;

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 animate-fadeIn">
       
       {/* HEADER & CONTROLS */}
       <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full xl:w-auto">
              <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-[24px]">
                  {isAdmin ? <Users className="w-8 h-8" /> : <Wallet className="w-8 h-8" />}
              </div>
              <div>
                  <h1 className="text-2xl md:text-3xl font-roboto font-bold text-brand-dark">
                      {isAdmin ? 'Gestão de Presenças' : 'Meus Ganhos'}
                  </h1>
                  <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mt-1">
                      {isAdmin ? 'Controlo de Assiduidade & Escala' : 'Gestão de Produtividade & Gorjetas'}
                  </p>
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                {isAdmin && (
                    <div className="flex items-center gap-2 overflow-x-auto max-w-[300px] md:max-w-md no-scrollbar bg-brand-bg p-2 rounded-2xl border border-brand-border">
                        {team.map(member => (
                            <button 
                                key={member.id}
                                onClick={() => setSelectedStaffId(member.id)}
                                className={`
                                    shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                                    ${selectedStaffId === member.id ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-white'}
                                `}
                            >
                                {member.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 bg-brand-bg p-2 rounded-2xl border border-brand-border ml-auto">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="text-sm font-bold text-brand-dark min-w-[140px] text-center capitalize">{monthName}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-5 h-5"/></button>
                </div>
          </div>
       </div>

       {/* DASHBOARD CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {/* Card 1: Dias Trabalhados (Comum) */}
           <div className="bg-brand-primary p-8 rounded-[32px] text-white shadow-lg flex flex-col justify-between">
                <CalendarCheck className="w-6 h-6 opacity-40 mb-4" />
                <div>
                    <h3 className="text-4xl font-black">{stats.workedDays} <span className="text-xs opacity-40">DIAS</span></h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1">Total Dias Trabalhados</p>
                </div>
           </div>

           {/* ADMIN VIEW: Folgas & Assiduidade */}
           {isAdmin ? (
               <>
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm flex flex-col justify-between">
                        <Briefcase className="w-6 h-6 text-brand-muted/40 mb-4" />
                        <div>
                            <h3 className="text-3xl font-black text-brand-dark">{stats.daysOff} <span className="text-xs opacity-40">DIAS</span></h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mt-1">Folgas / Ausências</p>
                        </div>
                </div>
                <div className="col-span-1 md:col-span-2 bg-brand-dark p-8 rounded-[32px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="w-24 h-24" /></div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-brand-gold">{stats.attendanceRate}%</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Taxa de Assiduidade Mensal</p>
                        </div>
                </div>
               </>
           ) : (
               /* STAFF VIEW: Financials */
               <>
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm flex flex-col justify-between">
                        <DollarSign className="w-6 h-6 text-brand-primary/40 mb-4" />
                        <div>
                            <h3 className="text-3xl font-black text-brand-dark">{stats.totalWage}€</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mt-1">Vencimento Base Acumulado</p>
                        </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm flex flex-col justify-between">
                        <Star className="w-6 h-6 text-brand-gold/40 mb-4" />
                        <div>
                            <h3 className="text-3xl font-black text-brand-dark">{stats.totalTips}€</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mt-1">Total Gorjetas Mensais</p>
                        </div>
                </div>
                <div className="bg-brand-dark p-8 rounded-[32px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="w-24 h-24" /></div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-brand-gold">{stats.totalEarned}€</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Total Líquido Estimado</p>
                        </div>
                </div>
               </>
           )}
       </div>

       {/* GRÁFICO (Apenas Staff vê gráfico financeiro, Admin não precisa de gráfico de assiduidade aqui) */}
       {!isAdmin && (
            <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-5 h-5 text-brand-primary" />
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Análise de Rendimento Diário</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} unit="€" />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="Base" fill="#0A2F1F" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Gorjeta" fill="#C5A028" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
       )}

       {/* TABELA DE FECHO MENSAL */}
       <div className="bg-white rounded-[40px] border border-brand-border shadow-sm overflow-hidden">
           <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
               <div>
                   <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">
                       {isAdmin ? `Folha de Presenças: ${viewUser.name}` : 'Registos de Atividade'}
                   </h3>
                   <p className="text-[10px] text-brand-muted font-medium mt-1 uppercase">
                       {isAdmin ? 'Validação de dias de trabalho' : 'Clique para editar valores e presença'}
                   </p>
               </div>
               <button 
                  onClick={() => persistData(dailyLogs)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg hover:scale-105 transition-all"
               >
                   <Save className="w-4 h-4" /> {showSaveSuccess ? 'Gravado!' : (isAdmin ? 'Guardar Presenças' : 'Gravar Todos os Registos')}
               </button>
           </div>
           
           <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                   <thead className="bg-brand-bg/50 border-b border-brand-border">
                       <tr>
                           <th className="px-8 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Data</th>
                           <th className="px-8 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest text-center">Status</th>
                           {!isAdmin && (
                               <>
                                <th className="px-8 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Base (€)</th>
                                <th className="px-8 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Gorjeta (€)</th>
                               </>
                           )}
                           <th className="px-8 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Ações</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-border">
                       {currentMonthLogs.map((log) => (
                           <tr key={log.date} className={`hover:bg-brand-bg/40 transition-colors ${log.isWorked ? 'bg-brand-primary/5' : ''}`}>
                               <td className="px-8 py-4">
                                   <p className="text-sm font-bold text-brand-dark">{new Date(log.date).toLocaleDateString('pt-PT', {day: '2-digit', month: 'short'})}</p>
                                   <p className="text-[10px] text-brand-muted font-medium uppercase">{new Date(log.date).toLocaleDateString('pt-PT', {weekday: 'long'})}</p>
                               </td>
                               <td className="px-8 py-4 text-center">
                                   <button 
                                      onClick={() => {
                                          const updated = dailyLogs.map(l => l.date === log.date ? {...l, isWorked: !l.isWorked} : l);
                                          persistData(updated);
                                      }}
                                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${log.isWorked ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}
                                   >
                                       {log.isWorked ? 'Trabalhado' : 'Folga'}
                                   </button>
                               </td>
                               {!isAdmin && (
                                   <>
                                    <td className="px-8 py-4 font-mono font-bold text-sm text-brand-dark">{log.isWorked ? log.baseWage : 0}€</td>
                                    <td className="px-8 py-4">
                                        <span className={`font-mono font-bold text-sm ${log.tips > 0 ? 'text-brand-gold' : 'text-gray-300'}`}>{log.tips}€</span>
                                    </td>
                                   </>
                               )}
                               <td className="px-8 py-4 text-right">
                                   {/* Admin só pode alternar status, não edita valores monetários */}
                                   {!isAdmin && (
                                       <button 
                                          onClick={() => handleDayEdit(log)}
                                          className="p-2.5 bg-white text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl border border-brand-border transition-all"
                                       >
                                           <Edit2 className="w-4 h-4" />
                                       </button>
                                   )}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>

       {/* MODAL DE EDIÇÃO RÁPIDA (Apenas para Staff / !Admin) */}
       {editingDay && !isAdmin && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl" onClick={() => setEditingDay(null)}></div>
               <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl animate-slideUp overflow-hidden">
                   <div className="absolute top-0 inset-x-0 h-2 bg-brand-gold"></div>
                   
                   <div className="flex justify-between items-center mb-8">
                       <div>
                           <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Ajuste de Valor</p>
                           <h3 className="text-xl font-black text-brand-dark">{new Date(editingDay.date).toLocaleDateString('pt-PT', {day: 'numeric', month: 'long'})}</h3>
                       </div>
                       <button onClick={() => setEditingDay(null)} className="p-2 hover:bg-brand-bg rounded-full"><X className="w-5 h-5"/></button>
                   </div>

                   <div className="space-y-6">
                       <div className="space-y-2">
                           <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Vencimento Base (€)</label>
                           <input 
                              type="number" 
                              value={editingDay.baseWage} 
                              onChange={e => setEditingDay({...editingDay, baseWage: Number(e.target.value)})}
                              className="w-full bg-brand-bg p-4 rounded-2xl border border-brand-border text-sm font-bold outline-none"
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Gorjeta Diária (€)</label>
                           <input 
                              type="number" 
                              value={editingDay.tips} 
                              onChange={e => setEditingDay({...editingDay, tips: Number(e.target.value)})}
                              className="w-full bg-brand-bg p-4 rounded-2xl border border-brand-border text-sm font-bold outline-none text-brand-gold"
                           />
                       </div>
                       <button 
                         onClick={saveEditingDay}
                         className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                       >
                           <CheckCircle className="w-5 h-5"/> Atualizar Registo
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* NOTIFICAÇÃO DE PERSISTÊNCIA */}
       {showSaveSuccess && (
           <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[300] bg-brand-dark text-white px-8 py-4 rounded-full shadow-2xl border border-brand-gold/30 flex items-center gap-3 animate-slideUp">
               <CheckCircle className="w-5 h-5 text-brand-gold" />
               <span className="text-xs font-bold uppercase tracking-widest">Dados Sincronizados Localmente</span>
           </div>
       )}
    </div>
  );
};

export default Financials;
