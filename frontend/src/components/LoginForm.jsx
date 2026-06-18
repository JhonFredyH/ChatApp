import { useState } from "react";
import { Eye, EyeOff, Check, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { SubmitButton } from "./SubmitButton";
import { useAuth } from "../context/useAuth.js";

export function LoginForm() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [remember, setRemember]       = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [emailError, setEmailError]   = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    const nextEmailError =
      email.trim().length === 0
        ? "Ingresa tu correo"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Correo inválido"
        : "";
    const nextPasswordError =
      password.trim().length === 0
        ? "Ingresa tu contraseña"
        : password.trim().length < 8
        ? "La contraseña debe tener al menos 8 caracteres"
        : "";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al iniciar sesión";
      setPasswordError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        id="login-email"
        label="Correo electronico"
        type="email"
        placeholder="nombre@empresa.com"
        value={email}
        onChange={setEmail}
        error={emailError}
        icon="mail"
      />

      <div className="mt-10">
        <label
          htmlFor="login-pass"
          className="mb-1.5 block font-mono text-[length:var(--text-xs)] uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
        >
          Contrasena
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
            <Lock size={15} strokeWidth={1.6} />
          </span>
          <input
            id="login-pass"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            placeholder="••••••••"
            required
            aria-invalid={!!passwordError}
            className={`w-full rounded-lg border bg-[var(--bg-dark-tertiary)] py-2.5 pl-9 pr-10 text-[length:var(--text-sm)] text-[color:var(--text-on-dark)] outline-none transition-all duration-200 placeholder:text-[color:var(--text-muted)] focus:border-[var(--primary)] ${
              passwordError ? "border-[#E24B4A]" : "border-[var(--border-dark)]"
            }`}
          />
          {passwordError && (
            <p className="mt-1.5 text-[length:var(--text-xs)] text-[#E24B4A]">
              {passwordError}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] opacity-50 transition-opacity hover:opacity-100"
          >
            {showPass ? (
              <EyeOff size={15} strokeWidth={1.6} />
            ) : (
              <Eye size={15} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex cursor-pointer select-none items-center gap-2 mt-6">
          <div
            className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors duration-150 ${
              remember
                ? "border-[var(--primary)] bg-[var(--primary)]"
                : "border-[var(--border-dark)] bg-[var(--bg-dark-tertiary)]"
            }`}
            onClick={() => setRemember(!remember)}
          >
            {remember && <Check size={10} strokeWidth={3} color="white" />}
          </div>
          <span className="text-[length:var(--text-sm)] text-[color:var(--text-on-dark-muted)]">
            Recordarme
          </span>
        </label>
        <button
          type="button"
          className="text-[length:var(--text-sm)] text-[color:var(--primary-light)] transition-colors hover:underline mt-6"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <SubmitButton
        loading={loading}
        label="Iniciar sesion"
        loadingLabel="Iniciando sesion..."
      />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-dark)]" />
        <span className="font-mono text-[length:var(--text-xs)] uppercase tracking-widest text-[color:var(--text-muted)]">
          o continuar con
        </span>
        <div className="h-px flex-1 bg-[var(--border-dark)]" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border-dark)] bg-[var(--bg-dark-tertiary)] py-2.5 text-[length:var(--text-sm)] text-[color:var(--text-on-dark)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        <FcGoogle size={18} /> Google
      </button>
    </form>
  );
}
