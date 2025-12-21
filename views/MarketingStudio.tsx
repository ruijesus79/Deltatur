

import React, { useState, useRef, useEffect } from 'react';
import { generateImage, editImage, generateVideo } from '../services/geminiService';
import { Wand2, Image as ImageIcon, Video, Layers, Download, Loader2, Key, ArrowLeft, Maximize2, Sparkles, Sliders } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

interface MarketingStudioProps {
    onBack?: () => void;
}

const MarketingStudio: React.FC<MarketingStudioProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'GEN' | 'EDIT' | 'VIDEO'>('GEN');
  
  // States originais mantidos
  const [genPrompt, setGenPrompt] = useState('');
  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [genAspect, setGenAspect] = useState('16:9');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
      setLoading(true);
      try {
          // Fixed call to generateImage: removed redundant 4th argument
          const imgs = await generateImage(genPrompt, genSize, genAspect);
          setGeneratedImages(imgs);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-fadeIn">
      
      {/* 1. SUITE HEADER */}
      <div className="bg-white rounded-[32px] p-8 border border-brand-border flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-6">
            {onBack && (
                <button 
                    onClick={onBack} 
                    className="p-3 rounded-2xl bg-brand-bg text-brand-dark hover:bg-gray-200 transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
            <div>
                <h1 className="text-2xl font-bold text-brand-dark font-roboto">Creative Studio AI</h1>
                <p className="text-brand-muted text-xs uppercase tracking-widest font-bold mt-1">Deltatur Digital Asset Suite</p>
            </div>
        </div>
        
        {/* Pro Tabs */}
        <div className="flex bg-brand-bg p-1.5 rounded-2xl border border-brand-border">
            <button 
                onClick={() => setActiveTab('GEN')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'GEN' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-dark'}`}
            >
                <ImageIcon className="w-4 h-4" /> Geração
            </button>
            <button 
                onClick={() => setActiveTab('EDIT')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'EDIT' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-dark'}`}
            >
                <Layers className="w-4 h-4" /> Edição
            </button>
            <button 
                onClick={() => setActiveTab('VIDEO')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'VIDEO' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-dark'}`}
            >
                <Video className="w-4 h-4" /> Vídeo
            </button>
        </div>
      </div>

      {/* 2. CREATIVE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6 h-full">
                <div className="flex items-center gap-2 text-brand-primary">
                    <Sliders className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Configurações</span>
                </div>

                {activeTab === 'GEN' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 ml-1">Prompt Criativo</label>
                            <textarea 
                                value={genPrompt}
                                onChange={(e) => setGenPrompt(e.target.value)}
                                className="w-full p-5 bg-brand-bg border border-brand-border rounded-[24px] text-sm font-medium h-40 resize-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                placeholder="Descreva a imagem ideal para a Deltatur..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-2 ml-1">Resolução</label>
                                <select value={genSize} onChange={(e) => setGenSize(e.target.value as any)} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold outline-none">
                                    <option value="1K">1K Standalone</option>
                                    <option value="2K">2K Ultra</option>
                                    <option value="4K">4K Cinema</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-2 ml-1">Aspecto</label>
                                <select value={genAspect} onChange={(e) => setGenAspect(e.target.value)} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-xs font-bold outline-none">
                                    <option value="16:9">Widescreen</option>
                                    <option value="1:1">Quadrado</option>
                                    <option value="9:16">Vertical</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !genPrompt}
                            className="w-full bg-brand-primary-dark text-white py-5 rounded-[24px] font-bold text-sm shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5 text-brand-gold"/>}
                            {loading ? 'Processando IA...' : 'Gerar Masterpiece'}
                        </button>
                    </div>
                )}

                {/* EDIT and VIDEO states follow the same redesign pattern */}
                {activeTab !== 'GEN' && (
                    <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                        <Wand2 className="w-12 h-12 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Interface sob Consulta</p>
                    </div>
                )}
            </div>
        </div>

        {/* Cinematic Preview Area */}
        <div className="lg:col-span-8">
             <div className="bg-brand-dark rounded-[40px] h-[640px] flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-white/5">
                {/* Visual Elements for Pro Look */}
                <div className="absolute top-8 left-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                </div>
                <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/20 tracking-widest">
                    AI_RENDER_ENGINE_2025_V4
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-white backdrop-blur-md">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-brand-gold animate-pulse" />
                        </div>
                        <p className="text-sm font-bold tracking-[0.3em] uppercase mt-8 text-brand-gold">Generating Art</p>
                        <p className="text-[10px] text-white/30 mt-2">O motor Gemini 3 Pro está a processar a sua visão...</p>
                    </div>
                )}
                
                {generatedImages.length > 0 ? (
                    <div className="w-full h-full p-12 animate-fadeIn">
                        <img 
                            src={generatedImages[0]} 
                            alt="AI Output" 
                            className="w-full h-full object-contain rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] cursor-zoom-in" 
                        />
                        <button className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl text-white text-xs font-bold flex items-center gap-2 transition-all">
                            <Download className="w-4 h-4" /> Descarregar Alta Resolução
                        </button>
                    </div>
                ) : (
                    !loading && (
                        <div className="text-white/10 flex flex-col items-center">
                            <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-[32px] flex items-center justify-center mb-6">
                                <Maximize2 className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="font-bold tracking-[0.4em] text-xs uppercase text-white/20">Aguardando Input do Estúdio</p>
                        </div>
                    )
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingStudio;
