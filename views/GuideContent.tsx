
import React, { useState, useEffect } from 'react';
import { KnowledgeArticle, GalleryImage, DocumentResource, EmergencyContact } from '../types';
import { 
  Sparkles, BookOpen, Image, FileText, Phone, 
  ArrowLeft, Search, MapPin, ChevronRight, Zap, Loader2, Info, Map as MapIcon, Utensils, Wine, Eye, Globe, ExternalLink, X, Navigation, Quote, Lightbulb, Train, Mountain, Home, ShoppingBag, Calendar
} from 'lucide-react';
import { generateDynamicNarrative, translateArticleContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface GuideContentProps {
  knowledgeBase: KnowledgeArticle[];
  gallery: GalleryImage[];
  documents: DocumentResource[];
  emergencyContacts: EmergencyContact[];
  isAdmin: boolean;
  onUpdateEmergency: (e: EmergencyContact[]) => void;
  onUpdateGallery: (g: GalleryImage[]) => void;
  onBack: () => void;
}

const SlideshowCard: React.FC<{ article: KnowledgeArticle; onClick: () => void; labelBtn: string }> = ({ article, onClick, labelBtn }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = article.imageUrls || [];

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 4000); 
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="bg-white rounded-[36px] overflow-hidden border border-brand-border flex flex-col h-full shadow-md group transition-all duration-300">
            <div className="relative aspect-video overflow-hidden bg-brand-bg">
                {images.map((url, idx) => (
                    <img 
                        key={url}
                        src={url} 
                        alt={article.title} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    />
                ))}
                {images.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted/20">
                        <MapIcon className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-brand-primary text-brand-gold text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-brand-gold/20 shadow-lg">
                        {article.category}
                    </span>
                </div>
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, idx) => (
                            <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}></div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-1 relative z-20 bg-white">
                <h3 className="text-lg font-black text-brand-dark mb-3 leading-none tracking-tight">{article.title}</h3>
                <div className="prose prose-xs text-brand-muted line-clamp-3 leading-relaxed font-medium mb-6">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
                <button 
                    onClick={onClick}
                    className="mt-auto w-full py-3.5 bg-brand-primary text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-brand-primary transition-all active:scale-95 shadow-md"
                >
                    {labelBtn} <ChevronRight className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
};

