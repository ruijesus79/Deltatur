import React from 'react';
import { AppView, UserProfile } from '../types';
import { ArrowLeft, Ship, MessageCircle, MapPin, Zap, Camera, ShieldCheck, HelpCircle } from 'lucide-react';

interface AppTutorialProps {
    onBack: () => void;
    user: UserProfile;
}

const AppTutorial: React.FC<AppTutorialProps> = ({ onBack, user }) => {
    const modules = [
        {
            title: "O Cockpit & Agenda",
            description: "No painel principal encontras os dados vitais do rio (caudal, ventos) e a tua escala diária. Podes clicar em qualquer tarefa para iniciar ou realizar o Checklist de Fecho.",
            icon: ShieldCheck,
            color: "text-brand-primary",
            bg: "bg-brand-primary/10",
        },
        {
            title: "Team Hub (Ops Rádio)",
            description: "Comunicação em tempo real com toda a equipa. Podes partilhar fotos de anomalias (via clip) e até usar comandos de voz com o assistente IA da Deltatur.",
            icon: MessageCircle,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Alarme de Âncora",
            description: "No ecrã principal, o Alarme de Âncora (Segurança Passiva) grava a tua posição GPS atual e cria um perímetro de 50m. Se o barco deslizar, o sistema alerta a central.",
            icon: MapPin,
            color: "text-red-500",
            bg: "bg-red-100",
        },
        {
            title: "Protocolo de Fecho",
            description: "A missão final de cada barco. Exige que tires fotografias aos manómetros de combustível e nível de águas para segurança e registo do fecho do barco.",
            icon: Camera,
            color: "text-brand-gold",
            bg: "bg-brand-gold/20",
        }
    ];

    return (
        <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] pb-24 animate-fadeIn px-4 md:px-0">
            <div className="w-full flex justify-start mb-6 mt-4">
                <button onClick={onBack} className="p-3 bg-white rounded-[24px] shadow-glass border border-brand-border text-brand-muted hover:text-brand-primary active:scale-95 transition-all"><ArrowLeft className="w-5 h-5" /></button>
            </div>

            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
                    <HelpCircle className="w-10 h-10 text-brand-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black font-roboto text-brand-dark tracking-tighter mb-2">Como Funciona a App?</h1>
                <p className="text-brand-muted font-medium max-w-lg mx-auto">Bem-vindo(a) à Deltatur Ops Core, {user.name.split(' ')[0]}. Aqui está um guia rápido das principais funcionalidades ao teu dispor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {modules.map((mod, i) => (
                    <div key={i} className="bg-white rounded-[40px] p-8 shadow-glass border border-brand-border/60 hover:shadow-spatial transition-shadow group">
                        <div className={`w-14 h-14 rounded-2xl ${mod.bg} ${mod.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <mod.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black font-roboto text-brand-dark mb-3">{mod.title}</h3>
                        <p className="text-sm text-brand-muted leading-relaxed font-medium">{mod.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button onClick={onBack} className="px-8 py-4 bg-brand-primary text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl hover:bg-brand-primary-dark transition-colors active:scale-95">
                    Ir para Operações
                </button>
            </div>
        </div>
    );
};

export default AppTutorial;
