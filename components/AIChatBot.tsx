
import React, { useState, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Camera, Mic, Volume2, Globe, Loader2, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { analyzeInventoryPhoto, transcribeAudio } from '../services/geminiService';

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'system', text: string, sources?: any[]}[]>([
    { role: 'bot', text: '¡Hola! Soy tu asistente AgriCRM. ¿Necesitas ayuda con el mercado, el análisis de una foto o transcribir un pedido por voz?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsThinking(true);

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: text,
        config: { 
          systemInstruction: 'Eres un analista experto en el mercado agrícola institucional. Utiliza Google Search para validar precios actuales de insumos y clima si es necesario.',
          tools: [{ googleSearch: {} }] 
        }
      });

      // Extract search grounding metadata to display source links
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.filter((chunk: any) => chunk.web).map((chunk: any) => chunk.web) || [];

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: response.text || 'Sin respuesta.',
        sources: sources.length > 0 ? sources : undefined
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error de conexión con Gemini AI.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setMessages(prev => [...prev, { role: 'system', text: 'Procesando comando de voz...' }]);
          setIsThinking(true);
          const transcription = await transcribeAudio(base64, 'audio/webm');
          setIsThinking(false);
          setMessages(prev => [...prev, { role: 'user', text: `[Audio]: ${transcription}` }]);
          handleSend(transcription);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        setMessages(prev => [...prev, { role: 'user', text: '[Imagen enviada para análisis]' }]);
        setIsThinking(true);
        const result = await analyzeInventoryPhoto(base64);
        setMessages(prev => [...prev, { role: 'bot', text: result }]);
        setIsThinking(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active-scale group"
        >
          <Bot size={32} className="group-hover:animate-pulse" />
        </button>
      ) : (
        <div className="bg-white w-[350px] md:w-[450px] h-[600px] rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-500 rounded-xl">
                  <Sparkles size={18} />
               </div>
               <div>
                  <h3 className="font-black uppercase tracking-widest text-[10px]">AgriAI Strategist</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                     <Globe size={10} className="text-blue-400" /> Grounding Activado
                  </p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-[#0056b2] text-white rounded-br-none' : 
                  m.role === 'system' ? 'bg-amber-50 text-amber-700 italic text-center w-full' :
                  'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
                {m.sources && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                    {m.sources.map((source, sIdx) => (
                      <a 
                        key={sIdx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest"
                      >
                        <ExternalLink size={8} /> {source.title || 'Ver Fuente'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full w-fit animate-pulse">
                 <Loader2 size={12} className="animate-spin text-blue-500" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultando Gemini 3 Pro...</span>
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-2xl transition-all"
                title="Subir foto de inventario"
              >
                <Camera size={20} />
              </button>
              
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-emerald-500'}`}
                title="Mantén para hablar"
              >
                <Mic size={20} />
              </button>

              <div className="flex-1 relative">
                <input 
                  className="w-full bg-slate-50 p-4 rounded-2xl text-[11px] outline-none border border-transparent focus:border-blue-500 transition-all font-medium" 
                  placeholder="Pregunta sobre el mercado o pedidos..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              
              <button 
                onClick={() => handleSend()} 
                className="p-4 bg-slate-950 text-white rounded-2xl shadow-xl active-scale hover:bg-blue-600 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
            {isRecording && <p className="text-[8px] font-black text-red-500 uppercase text-center animate-pulse tracking-[0.2em]">Escuchando...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
