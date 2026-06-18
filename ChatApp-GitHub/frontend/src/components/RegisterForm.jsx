import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { SubmitButton } from "./SubmitButton";
import { useAuth } from "../context/useAuth.js";

export function RegisterForm() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [nameError, setNameError]     = useState("");
  const [emailError, setEmailError]   = useState("");
  const [passwordError, setPasswordError] = useState("");

  const strength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const validate = () => {
    const nextNameError =
      name.trim().length === 0 ? "Ingresa tu nombre" : "";
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
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextNameError && !nextEmailError && !nextPasswordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear cuenta";
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[length:var(--text-sm)] text-[color:var(--text-on-dark-muted)]">
        Es gratis, solo toma un minuto
      </p>

      <InputField
        id="reg-name"
        label="Nombre completo"
        placeholder="Juan Diaz"
        value={name}
        onChange={setName}
        error={nameError}
        icon="user"
      />

      <InputField
        id="reg-email"
        label="Correo electronico"
        type="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={setEmail}
        error={emailError}
        icon="mail"
      />

      <div>
        <label
          htmlFor="reg-pass"
          className="mb-1.5 block font-mono text-[length:var(--text-xs)] uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
        >
          Contrasena
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
            <Lock size={15} strokeWidth={1.6} />
          </span>
          <input
            id="reg-pass"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            placeholder="Minimo 8 caracteres"
            required
            minLength={8}
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

        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    strength >= i
                      ? ["", "bg-[#E24B4A]", "bg-[#EF9F27]", "bg-[#1D9E75]"][strength]
                      : "bg-[var(--border-dark)]"
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-[length:var(--text-xs)] ${
                ["", "text-[#E24B4A]", "text-[#EF9F27]", "text-[#1D9E75]"][strength]
              }`}
            >
              {["", "Debil", "Regular", "Fuerte"][strength]}
            </p>
          </div>
        )}
      </div>

      <SubmitButton
        loading={loading}
        label="Crear cuenta"
        loadingLabel="Creando cuenta..."
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
