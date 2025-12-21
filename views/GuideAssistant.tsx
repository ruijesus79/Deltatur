
import React, { useState, useRef, useEffect } from 'react';
import { askGuideAssistant, analyzeImage, generateTTS, transcribeAudio } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, MapPin, Search, Mic, Image as ImageIcon, Volume2, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GuideAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useMaps, setUseMaps] = useState(true);
  const [useSearch, setUseSearch] = useState(true);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !audioBlob) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Get location for Maps Grounding
      let location: GeolocationCoordinates | undefined;
      if (useMaps && "geolocation" in navigator) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            location = pos.coords;
          } catch(e) { console.warn("Location denied"); }
      }

      const response = await askGuideAssistant(userMsg.text, { useSearch, useMaps, location });
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "",
        // Correctly accessing groundingMetadata from the first candidate
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : (c.maps ? { title: c.maps.title || "Map Location", uri: c.maps.uri } : null))
            .filter(Boolean) as { title: string; uri: string }[]
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro ao conectar com a IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: "[Analisando Imagem...]" };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        
        try {
            const analysis = await analyzeImage(base64, file.type, "Descreve o que vês nesta imagem para um turista, identificando espécies ou marcos geográficos.");
            const botMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: analysis };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro na análise da imagem." }]);
        } finally {
            setIsLoading(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const playTTS = async (text: string) => {
      try {
          const audioBase64 = await generateTTS(text);
          const binaryString = atob(audioBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          
          const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start(0);
          setIsPlaying(true);
          source.onended = () => setIsPlaying(false);

      } catch (e) {
          console.error("TTS Error", e);
      }
  };

  // Simple Audio Transcription Recorder (Mocking the UI logic, real logic needs MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
      if (isRecording) {
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Typically webm in chrome
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    setIsLoading(true);
                    try {
                        // Assuming mime type audio/mp3 or similar for API, need to check compatibility or convert.
                        // Gemini accepts standard mimes.
                        const transcript = await transcribeAudio(base64, 'audio/mp3'); // Simplified mime assumption
                        setInput(prev => prev + " " + transcript);
                    } catch(e) { console.error(e) }
                    setIsLoading(false);
                };
                reader.readAsDataURL(blob);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
          } catch (e) { console.error("Mic access denied"); }
      }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-slate-800">Assistente do Guia</h2>
                <p className="text-xs text-slate-500">Ligado a Google Maps & Search</p>
            </div>
            <div className="flex space-x-2">
                <button 
                    onClick={() => setUseMaps(!useMaps)}
                    className={`p-2 rounded-lg text-xs font-medium flex items-center transition-colors ${useMaps ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                >
                    <MapPin className="w-3 h-3 mr-1" /> Maps
                </button>
                <button 
                    onClick={() => setUseSearch(!useSearch)}
                    className={`p-2 rounded-lg text-xs font-medium flex items-center transition-colors ${useSearch ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                >
                    <Search className="w-3 h-3 mr-1" /> Search
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Pergunte sobre a fauna, história ou locais.</p>
                </div>
            )}
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                        <div className="prose prose-sm max-w-none dark:prose-invert text-inherit">
                            <ReactMarkdown>
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100/20 text-xs">
                                <p className="font-semibold mb-1 opacity-80">Fontes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {msg.sources.map((src, i) => (
                                        <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="underline opacity-70 hover:opacity-100 truncate max-w-[200px]">
                                            {src.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                         {msg.role === 'model' && (
                            <button onClick={() => playTTS(msg.text)} className="mt-2 text-slate-400 hover:text-teal-600 transition-colors">
                                <Volume2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-50"
                    title="Analisar Imagem"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
                
                <button 
                    onClick={toggleRecording}
                    className={`p-2 transition-colors rounded-full hover:bg-slate-50 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-teal-600'}`}
                    title="Transcrever Voz"
                >
                   {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 p-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-teal-500 focus:outline-none px-4"
                />
                <button 
                    onClick={handleSend} 
                    disabled={isLoading || (!input.trim())}
                    className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default GuideAssistant;
