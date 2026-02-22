import React, { useEffect, useState } from 'react';
import { ChevronRight, ShieldCheck, Ship, MapPin } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { motion } from 'framer-motion';

interface HomeLandingProps {
    onSelectRole: (role: 'GUIDE' | 'ADMIN') => void;
    heroImage: string;
}

const HomeLanding: React.FC<HomeLandingProps> = ({ onSelectRole }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const HERO_BG = "https://deltatur.pt/wp-content/uploads/2025/08/DJI_0119-1024x576.webp";

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-[#070b14] overflow-hidden font-sans selection:bg-brand-gold/30 selection:text-white">

            {/* 0. GRAIN TEXTURE OVERLAY */}
            <div className="absolute inset-0 z-[5] opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* 1. Background com Parallax Suave */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-[-5%] w-[110%] h-[110%] transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px) scale(1.03)`
                    }}
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={HERO_BG}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    >
                        <source src="https://cdn.pixabay.com/video/2020/05/25/40140-424097495_large.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/80 via-[#070b14]/30 to-[#070b14]"></div>
                <div className="absolute inset-0 backdrop-blur-[1px]"></div>
            </div>

            {/* 2. Main Content Container */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-[480px] flex flex-col items-center"
                >

                    {/* Header / Logo */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-6 md:mb-10">
                        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-4 md:mb-6 inline-block shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold drop-shadow-sm">Deltatur Operational System</p>
                        </div>
                        <BrandLogo variant="full" className="w-40 md:w-64 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
                        <h1 className="mt-4 md:mt-8 text-2xl md:text-5xl font-['Cormorant_Garamond'] italic font-medium text-white tracking-tight leading-tight drop-shadow-xl">
                            Bem-vindo ao Coração do <br />
                            <span className="font-bold not-italic text-brand-gold">Douro Vinhateiro</span>
                        </h1>
                        <p className="mt-2 md:mt-4 text-white/50 text-xs md:text-sm font-medium tracking-wide max-w-[320px] drop-shadow-md">
                            Selecione o seu portal de acesso para iniciar as operações diárias.
                        </p>
                    </motion.div>

                    {/* Role Selection Grid - ADMIN REPLACED TO TOP FOR BETTER ACCESS */}
                    <div className="grid grid-cols-1 gap-3 md:gap-5 w-full relative z-20">

                        {/* THE ADMIN PORTAL - NOW HIGHER UP */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelectRole('ADMIN')}
                            className="group relative overflow-hidden bg-brand-gold/10 hover:bg-brand-gold/20 backdrop-blur-2xl rounded-[32px] p-5 md:p-7 border border-brand-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
                                <ShieldCheck className="w-24 h-24 md:w-32 md:h-32 rotate-12 text-brand-gold" />
                            </div>

                            <div className="relative z-10 flex items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[16px] md:rounded-[20px] bg-brand-gold text-brand-primary-dark flex items-center justify-center shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">Comando Central</h3>
                                    <p className="text-[10px] md:text-xs text-white/60 font-medium mt-0.5">Gestão de Frota, Dashboard & Admin.</p>
                                    <div className="flex items-center gap-2 mt-2 md:mt-3 text-brand-gold font-black text-[9px] uppercase tracking-widest">
                                        <span>Aceder Administração</span>
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.button>

                        {/* THE GUIDE PORTAL */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelectRole('GUIDE')}
                            className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-2xl rounded-[32px] p-5 md:p-7 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Ship className="w-24 h-24 md:w-32 md:h-32 -rotate-12 text-white" />
                            </div>

                            <div className="relative z-10 flex items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[16px] md:rounded-[20px] bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-inner">
                                    <Ship className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">Portal do Skipper</h3>
                                    <p className="text-[10px] md:text-xs text-white/50 font-medium mt-0.5">Checklist, Cockpit & Serviços Logados.</p>
                                    <div className="flex items-center gap-2 mt-2 md:mt-3 text-white/40 font-black text-[9px] uppercase tracking-widest group-hover:text-brand-gold transition-colors">
                                        <span>Iniciar Turno de Navegação</span>
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Footer Info */}
                    <motion.div variants={itemVariants} className="mt-8 md:mt-16 flex flex-col items-center gap-3 text-center">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                            <MapPin className="w-3 h-3 text-brand-gold/60" />
                            <span>Pinhão • Coração do Douro</span>
                        </div>
                        <p className="text-[10px] text-white/10 font-medium uppercase tracking-[0.4em]">Integrated Fleet Management v3.1.0 • 2026</p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomeLanding;