// UI Translations
const UI_LABELS = {
    PT: {
        title: "Concierge Hub",
        search: "Pesquise por quintas, trilhos...",
        tabs: { info: "INFO HUB", story: "NARRADOR", emergency: "CONTACTOS" },
        btnOpen: "Abrir Dossier",
        btnCall: "Ligar Agora",
        btnWeb: "Aceder Website",
        storyTitle: "Narrador IA",
        storyGen: "Gerar Storytelling",
        storyPlaceholder: "Selecione um tópico para gerar uma narrativa exclusiva...",
        translating: "Traduzindo com IA...",
        categories: {
            TUDO: 'TUDO', RESTAURANTES: 'RESTAURANTES', QUINTAS: 'QUINTAS', LOGISTICA: 'LOGÍSTICA', 
            ATIVIDADES: 'ATIVIDADES', ALDEIAS: 'ALDEIAS', COMERCIO: 'COMÉRCIO', 
            SAZONALIDADE: 'SAZONALIDADE', MIRADOUROS: 'MIRADOUROS', HISTORIA: 'HISTÓRIA'
        }
    },
    EN: {
        title: "Concierge Hub",
        search: "Search for wineries, trails...",
        tabs: { info: "INFO HUB", story: "STORYTELLER", emergency: "CONTACTS" },
        btnOpen: "Open File",
        btnCall: "Call Now",
        btnWeb: "Visit Website",
        storyTitle: "AI Narrator",
        storyGen: "Generate Story",
        storyPlaceholder: "Select a topic to generate an exclusive narrative...",
        translating: "AI Translating...",
        categories: {
            TUDO: 'ALL', RESTAURANTES: 'RESTAURANTS', QUINTAS: 'WINERIES', LOGISTICA: 'LOGISTICS', 
            ATIVIDADES: 'ACTIVITIES', ALDEIAS: 'VILLAGES', COMERCIO: 'SHOPS', 
            SAZONALIDADE: 'SEASONAL', MIRADOUROS: 'VIEWPOINTS', HISTORIA: 'HISTORY'
        }
    },
    FR: {
        title: "Concierge Hub",
        search: "Rechercher des domaines, sentiers...",
        tabs: { info: "INFO HUB", story: "CONTEUR", emergency: "CONTACTS" },
        btnOpen: "Ouvrir Dossier",
        btnCall: "Appeler",
        btnWeb: "Site Web",
        storyTitle: "Narrateur IA",
        storyGen: "Générer Histoire",
        storyPlaceholder: "Sélectionnez un sujet pour générer une narration...",
        translating: "Traduction IA...",
        categories: {
            TUDO: 'TOUT', RESTAURANTES: 'RESTAURANTS', QUINTAS: 'DOMAINES', LOGISTICA: 'LOGISTIQUE', 
            ATIVIDADES: 'ACTIVITÉS', ALDEIAS: 'VILLAGES', COMERCIO: 'COMMERCE', 
            SAZONALIDADE: 'SAISONNIER', MIRADOUROS: 'BELVÉDÈRES', HISTORIA: 'HISTOIRE'
        }
    },
    ES: {
        title: "Concierge Hub",
        search: "Buscar bodegas, senderos...",
        tabs: { info: "INFO HUB", story: "NARRADOR", emergency: "CONTACTOS" },
        btnOpen: "Abrir Archivo",
        btnCall: "Llamar",
        btnWeb: "Sitio Web",
        storyTitle: "Narrador IA",
        storyGen: "Generar Historia",
        storyPlaceholder: "Seleccione un tema para generar una narración...",
        translating: "Traduciendo IA...",
        categories: {
            TUDO: 'TODO', RESTAURANTES: 'RESTAURANTES', QUINTAS: 'BODEGAS', LOGISTICA: 'LOGÍSTICA', 
            ATIVIDADES: 'ACTIVIDADES', ALDEIAS: 'PUEBLOS', COMERCIO: 'COMERCIO', 
            SAZONALIDADE: 'ESTACIONAL', MIRADOUROS: 'MIRADORES', HISTORIA: 'HISTORIA'
        }
    }
};

