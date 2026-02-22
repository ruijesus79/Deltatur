import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Radio, Mic, StopCircle, ArrowLeft, Volume2, Signal, Waves, MessageCircle, Send, Search, MoreVertical, CheckCheck, Paperclip, Camera } from 'lucide-react';
import { UserProfile, AppView, TeamChatMessage } from '../types';
import { INITIAL_TEAM } from '../data/companyData';

interface RadioOpsProps {
  onBack: () => void;
  user: UserProfile;
}

const RadioOps: React.FC<RadioOpsProps> = ({ onBack, user }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    // Load initial chat history
    const savedChat = localStorage.getItem('deltatur_db_chat');
    if (savedChat) setMessages(JSON.parse(savedChat));

    // Real-time Chat Sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'deltatur_db_chat' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup function when component unmounts
    return () => {
      stopSession();
      window.removeEventListener('storage', handleStorageChange);
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatMsg: TeamChatMessage = {
      id: Date.now().toString(),
      senderName: user.name,
      senderRole: user.role,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedChat = [...messages, chatMsg];
    setMessages(updatedChat);
    setNewMessage("");
    localStorage.setItem('deltatur_db_chat', JSON.stringify(updatedChat));
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              setIsSpeaking(true);
              const base64 = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = outputAudioContextRef.current!.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContextRef.current!.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
            }
          },
          onclose: () => setIsActive(false),
          onerror: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `És o Assistente de Rádio da Deltatur. Fala de forma breve, profissional e náutica. Assistindo o guia ${user.name} no Douro.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col md:flex-row p-0 md:p-4 gap-6 md:h-screen transition-all overflow-hidden relative">

      {/* Grain Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Esquerda: Rádio Assistida (AI Voice) */}
      <div className="w-full md:w-[420px] bg-[#0A2F1F] rounded-[48px] shadow-2xl border border-white/10 flex flex-col p-8 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
          <Radio className="w-80 h-80 -rotate-12 text-brand-gold" />
        </div>

        <div className="flex items-center justify-between mb-12 z-10">
          <button onClick={onBack} className="w-12 h-12 rounded-full hover:bg-white/10 text-white transition-all bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em]">Operations Unit</span>
            <span className="text-xs font-bold text-white/40">Secured Voice Link • VHF V.16</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12 z-10">
          <div className="relative group">
            <div className={`w-40 h-40 rounded-[56px] flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-brand-gold shadow-[0_0_60px_rgba(197,160,40,0.4)] scale-105' : 'bg-white/5 border border-white/10'}`}>
              <Radio className={`w-14 h-14 ${isActive ? 'text-[#070b14]' : 'text-brand-gold/40'}`} />
            </div>
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-[56px] border-4 border-brand-gold animate-ping opacity-20"></div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 border-4 border-[#0A2F1F] shadow-lg animate-pulse"></div>
              </>
            )}
          </div>

          <div className="text-center space-y-3">
            <h2 className={`text-3xl font-['Cormorant_Garamond'] font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
              {isActive ? 'Listening...' : 'Radio Standby'}
            </h2>
            <p className="text-xs text-white/30 font-black uppercase tracking-[0.2em]">Diz "Olá Deltatur" para instrução</p>
          </div>

          {/* Sound Wave Visualizer */}
          <div className="flex items-end gap-1.5 h-16">
            {[20, 40, 100, 60, 80, 50, 90, 30, 70, 40, 60, 20].map((h, i) => (
              <div
                key={i}
                className={`w-2 rounded-full transition-all duration-300 ${isActive && isSpeaking ? 'bg-brand-gold shadow-[0_0_10px_rgba(197,160,40,0.5)]' : 'bg-white/5'}`}
                style={{ height: isActive && isSpeaking ? `${h}%` : '8%' }}
              ></div>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-6 z-10">
          <button
            onClick={isActive ? stopSession : startSession}
            className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-brand-gold text-[#070b14] hover:bg-brand-gold/90'}`}
          >
            {isActive ? <><StopCircle className="w-6 h-6" /> Terminar Escuta</> : <><Mic className="w-6 h-6" /> Abrir Canal AI</>}
          </button>

          <div className="p-5 rounded-[28px] bg-black/20 border border-white/5 flex items-center gap-5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-lg">
              <Signal className="w-6 h-6 text-brand-gold/60" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Neural Link Latency</span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Real-Time</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[94%] h-full bg-brand-gold/40 shadow-[0_0_10px_rgba(197,160,40,0.3)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Team Chat (WhatsApp Style - M3 Expressive) */}
      <div className="flex-1 bg-white rounded-[48px] shadow-2xl border border-white/10 flex flex-col overflow-hidden relative z-10">

        {/* Header do Chat */}
        <div className="px-8 py-5 border-b border-brand-border/40 bg-[#F8F9FA] flex items-center justify-between z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#0A2F1F] flex items-center justify-center border-2 border-white shadow-xl transition-transform group-hover:scale-105">
                {user.photoUrl ? <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" /> : <MessageCircle className="w-7 h-7 text-brand-gold" />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white animate-pulse shadow-md"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold font-['Cormorant_Garamond'] text-brand-dark tracking-tight leading-tight italic">Operations Team Hub</h3>
              <p className="text-[10px] uppercase font-black text-brand-muted tracking-[0.2em] leading-none mt-1">
                {INITIAL_TEAM.filter(t => t.active).length} Ativos em Turno
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-brand-muted/40">
            <button className="w-10 h-10 hover:bg-black/5 hover:text-brand-dark rounded-xl transition-all flex items-center justify-center"><Search className="w-5 h-5" /></button>
            <button className="w-10 h-10 hover:bg-black/5 hover:text-brand-dark rounded-xl transition-all flex items-center justify-center"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[#FDFDFD] relative chat-scrollbar">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-muted opacity-20 p-8 text-center">
              <Waves className="w-20 h-20 mb-6 text-brand-gold" />
              <p className="text-xs font-black uppercase tracking-[0.4em]">Início do Manifesto Digital</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderName === user.name;
              const isSystem = msg.senderRole === 'ADMIN';
              const showAvatar = !isMe && (index === 0 || messages[index - 1].senderName !== msg.senderName);
              const senderPhoto = INITIAL_TEAM.find(t => t.name === msg.senderName)?.photoUrl;

              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>

                  {!isMe && showAvatar ? (
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 mr-3 mt-auto mb-1 border border-brand-border/40 shadow-sm">
                      {senderPhoto ? <img src={senderPhoto} alt="." className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-brand-gold/10 text-xs font-black text-brand-gold">{msg.senderName.charAt(0)}</div>}
                    </div>
                  ) : (
                    !isMe && <div className="w-10 mr-3 flex-shrink-0" />
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    {!isMe && showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1.5 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${isSystem ? 'text-brand-gold' : 'text-orange-500'}`}>
                          {msg.senderName}
                        </span>
                      </div>
                    )}

                    <div className={`relative px-6 py-4 rounded-[28px] shadow-sm text-base font-medium leading-relaxed group ${isMe
                      ? 'bg-[#0A2F1F] text-white rounded-br-[4px] shadow-xl'
                      : (isSystem ? 'bg-white text-brand-dark border-brand-gold border-l-[6px] rounded-bl-[4px] shadow-md' : 'bg-white text-brand-dark rounded-bl-[4px] shadow-md border border-brand-border/40')
                      }`}>

                      {msg.imageUrl && (
                        <div className="mb-4 -mx-2 -mt-1 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                          <img src={msg.imageUrl} alt="Anexo" className="w-full h-auto max-h-[300px] object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}

                      <span className="whitespace-pre-wrap">{msg.text}</span>

                      <div className={`flex items-center justify-end gap-2 mt-2 -mb-1 opacity-40`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-4 h-4 text-brand-gold" />}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input Formulário */}
        <form onSubmit={handleSendMessage} className="p-6 md:p-8 bg-[#F8F9FA] border-t border-brand-border/40 flex items-center gap-4">
          <button type="button" onClick={() => {
            const imageUrl = prompt("Partilhar foto operacional (URL):", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop");
            if (imageUrl) {
              const chatMsg: TeamChatMessage = {
                id: Date.now().toString(), senderName: user.name, senderRole: user.role,
                text: "📷 Relatório Fotográfico Ativo", timestamp: new Date().toISOString(), imageUrl
              };
              const updatedChat = [...messages, chatMsg];
              setMessages(updatedChat);
              localStorage.setItem('deltatur_db_chat', JSON.stringify(updatedChat));
            }
          }} className="w-12 h-12 flex items-center justify-center text-brand-muted hover:bg-brand-gold hover:text-white rounded-2xl transition-all shrink-0 bg-white border border-brand-border/60 shadow-sm">
            <Paperclip className="w-6 h-6" />
          </button>

          <div className="flex-1 bg-white rounded-[28px] border border-brand-border/60 shadow-sm flex items-center overflow-hidden h-14 focus-within:ring-4 focus-within:ring-brand-gold/10 transition-all">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite aqui ordens ou reportes de serviço..."
              className="flex-1 bg-transparent px-6 text-[15px] font-medium text-brand-dark focus:outline-none placeholder:text-brand-muted/40"
            />
            <button type="button" className="p-4 text-brand-muted hover:text-brand-gold transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <button type="submit" disabled={!newMessage.trim()} className={`w-14 h-14 shrink-0 rounded-[22px] flex items-center justify-center shadow-2xl active:scale-95 transition-all ${newMessage.trim() ? 'bg-brand-gold text-[#070b14]' : 'bg-gray-100 text-gray-400'}`}>
            <Send className="w-6 h-6 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RadioOps;
