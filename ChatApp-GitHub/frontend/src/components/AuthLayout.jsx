import { useState } from "react";
import { Hexagon } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export default function AuthLayout() {
  const [tab, setTab] = useState("login");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-dark)] p-4 font-[var(--font-sans)]">
      <div className="flex w-full max-w-[900px] overflow-hidden rounded-2xl border border-[var(--border-dark)] bg-[var(--bg-dark-secondary)] shadow-2xl">
        
        {/* Panel izquierdo decorativo */}
        <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[var(--bg-dark)] p-8 md:flex">
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7F77DD" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="pointer-events-none absolute -left-20 -top-20 h-[280px] w-[280px] rounded-full bg-[#534AB7] opacity-20 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-[#7F77DD] opacity-10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-20">
            <svg viewBox="0 0 300 340" className="h-[380px] w-[380px]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="150,10 280,80 280,260 150,330 20,260 20,80" stroke="url(#hexGrad)" strokeWidth="1" fill="url(#hexFill)" />
              <polygon points="150,40 255,100 255,240 150,300 45,240 45,100" stroke="url(#hexGrad2)" strokeWidth="0.5" fill="none" strokeDasharray="4 6" />
              <defs>
                <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#534AB7" /><stop offset="100%" stopColor="#7F77DD" /></linearGradient>
                <linearGradient id="hexGrad2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7F77DD" /><stop offset="100%" stopColor="#534AB7" /></linearGradient>
                <radialGradient id="hexFill" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#534AB7" stopOpacity="0.15" /><stop offset="100%" stopColor="#534AB7" stopOpacity="0" /></radialGradient>
              </defs>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="relative flex h-[22px] w-[22px] items-center justify-center">
                <Hexagon size={22} strokeWidth={1.5} color="#7F77DD" />
                <div className="absolute h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#534AB7]/60" />
                <div className="absolute h-1.5 w-1.5 rounded-full bg-[#7F77DD]" />
              </div>
              <span className="font-['Inter',sans-serif] text-[clamp(1.2rem,1.3vw,1.5rem)] font-semibold tracking-wide text-white">NexusChat</span>
            </div>
          </div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-[length:var(--text-2xl)] font-semibold leading-[1.25] text-white">Comunicacion empresarial sin limites</h1>
            <p className="font-mono text-[length:var(--text-xs)] uppercase tracking-[0.18em] text-[#534AB7]">CONNECTIVITY</p>
            <p className="text-[length:var(--text-lg)] leading-[1.6] text-[color:var(--text-on-dark-muted)]">Conecta con tu <span className="text-blue-500">equipo</span> en tiempo real.</p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            {["Enterprise Ready", "Global Infrastructure"].map((t, i) => (
              <span key={t} className="flex items-center gap-4">
                {i > 0 && <span className="text-[color:var(--border-dark)]">-</span>}
                <span className="font-mono text-[length:var(--text-xs)] uppercase tracking-widest text-[color:var(--text-muted)]">{t}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex w-full flex-col justify-center bg-[var(--bg-dark-secondary)] px-8 py-10 md:w-[54%]">
          <div className="mb-6 flex md:hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex h-[22px] w-[22px] items-center justify-center">
                <Hexagon size={22} strokeWidth={1.5} color="#7F77DD" />
                <div className="absolute h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#534AB7]/60" />
                <div className="absolute h-1.5 w-1.5 rounded-full bg-[#7F77DD]" />
              </div>
              <span className="font-['Inter',sans-serif] text-[clamp(1.2rem,1.3vw,1.5rem)] font-semibold tracking-wide text-white">NexusChat</span>
            </div>
          </div>

          <h2 className="mb-5 text-left text-[length:var(--text-2xl)] font-semibold text-white">{tab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h2>

          <div className="mb-7 flex border-b border-[var(--border-dark)]">
            {["login", "register"].map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`relative mr-6 cursor-pointer border-none bg-transparent pb-3 text-[length:var(--text-lg)] transition-colors duration-200 ${tab === item ? "font-semibold text-[color:var(--text-on-dark)]" : "font-normal text-[color:var(--text-muted)]"}`}>
                {item === "login" ? "Iniciar sesion" : "Crear cuenta"}
                {tab === item && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]" />}
              </button>
            ))}
          </div>

          <div key={tab} className="fade-in">
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          <p className="mt-5 text-center text-[length:var(--text-sm)] text-[color:var(--text-on-dark-muted)]">
            {tab === "login" ? (<>¿No tienes una cuenta? <button type="button" onClick={() => setTab("register")} className="font-medium text-[color:var(--primary-light)] hover:underline">Crear cuenta</button></>) : (<>¿Ya tienes cuenta? <button type="button" onClick={() => setTab("login")} className="text-lg font-medium text-[color:var(--primary-light)] hover:underline">Iniciar sesion</button></>)}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-anim { animation: spin 0.8s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.22s ease; }
      `}</style>
    </div>
  );
}