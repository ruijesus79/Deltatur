import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, ArrowLeft, CheckSquare, Square, Mail, User, Lock, MapPin } from 'lucide-react';
import { UserProfile, StaffMember } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
    onLogin: (user: UserProfile) => void;
    initialMode?: 'GUIDE' | 'ADMIN';
    onBack?: () => void;
    teamList?: StaffMember[];
}

const Login: React.FC<LoginProps> = ({ onLogin, initialMode = 'GUIDE', onBack, teamList }) => {
    const mode = initialMode || 'GUIDE';

    const [guideName, setGuideName] = useState('');
    const [guideEmail, setGuideEmail] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const SIDEBAR_IMG = "https://deltatur.pt/wp-content/uploads/2025/09/DIA-1-FOTOGRAFIAS-27-1024x682.webp";

    useEffect(() => {
        const savedRemember = localStorage.getItem('deltatur_remember');
        if (savedRemember === 'true') {
            setRememberMe(true);
            setGuideName(localStorage.getItem('deltatur_saved_guide_name') || '');
            setGuideEmail(localStorage.getItem('deltatur_saved_guide_email') || '');
            setAdminUser(localStorage.getItem('deltatur_saved_admin_user') || '');
            setAdminPass(localStorage.getItem('deltatur_saved_admin_pass') || '');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanGuideName = guideName.trim();
        const cleanGuideEmail = guideEmail.trim();
        const cleanAdminUser = adminUser.trim();
        const cleanAdminPass = adminPass.trim();

        if (rememberMe) {
            localStorage.setItem('deltatur_remember', 'true');
            if (mode === 'GUIDE') {
                localStorage.setItem('deltatur_saved_guide_name', cleanGuideName);
                localStorage.setItem('deltatur_saved_guide_email', cleanGuideEmail);
            } else {
                localStorage.setItem('deltatur_saved_admin_user', cleanAdminUser);
                localStorage.setItem('deltatur_saved_admin_pass', cleanAdminPass);
            }
        } else {
            localStorage.removeItem('deltatur_remember');
            localStorage.removeItem('deltatur_saved_guide_name');
            localStorage.removeItem('deltatur_saved_guide_email');
            localStorage.removeItem('deltatur_saved_admin_user');
            localStorage.removeItem('deltatur_saved_admin_pass');
        }

        setTimeout(() => {
            setLoading(false);
            if (mode === 'ADMIN') {
                const savedCreds = localStorage.getItem('deltatur_admin_creds');
                let validUser = 'admin';
                let validPass = 'admin';

                if (savedCreds) {
                    const { user, pass } = JSON.parse(savedCreds);
                    validUser = user;
                    validPass = pass;
                }

                if (cleanAdminUser === validUser && cleanAdminPass === validPass) {
                    onLogin({ name: 'Administrador', email: 'ops@deltatur.pt', role: 'ADMIN', commissionRate: 0 });
                } else {
                    alert(`Credenciais incorretas.`);
                }
            } else {
                if (teamList && teamList.length > 0) {
                    const staffMember = teamList.find(t => t.email?.toLowerCase() === cleanGuideEmail.toLowerCase());
                    if (staffMember) {
                        onLogin({ name: staffMember.name, email: staffMember.email!, role: 'GUIDE', commissionRate: 0.06 });
                    } else {
                        if (cleanGuideEmail.endsWith('@deltatur.pt')) {
                            alert('Este email não tem permissões de acesso. Contacte o administrador.');
                        } else {
                            onLogin({ name: cleanGuideName, email: cleanGuideEmail, role: 'GUIDE', commissionRate: 0.06 });
                        }
                    }
                } else {
                    if (cleanGuideName && cleanGuideEmail) {
                        onLogin({ name: cleanGuideName, email: cleanGuideEmail, role: 'GUIDE', commissionRate: 0.06 });
                    }
                }
            }
        }, 800);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 100, damping: 18 }
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#070b14] font-sans selection:bg-brand-gold/30 selection:text-white relative overflow-hidden">

            {/* Grain Overlay */}
            <div className="absolute inset-0 z-[5] opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Left Side - Visual Aura */}
            <div className="w-full md:w-[45%] bg-[#0A2F1F] relative overflow-hidden flex flex-col items-center justify-center p-12 order-2 md:order-1 min-h-[400px] md:min-h-screen md:rounded-r-[60px] shadow-[30px_0_60px_rgba(0,0,0,0.5)] z-10 transition-all duration-700">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={SIDEBAR_IMG}
                        className="w-full h-full object-cover opacity-50 scale-105"
                    >
                        <source src="https://cdn.pixabay.com/video/2021/08/11/84688-587843825_large.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2F1F] via-[#0A2F1F]/40 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="mb-12 bg-white/5 backdrop-blur-xl p-8 rounded-[48px] border border-white/10 shadow-2xl"
                    >
                        <BrandLogo variant="white" className="w-44 drop-shadow-2xl" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-['Cormorant_Garamond'] italic text-white leading-tight font-medium drop-shadow-lg">
                            Compromisso com a <br />
                            <span className="not-italic font-bold text-brand-gold tracking-tight italic">Excelência Marítima</span>
                        </h2>
                        <div className="w-12 h-px bg-brand-gold/40 mx-auto mt-6 blur-[0.5px]"></div>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 left-12 flex items-center gap-3 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] z-20">
                    <MapPin className="w-4 h-4 text-brand-gold/40" />
                    <span>Vale do Douro • Portugal</span>
                </div>
            </div>

            {/* Right Side - Luxury Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-24 order-1 md:order-2 relative z-20">

                {/* Back Link */}
                {onBack && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onBack}
                        className="absolute top-10 left-10 md:left-20 flex items-center gap-4 text-white/60 hover:text-brand-gold transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-all bg-white/5 backdrop-blur-xl shadow-lg">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Retornar</span>
                    </motion.button>
                )}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md space-y-12"
                >
                    <motion.div variants={itemVariants} className="space-y-5">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
                                {mode === 'ADMIN' ? 'Security Protocol' : 'Staff Verification'}
                            </p>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-['Cormorant_Garamond'] font-bold text-white tracking-tight leading-none drop-shadow-2xl">
                            {mode === 'ADMIN' ? 'Administração' : 'Portal de Staff'}
                        </h1>
                        <p className="text-white/50 text-base font-medium tracking-wide leading-relaxed">
                            {mode === 'ADMIN' ? 'Monitorização e gestão estratégica das operações Deltatur.' : 'Autentique-se para aceder ao cockpit operacional e agenda.'}
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {mode === 'GUIDE' ? (
                                <>
                                    <motion.div variants={itemVariants} className="relative group">
                                        <div className="absolute left-4 top-[-10px] z-10 px-2 bg-[#070b14] text-[10px] font-black uppercase tracking-widest text-brand-gold/60 group-focus-within:text-brand-gold transition-colors">Nome Completo</div>
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="text"
                                            value={guideName}
                                            required
                                            onChange={e => setGuideName(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/40 transition-all font-medium text-lg"
                                            placeholder="Ex: João Silva"
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="relative group">
                                        <div className="absolute left-4 top-[-10px] z-10 px-2 bg-[#070b14] text-[10px] font-black uppercase tracking-widest text-brand-gold/60 group-focus-within:text-brand-gold transition-colors">Correio Eletrónico</div>
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="email"
                                            value={guideEmail}
                                            required
                                            onChange={e => setGuideEmail(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/40 transition-all font-medium text-lg"
                                            placeholder="skip@deltatur.pt"
                                        />
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div variants={itemVariants} className="relative group">
                                        <div className="absolute left-4 top-[-10px] z-10 px-2 bg-[#070b14] text-[10px] font-black uppercase tracking-widest text-brand-gold/60 group-focus-within:text-brand-gold transition-colors">Identificador</div>
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="text"
                                            value={adminUser}
                                            required
                                            onChange={e => setAdminUser(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/40 transition-all font-medium text-lg"
                                            placeholder="Utilizador"
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="relative group">
                                        <div className="absolute left-4 top-[-10px] z-10 px-2 bg-[#070b14] text-[10px] font-black uppercase tracking-widest text-brand-gold/60 group-focus-within:text-brand-gold transition-colors">Palavra-Passe</div>
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="password"
                                            value={adminPass}
                                            required
                                            onChange={e => setAdminPass(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/40 transition-all font-medium text-lg"
                                            placeholder="••••••••"
                                        />
                                    </motion.div>
                                </>
                            )}
                        </div>

                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-4 cursor-pointer select-none group"
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-brand-gold border-brand-gold text-brand-primary-dark shadow-[0_5px_15px_rgba(197,160,40,0.3)]' : 'border-white/10 text-transparent group-hover:border-brand-gold/30'}`}>
                                <CheckSquare className="w-4 h-4" strokeWidth={3} />
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${rememberMe ? 'text-white' : 'text-white/40'}`}>Memorizar Credenciais</span>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group bg-brand-gold hover:bg-brand-gold/90 text-[#070b14] font-black py-6 rounded-[32px] shadow-[0_20px_40px_rgba(197,160,40,0.2)] hover:shadow-[0_25px_50px_rgba(197,160,40,0.3)] transition-all duration-500 relative overflow-hidden active:scale-95"
                            >
                                <div className="absolute inset-x-0 top-0 h-px bg-white/40"></div>
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {loading ? <Loader2 className="animate-spin w-7 h-7" /> : (
                                        <>
                                            <span className="uppercase tracking-[0.4em] text-xs">Entrar no Sistema</span>
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
