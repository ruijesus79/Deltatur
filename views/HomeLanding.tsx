
import React, { useEffect, useState } from 'react';
import { ChevronRight, ShieldCheck, Ship, MapPin } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

interface HomeLandingProps {
  onSelectRole: (role: 'GUIDE' | 'ADMIN') => void;
  heroImage: string;
}

const HomeLanding: React.FC<HomeLandingProps> = ({ onSelectRole }) => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const HERO_BG = "https://deltatur.pt/wp-content/uploads/2025/08/DJI_0119-1024x576.webp";

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-primary-dark overflow-y-auto font-sans selection:bg-brand-gold selection:text-white">
      
      {/* 1. Background com Parallax Suave */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
            className="absolute inset-[-5%] w-[110%] h-[110%] transition-transform duration-700 ease-out"
            style={{ 
                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px) scale(1.05)` 
            }}
        >
            <img 
                src={HERO_BG} 
                alt="Deltatur Douro Experience" 
                className="w-full h-full object-cover opacity-50" 
            />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-dark/70 via-brand-primary-dark/40 to-brand-primary-dark"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 md:py-20">
        
        <div className="w-full max-w-[440px] flex flex-col items-center"> 
            
            {/* Header / Logo */}
            <div 
                className={`
                    flex flex-col items-center text-center transition-all duration-1000 ease-out transform
                    ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}
            >
                <div className="relative filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105 active:scale-95">
                    <BrandLogo variant="white" className="h-28 md:h-36 w-auto" />
                </div>

                {/* Mensagem de Boas-vindas - Margem ajustada para não cortar em PC */}
                <div className={`mt-12 md:mt-24 mb-10 transition-all duration-1000 delay-200 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-2xl md:text-3xl font-sans font-extralight text-white/90 uppercase tracking-[0.35em] drop-shadow-2xl">
                        Bem-vindo a Bordo
                    </h1>
                    <div className="h-[1px] w-12 bg-brand-gold/50 mx-auto mt-4"></div>
                </div>
            </div>

            {/* Actions */}
            <div className={`
                space-y-4 w-full transition-all duration-1000 delay-400 transform
                ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}>
                
                {/* BOTÃO 1: OPERATIONS (Guia) */}
                <button 
                    onClick={() => onSelectRole('GUIDE')}
                    className="
                        group relative w-full h-20 md:h-24 rounded-2xl p-[1px]
                        overflow-hidden transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]
                        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/40 via-white/10 to-brand-gold/40 animate-pulse group-hover:animate-none group-hover:bg-brand-gold/20 transition-all"></div>
                    <div className="relative h-full w-full rounded-[15px] bg-brand-primary/80 backdrop-blur-xl flex items-center justify-between px-6 border border-white/10 group-hover:bg-brand-primary transition-colors">
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-brand-primary-dark/80 border border-brand-gold/20 flex items-center justify-center group-hover:border-brand-gold/50 transition-all shadow-inner">
                                <Ship className="w-5 h-5 md:w-7 md:h-7 text-brand-gold" strokeWidth={1.5} />
                            </div>
                            <div className="text-left">
                                <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-bold text-brand-gold/80 mb-0.5 font-roboto">Operations</span>
                                <span className="text-lg md:text-xl font-roboto font-medium tracking-wide text-white">Guia & Staff</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-primary-dark transition-all">
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </button>

                {/* BOTÃO 2: MANAGEMENT (Admin) */}
                <button 
                    onClick={() => onSelectRole('ADMIN')}
                    className="
                        group relative w-full h-20 md:h-24 rounded-2xl p-[1px]
                        overflow-hidden transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]
                        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/40 via-white/10 to-brand-gold/40 animate-pulse group-hover:animate-none group-hover:bg-brand-gold/20 transition-all"></div>
                    <div className="relative h-full w-full rounded-[15px] bg-brand-primary/80 backdrop-blur-xl flex items-center justify-between px-6 border border-white/10 group-hover:bg-brand-primary transition-colors">
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-brand-primary-dark/80 border border-brand-gold/20 flex items-center justify-center group-hover:border-brand-gold/50 transition-all shadow-inner">
                                <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-brand-gold" strokeWidth={1.5} />
                            </div>
                            <div className="text-left">
                                <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-bold text-brand-gold/80 mb-0.5 font-roboto">Management</span>
                                <span className="text-lg md:text-xl font-roboto font-medium tracking-wide text-white">Administração</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-primary-dark transition-all">
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </button>
            </div>

            {/* Footer Elements */}
            <div className={`mt-12 md:mt-16 flex flex-col items-center gap-6 transition-all duration-1000 delay-600 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                    <MapPin className="w-3 h-3 text-brand-gold" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-roboto">Cais Deltatur</span>
                </div>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">v2.7.5 • 2025 Experience</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
