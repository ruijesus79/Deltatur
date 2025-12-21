
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { UserProfile, StaffMember } from '../types';
import { BrandLogo } from '../components/BrandLogo';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  initialMode?: 'GUIDE' | 'ADMIN';
  onBack?: () => void;
  teamList?: StaffMember[];
}

const Login: React.FC<LoginProps> = ({ onLogin, initialMode = 'GUIDE', onBack, teamList }) => {
  // Strictly respect initialMode passed from Landing Page
  const mode = initialMode || 'GUIDE';

  const [guideName, setGuideName] = useState('');
  const [guideEmail, setGuideEmail] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // DELTATUR LIFESTYLE IMAGE
  const SIDEBAR_IMG = "https://deltatur.pt/wp-content/uploads/2025/09/DIA-1-FOTOGRAFIAS-27-1024x682.webp";

  useEffect(() => {
    const savedRemember = localStorage.getItem('deltatur_remember');
    if (savedRemember === 'true') {
        setRememberMe(true);
        // Only load credentials, do NOT override the mode selected by user
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
          // Check for custom credentials in localStorage
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
          // Validate against Team List if available
          if (teamList && teamList.length > 0) {
              const staffMember = teamList.find(t => t.email?.toLowerCase() === cleanGuideEmail.toLowerCase());
              
              if (staffMember) {
                  onLogin({ name: staffMember.name, email: staffMember.email!, role: 'GUIDE', commissionRate: 0.06 });
              } else {
                  if (cleanGuideEmail.endsWith('@deltatur.pt')) {
                      alert('Este email não tem permissões de acesso. Contacte o administrador.');
                  } else {
                      // Allow external emails for now (Legacy Guides)
                      onLogin({ name: cleanGuideName, email: cleanGuideEmail, role: 'GUIDE', commissionRate: 0.06 });
                  }
              }
          } else {
              // Legacy Fallback
              if(cleanGuideName && cleanGuideEmail) {
                 onLogin({ name: cleanGuideName, email: cleanGuideEmail, role: 'GUIDE', commissionRate: 0.06 });
              }
          }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* Left Side - Brand Only (Restored Pinhão Background) */}
      <div className="w-full md:w-1/2 bg-black relative overflow-hidden flex flex-col items-center justify-center p-12 order-2 md:order-1 min-h-[300px] md:min-h-screen">
         
         {/* Restored Background Image */}
         <div className="absolute inset-0 z-0">
             <img 
                src={SIDEBAR_IMG} 
                alt="Pinhão Landscape" 
                className="w-full h-full object-cover opacity-70 animate-ken-burns"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-dark/40 via-brand-primary-dark/60 to-brand-primary-dark/90 mix-blend-multiply"></div>
         </div>

         {/* Subtle Gradient Overlay for Depth */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 z-0"></div>

         <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
             <div className="mb-8 p-6 animate-slideUp flex items-center justify-center">
                 <BrandLogo variant="white" />
             </div>
         </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white order-1 md:order-2 relative">
        
        {/* Back Button */}
        {onBack && (
            <button 
                onClick={onBack} 
                className="absolute top-6 left-6 p-2 rounded-lg text-brand-muted hover:bg-gray-100 hover:text-brand-dark transition-all z-50 flex items-center gap-2 group"
                title="Voltar ao início"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Voltar</span>
            </button>
        )}

        <div className="w-full max-w-sm space-y-8 animate-slideUp mt-10 md:mt-0">
            
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold text-brand-dark tracking-tight">
                    {mode === 'ADMIN' ? 'Acesso Administrativo' : 'Acesso Guia & Staff'}
                </h2>
                <p className="text-brand-muted text-sm">
                    {mode === 'ADMIN' ? 'Gestão de frota e operações.' : 'Introduza o seu email registado.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'GUIDE' && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Nome</label>
                        <input 
                            type="text" 
                            value={guideName}
                            required
                            onChange={e => setGuideName(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder-brand-muted/40"
                            placeholder="João Silva"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Email</label>
                        <input 
                            type="email" 
                            value={guideEmail}
                            required
                            onChange={e => setGuideEmail(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder-brand-muted/40"
                            placeholder="joao@deltatur.pt"
                        />
                    </div>
                </div>
            )}

            {mode === 'ADMIN' && (
                <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Utilizador</label>
                        <input 
                            type="text" 
                            value={adminUser}
                            onChange={e => setAdminUser(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder-brand-muted/40"
                            placeholder="admin"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            value={adminPass}
                            onChange={e => setAdminPass(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder-brand-muted/40"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`mr-3 transition-colors ${rememberMe ? 'text-brand-primary' : 'text-brand-muted/50'}`}>
                    {rememberMe ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </div>
                <span className="text-sm font-medium text-brand-muted select-none">
                    Lembrar-me neste dispositivo
                </span>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:bg-brand-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center group"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
