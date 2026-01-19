
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ShieldCheck, Key, ArrowLeft, 
  Send, CheckCircle2, AlertCircle, RefreshCw, Smartphone, 
  BellRing, ClipboardCheck, Chrome, Fingerprint, Trash2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthView = 'LOGIN' | 'FORGOT_PASSWORD' | '2FA' | 'RESET_SENT';

const AuthScreen: React.FC = () => {
  const { login, verify2FA } = useAuth();
  
  // States
  const [view, setView] = useState<AuthView>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('agronaturex.com1@gmail.com');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean, msg: string, code?: string }>({ show: false, msg: '' });

  // Refs para OTP
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Notificación Simulada
  const triggerToast = (msg: string, code?: string) => {
    setToast({ show: true, msg, code });
    setTimeout(() => setToast({ show: false, msg: '' }), 15000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("¡Código copiado al portapapeles!", text);
  };

  // Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const code = await login(email, password);
      if (code) {
        triggerToast(`Seguridad: Código 2FA enviado a ${email}`, code);
        setView('2FA');
      }
    } catch (err) {
      setError('Credenciales institucionales no válidas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError('');
    const success = await verify2FA(code, email);
    if (!success) {
      setError('El código ingresado es incorrecto o ha expirado.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    triggerToast("Iniciando OAuth 2.0 con Google Cloud...");
    setTimeout(() => {
      setIsLoading(false);
      setError("El dominio corporativo requiere validación manual por políticas de seguridad.");
    }, 2000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView('RESET_SENT');
      triggerToast(`Enlace de recuperación enviado a ${email}`);
    }, 1500);
  };

  // OTP Logic
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const digits = data.split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
    
    if (digits.length === 6) {
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  const clearOtp = () => {
    setOtp(new Array(6).fill(''));
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      
      {/* SIMULADOR DE NOTIFICACIÓN PUSH / MAIL */}
      {toast.show && (
        <div 
          onClick={() => toast.code && copyToClipboard(toast.code)}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm cursor-pointer animate-in slide-in-from-top duration-500"
        >
           <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                 <BellRing className="animate-bounce" size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Notificación de Seguridad</p>
                 <p className="text-xs font-bold text-white truncate">{toast.msg}</p>
                 {toast.code && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl font-black text-emerald-400 tracking-[0.3em] font-mono">{toast.code}</p>
                      <ClipboardCheck size={14} className="text-emerald-500/50" />
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="w-full max-w-[440px] relative">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px]"></div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden">
          
          {/* LOGIN VIEW */}
          {view === 'LOGIN' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-900/40 rotate-3">
                  <ShieldCheck className="text-white" size={36} />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">AgriCRM</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Acceso Institucional B2B</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="ejemplo@agronaturex.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contraseña</label>
                    <button 
                      type="button" 
                      onClick={() => setView('FORGOT_PASSWORD')}
                      className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in shake duration-300">
                    <AlertCircle size={18} />
                    <p className="text-[10px] font-black uppercase leading-tight">{error}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active-scale"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Fingerprint size={18} />}
                  Validar Credenciales
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                 <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active-scale"
                 >
                    <Chrome size={18} className="text-blue-600" /> Continuar con Google
                 </button>
              </div>
            </div>
          )}

          {/* 2FA VIEW */}
          {view === '2FA' && (
            <div className="animate-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Smartphone className="text-blue-500" size={28} />
                 </div>
                 <h2 className="text-2xl font-black text-white tracking-tighter">Verificación OTP</h2>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                    Código de 6 dígitos enviado a:<br/>
                    <span className="text-blue-400 lowercase">{email}</span>
                 </p>
              </div>

              <div className="flex justify-between gap-2 mb-8" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input 
                    key={i}
                    // Fix: Changed ref to return void by wrapping assignment in braces
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="w-[50px] h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-[9px] font-black uppercase text-center mb-6">{error}</p>}

              <div className="space-y-4">
                <button 
                  onClick={handleVerifyOTP}
                  disabled={otp.includes('') || isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Autorizar Acceso
                </button>

                <div className="flex gap-2">
                   <button 
                    onClick={clearOtp}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                      <Trash2 size={14} /> Limpiar
                   </button>
                   <button 
                    onClick={() => setView('LOGIN')}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                      <ArrowLeft size={14} /> Atrás
                   </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    ¿No recibiste el código? <button className="text-blue-400 hover:underline">Reenviar</button>
                 </p>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'FORGOT_PASSWORD' && (
            <div className="animate-in slide-in-from-right duration-500">
               <button onClick={() => setView('LOGIN')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                  <ArrowLeft size={16} /> Volver al Login
               </button>
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Key className="text-blue-500" size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">Recuperar Acceso</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Se enviará un token temporal</p>
               </div>

               <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="tu@dominio.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-blue-500 transition-all"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active-scale">
                    <Send size={18} /> Enviar Instrucciones
                  </button>
               </form>
            </div>
          )}

          {/* RESET SENT VIEW */}
          {view === 'RESET_SENT' && (
            <div className="animate-in zoom-in duration-500 text-center">
               <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500" size={48} />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tighter mb-4 uppercase italic">¡Solicitud Procesada!</h2>
               <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed italic">
                  "Hemos verificado tu identidad institucional. Revisa tu bandeja de entrada para continuar con el restablecimiento de tu clave."
               </p>
               <button onClick={() => setView('LOGIN')} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">
                  Entendido, volver al inicio
               </button>
            </div>
          )}

        </div>

        {/* Footer Security */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AES-256 Encrypted</span>
           </div>
           <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ISO 27001 Standard</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