const GuideContent: React.FC<GuideContentProps> = ({ 
  knowledgeBase, gallery, documents, emergencyContacts, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'KNOWLEDGE' | 'STORY' | 'EMERGENCY'>('KNOWLEDGE');
  const [activeCategory, setActiveCategory] = useState<string>('TUDO');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  
  // Translation States
  const [language, setLanguage] = useState<'PT'|'EN'|'FR'|'ES'>('PT');
  const [translationCache, setTranslationCache] = useState<Record<string, {title: string, content: string}>>({});
  const [isTranslatingModal, setIsTranslatingModal] = useState(false);

  // Story States
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [storyTopic, setStoryTopic] = useState('Lendas dos Barcos Rabelos');
  const [searchQuery, setSearchQuery] = useState('');

  const labels = UI_LABELS[language];

  const KNOWLEDGE_CATEGORIES = [
      { id: 'TUDO', label: labels.categories.TUDO, icon: MapIcon },
      { id: 'RESTAURANTES', label: labels.categories.RESTAURANTES, icon: Utensils },
      { id: 'QUINTAS', label: labels.categories.QUINTAS, icon: Wine },
      { id: 'LOGÍSTICA', label: labels.categories.LOGISTICA, icon: Train },
      { id: 'ATIVIDADES', label: labels.categories.ATIVIDADES, icon: Mountain },
      { id: 'ALDEIAS', label: labels.categories.ALDEIAS, icon: Home },
      { id: 'COMERCIO', label: labels.categories.COMERCIO, icon: ShoppingBag },
      { id: 'SAZONALIDADE', label: labels.categories.SAZONALIDADE, icon: Calendar },
      { id: 'MIRADOUROS', label: labels.categories.MIRADOUROS, icon: Eye },
      { id: 'HISTÓRIA', label: labels.categories.HISTORIA, icon: BookOpen },
  ];

  const filteredKnowledge = knowledgeBase.filter(k => {
    const matchesSearch = k.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          k.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'TUDO' || k.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateStory = async () => {
      setIsGenerating(true);
      try {
          const res = await generateDynamicNarrative(storyTopic, "Passeio de 1h", "Público Geral", language);
          setNarrative(res);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  // Auto-translate when Modal Opens
  useEffect(() => {
    if (selectedArticle && language !== 'PT') {
        const cacheKey = `${selectedArticle.id}_${language}`;
        if (!translationCache[cacheKey]) {
            setIsTranslatingModal(true);
            translateArticleContent(selectedArticle.title, selectedArticle.content, language)
                .then(translated => {
                    setTranslationCache(prev => ({ ...prev, [cacheKey]: translated }));
                    setIsTranslatingModal(false);
                });
        }
    }
  }, [selectedArticle, language]);

  const getDisplayedArticle = (article: KnowledgeArticle) => {
      if (language === 'PT') return article;
      const cacheKey = `${article.id}_${language}`;
      const translated = translationCache[cacheKey];
      return translated ? { ...article, title: translated.title, content: translated.content } : article;
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fadeIn pb-32">
        {/* HEADER */}
        <div className="sticky top-0 z-[100] bg-brand-bg/95 backdrop-blur-md pt-2 space-y-3 shadow-sm border-b border-brand-border pb-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark shadow-sm active:scale-95 transition-all">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <h1 className="text-lg md:text-2xl font-roboto font-black text-brand-dark uppercase tracking-tighter">{labels.title}</h1>
                </div>
                
                {/* Language Selector */}
                <div className="flex bg-white border border-brand-border rounded-xl p-1 shadow-sm">
                    {(['PT', 'EN', 'FR', 'ES'] as const).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === lang ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-brand-bg'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-2">
              <nav className="flex bg-brand-primary p-1 rounded-[22px] shadow-lg gap-1 overflow-x-auto no-scrollbar">
                  <button onClick={() => setActiveTab('KNOWLEDGE')} className={`px-4 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'KNOWLEDGE' ? 'bg-brand-gold text-brand-primary' : 'text-white/60 hover:text-white'}`}>
                      <BookOpen className="w-4 h-4"/> {labels.tabs.info}
                  </button>
                  <button onClick={() => setActiveTab('STORY')} className={`px-4 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'STORY' ? 'bg-brand-gold text-brand-primary' : 'text-white/60 hover:text-white'}`}>
                      <Sparkles className="w-4 h-4"/> {labels.tabs.story}
                  </button>
                  <button onClick={() => setActiveTab('EMERGENCY')} className={`px-4 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'EMERGENCY' ? 'bg-brand-gold text-brand-primary' : 'text-white/60 hover:text-white'}`}>
                      <Phone className="w-4 h-4"/> {labels.tabs.emergency}
                  </button>
              </nav>
            </div>
        </div>

        {activeTab === 'KNOWLEDGE' && (
            <div className="space-y-6 animate-fadeIn px-2">
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                        <input 
                            type="text" 
                            placeholder={labels.search} 
                            className="w-full bg-white border-2 border-brand-border rounded-[22px] py-3.5 pl-14 pr-6 text-sm font-bold outline-none shadow-sm focus:border-brand-primary transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="bg-brand-primary p-2 rounded-[28px] shadow-xl">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                            {KNOWLEDGE_CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-5 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border ${activeCategory === cat.id ? 'bg-brand-gold border-brand-gold text-brand-primary shadow-inner' : 'bg-brand-primary-dark/50 border-white/5 text-white/60 hover:text-brand-gold'}`}
                                >
                                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-brand-primary' : 'text-brand-gold'}`} /> 
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredKnowledge.map(kb => (
                        <SlideshowCard 
                            key={kb.id} 
                            article={kb} 
                            onClick={() => setSelectedArticle(kb)} 
                            labelBtn={labels.btnOpen}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* MODAL DETALHE (Translated on Demand) */}
        {selectedArticle && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={() => setSelectedArticle(null)}></div>
                <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slideUp">
                    <div className="relative h-56 md:h-64 shrink-0 overflow-hidden group">
                        <img src={selectedArticle.imageUrls?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                        <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 p-3 bg-brand-primary/20 text-brand-primary rounded-full backdrop-blur-md">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-8 right-8">
                            <h2 className="text-2xl md:text-3xl font-roboto font-black text-brand-dark tracking-tighter uppercase leading-none">
                                {isTranslatingModal ? (
                                    <span className="animate-pulse bg-slate-200 text-transparent rounded">Loading Title...</span>
                                ) : getDisplayedArticle(selectedArticle).title}
                            </h2>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {isTranslatingModal ? (
                             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">{labels.translating}</p>
                             </div>
                        ) : (
                            <div className="bg-brand-bg p-6 rounded-[28px] border border-brand-border">
                                <div className="prose prose-sm text-brand-dark leading-relaxed font-medium">
                                    <ReactMarkdown>{getDisplayedArticle(selectedArticle).content}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                        
                        {/* Gallery Grid in Modal if multiple images */}
                        {selectedArticle.imageUrls && selectedArticle.imageUrls.length > 1 && (
                            <div>
                                <h4 className="text-xs font-black text-brand-muted uppercase tracking-widest mb-4">Galeria</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedArticle.imageUrls.map((img, idx) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden aspect-video border border-brand-border">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(selectedArticle.phone || selectedArticle.website) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedArticle.phone && (
                                    <a href={`tel:${selectedArticle.phone}`} className="flex items-center gap-4 p-5 bg-brand-primary text-white rounded-[24px] shadow-lg hover:scale-[1.02] transition-transform">
                                        <div className="p-2.5 bg-white/10 rounded-xl"><Phone className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-white/50 tracking-widest">{labels.btnCall}</p>
                                            <p className="text-base font-bold font-mono">{selectedArticle.phone}</p>
                                        </div>
                                    </a>
                                )}
                                {selectedArticle.website && (
                                    <a href={`https://${selectedArticle.website}`} target="_blank" className="flex items-center gap-4 p-5 bg-brand-bg text-brand-dark rounded-[24px] border border-brand-border hover:bg-white transition-colors">
                                        <div className="p-2.5 bg-brand-primary/10 rounded-xl"><Globe className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-brand-muted tracking-widest">{labels.btnWeb}</p>
                                            <p className="text-sm font-bold truncate">deltatur.pt</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* NARRADOR & CONTACTOS (MANTIDOS) */}
        {activeTab === 'STORY' && (
            <div className="flex-1 flex flex-col animate-fadeIn space-y-4 px-2">
                <div className="bg-brand-dark p-8 rounded-[40px] text-white shadow-xl">
                    <h2 className="text-2xl font-roboto font-bold tracking-tighter uppercase mb-6">{labels.storyTitle}</h2>
                    <div className="space-y-4">
                        <select value={storyTopic} onChange={(e) => setStoryTopic(e.target.value)} className="w-full bg-white/10 border border-white/10 p-4 rounded-xl text-sm font-bold text-white outline-none">
                            <option className="text-brand-dark">As Vindimas no Douro</option>
                            <option className="text-brand-dark">A Chegada do Comboio ao Pinhão</option>
                            <option className="text-brand-dark">A Lenda de Provesende</option>
                        </select>
                        <button onClick={handleGenerateStory} disabled={isGenerating} className="w-full py-4 bg-brand-gold text-brand-primary rounded-[20px] font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3">
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Zap className="w-5 h-5"/>}
                            {isGenerating ? '...' : labels.storyGen}
                        </button>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-inner min-h-[300px]">
                    <div className="prose prose-sm prose-brand text-brand-dark font-medium leading-relaxed">
                        <ReactMarkdown>{narrative || labels.storyPlaceholder}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'EMERGENCY' && (
            <div className="space-y-4 animate-fadeIn px-2 max-w-xl mx-auto w-full">
                {emergencyContacts.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-[28px] border border-brand-border shadow-sm flex items-center justify-between">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase bg-red-50 text-red-500 mb-2">{c.type}</span>
                            <p className="font-black text-brand-dark text-base">{c.name}</p>
                            <p className="text-xs font-mono font-bold text-brand-primary mt-1">{c.phone}</p>
                        </div>
                        <a href={`tel:${c.phone}`} className="shrink-0 w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg">
                            <Phone className="w-5 h-5" />
                        </a>
                    </div>
                ))}
            </div>
        )}

        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
    </div>
  );
};

export default GuideContent;
