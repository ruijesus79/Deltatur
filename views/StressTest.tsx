
import React, { useState } from 'react';
import { FlaskConical, Play, Loader2, AlertTriangle, ShieldCheck, Zap, ArrowLeft, BrainCircuit, Terminal } from 'lucide-react';
import { complexStrategicAnalysis } from '../services/geminiService';
import { Boat, StaffMember } from '../types';
import ReactMarkdown from 'react-markdown';

interface StressTestProps {
    onBack: () => void;
    fleet: Boat[];
    team: StaffMember[];
}

const StressTest: React.FC<StressTestProps> = ({ onBack, fleet, team }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [scenario, setScenario] = useState('');

    const runStressTest = async (testScenario: string) => {
        setLoading(true);
        setScenario(testScenario);
        setResult('');

        const fleetInfo = fleet.map(b => `${b.name} (Cap: ${b.cap})`).join(', ');
        const teamInfo = team.filter(t => t.active).map(t => `${t.name} (${t.role})`).join(', ');

        const prompt = `
            DIAGNÓSTICO DE STRESS OPERACIONAL - DELTATUR 2025
            
            Contexto da Empresa:
            - Frota: ${fleetInfo}
            - Equipa Ativa: ${teamInfo}
            
            Cenário de Stress:
            "${testScenario}"
            
            TAREFA PARA GEMINI 3 PRO (THINKING MODE):
            1. Analisa os conflitos logísticos imediatos.
            2. Propõe uma redistribuição estratégica de barcos e staff baseada na capacidade real.
            3. Define protocolos de comunicação com os clientes.
            4. Identifica riscos residuais.
            
            Responde em Português com estrutura de Relatório Executivo de Elite.
        `;

        try {
            const analysis = await complexStrategicAnalysis(prompt);
            setResult(analysis);
        } catch (e) {
            setResult("Erro crítico no motor de IA durante o stress test. Verifica a conectividade.");
        } finally {
            setLoading(false);
        }
    };

    const PRESETS = [
        { 
            title: "Avaria no Delta III + VIPs", 
            desc: "O barco Delta III (20 pax) avariou no cais. Temos 18 passageiros americanos (Reserva Manuel Porto) a chegar em 15 minutos. O Rui Jesus é o único skipper livre mas o barco Delta I também está ocupado.",
            icon: AlertTriangle 
        },
        { 
            title: "Overbooking Crítico", 
            desc: "Registo: 'Recebemos 50 pessoas do Hotel Lamego agora mesmo, mas só temos o Delta IV e Delta V disponíveis. O Telmo Moura e o Tiago Azevedo estão em serviço. Quem conduz os barcos?'",
            icon: Zap 
        },
        { 
            title: "Greve de Eclusas + Caudal", 
            desc: "APDL informa fecho imprevisto da eclusa da Régua. Temos tours agendados que cruzam a eclusa. Caudal do rio subiu 20% na última hora. Como reorganizar os passeios locais no Pinhão?",
            icon: BrainCircuit 
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-3 rounded-2xl bg-white border border-brand-border text-brand-dark hover:bg-brand-bg transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark font-roboto flex items-center gap-3">
                            <FlaskConical className="w-6 h-6 text-brand-gold" />
                            Stress Test Lab
                        </h1>
                        <p className="text-brand-muted text-[10px] uppercase tracking-widest font-bold mt-1">Auditando a Resiliência Deltatur</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest font-roboto">AI Strategic Engine Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em] px-2">Simulações de Crise</h3>
                    {PRESETS.map((p, idx) => (
                        <button 
                            key={idx}
                            onClick={() => runStressTest(p.desc)}
                            disabled={loading}
                            className="w-full bg-white p-6 rounded-[28px] border border-brand-border text-left hover:border-brand-gold/50 transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-12 h-12 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-4 h-4 text-brand-gold" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <p.icon className="w-5 h-5 text-brand-gold" />
                                <span className="font-bold text-sm text-brand-dark font-roboto">{p.title}</span>
                            </div>
                            <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">{p.desc}</p>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-brand-dark rounded-[40px] shadow-2xl border-4 border-white/5 overflow-hidden flex flex-col h-[700px]">
                        <div className="bg-black/50 p-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/50"></div><div className="w-3 h-3 rounded-full bg-yellow-500/50"></div><div className="w-3 h-3 rounded-full bg-green-500/50"></div></div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 tracking-widest"><Terminal className="w-3 h-3" /> CRITICAL_OPS_MONITOR</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 font-mono no-scrollbar">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8"><div className="w-24 h-24 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div><BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-brand-gold animate-pulse" /></div>
                                    <p className="text-brand-gold text-xs font-bold tracking-[0.4em] uppercase">IA EM PROFUNDO PENSAMENTO</p>
                                    <p className="text-white/20 text-[10px] mt-2 max-w-[250px] leading-relaxed uppercase tracking-widest">Cruzar dados de frota e pessoal para resolução de conflitos...</p>
                                </div>
                            ) : result ? (
                                <div className="prose prose-invert prose-sm max-w-none animate-fadeIn">
                                    <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] text-brand-gold font-bold uppercase mb-2">Cenário Ativo:</p>
                                        <p className="text-xs text-white/60 italic">{scenario}</p>
                                    </div>
                                    <ReactMarkdown>{result}</ReactMarkdown>
                                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Resposta Validada pela IA</div>
                                        <button onClick={() => window.print()} className="text-[10px] text-white/30 hover:text-white transition-colors uppercase font-bold tracking-widest underline decoration-brand-gold/30 underline-offset-4">Imprimir Relatório</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10"><FlaskConical className="w-20 h-20 text-white mb-6" strokeWidth={1} /><p className="text-white font-bold tracking-[0.5em] text-xs uppercase">Selecione um cenário de teste</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StressTest;
