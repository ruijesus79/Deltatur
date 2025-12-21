
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Radio, Mic, StopCircle, ArrowLeft, Volume2, Signal, Waves } from 'lucide-react';
import { UserProfile, AppView } from '../types';

interface RadioOpsProps {
  onBack: () => void;
  user: UserProfile;
}

const RadioOps: React.FC<RadioOpsProps> = ({ onBack, user }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
      // Cleanup function when component unmounts
      return () => {
          stopSession();
          if (inputAudioContextRef.current) inputAudioContextRef.current.close();
          if (outputAudioContextRef.current) outputAudioContextRef.current.close();
      };
  }, []);

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
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] pb-24 animate-fadeIn">
      <div className="w-full bg-brand-dark rounded-[48px] p-10 border-4 border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gold/30"></div>
          
          <div className="w-full flex justify-between items-center mb-12">
              <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-white/60 hover:text-white transition-all"><ArrowLeft className="w-6 h-6"/></button>
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">
                  <Signal className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  {isActive ? 'Live Channel 01' : 'Radio Standby'}
              </div>
          </div>

          <div className="relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center mb-12">
              <div className={`absolute inset-0 rounded-full border-2 border-brand-gold/20 ${isActive ? 'animate-ping' : ''}`}></div>
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-gold/20 flex items-center justify-center transition-all ${isSpeaking ? 'scale-110 shadow-[0_0_50px_rgba(212,175,55,0.3)]' : ''}`}>
                  <Radio className={`w-12 h-12 ${isActive ? 'text-brand-gold' : 'text-white/20'}`} />
              </div>
          </div>

          <h2 className="text-white font-roboto font-bold text-2xl mb-2">Radio Ops</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-12">Delta Digital Network</p>

          <button onClick={isActive ? stopSession : startSession} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isActive ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-brand-gold text-brand-dark shadow-brand-gold/30 hover:scale-105'}`}>
              {isActive ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
      </div>
    </div>
  );
};

export default RadioOps;
