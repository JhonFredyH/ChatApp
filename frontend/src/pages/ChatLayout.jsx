import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import socket from "../lib/socket.js";
import api from "../lib/axios.js";
import { useAuth } from "../context/useAuth.js";
import { EmojiPicker } from "../components/EmojiPicker.jsx";

// ─── Helpers ───────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

const formatLastSeen = (date) => {
  if (!date) return "Nunca";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

const COLORS = [
  "from-violet-500 to-purple-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
];

const getColor = (str = "") => {
  let hash = 0;
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

// ─── Toast System ──────────────────────────────────────────────────
const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} onClick={() => onDismiss(t.id)}
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-[#1a1a2e]/95 backdrop-blur-md shadow-2xl shadow-black/40 cursor-pointer transition-all duration-300 max-w-[320px] animate-slide-in">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(t.author)} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0`}>
          {getInitials(t.author)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[12px] font-semibold text-white/90 truncate">{t.author}</span>
            {t.channel && <span className="text-[10px] text-white/30">en #{t.channel}</span>}
            {t.isDm && <span className="text-[10px] text-[var(--primary-light)]">DM</span>}
          </div>
          <p className="text-[12px] text-white/55 truncate">{t.message}</p>
        </div>
        <span className="text-[10px] text-white/25 flex-shrink-0 font-mono">{t.time}</span>
      </div>
    ))}
  </div>
);

const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-4), { ...toast, id, time: formatTime(new Date()) }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, addToast, dismiss };
};

// ─── NavBar ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "ti-message-2", label: "Mensajes",       view: "chat"  },
  { icon: "ti-users",     label: "Equipo",         view: "team"  },
  { icon: "ti-bell",      label: "Notificaciones", view: null    },
  { icon: "ti-command",   label: "Comandos",       view: null    },
];

const NavBar = ({ userInitials = "JD", onLogout, unreadCount, activeView, onChangeView }) => (
  <nav aria-label="Navegación global"
    className="w-[60px] flex-shrink-0 bg-[var(--surface-nav)] flex flex-col items-center py-4 gap-1 border-r border-[var(--border-dark)]">
    <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center mb-3 shadow-lg shadow-[var(--primary)]/40">
      <i className="ti ti-bolt text-white text-base" aria-hidden />
    </div>
    {NAV_ITEMS.map(({ icon, label, view }) => (
      <div key={label} className="relative">
        <button type="button" aria-label={label}
          aria-current={activeView === view ? "page" : undefined}
          onClick={() => view && onChangeView(view)}
          className={[
            "w-9 h-9 rounded-xl flex items-center justify-center text-[17px] transition-all duration-150",
            activeView === view
              ? "bg-white/[0.08] text-white shadow-inner"
              : "text-white/30 hover:text-white/70 hover:bg-white/[0.05]",
          ].join(" ")}>
          <i className={`ti ${icon}`} aria-hidden />
        </button>
        {icon === "ti-bell" && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
    ))}
    <div className="flex-1" />
    <button type="button" aria-label="Configuración"
      className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
      <i className="ti ti-settings" aria-hidden />
    </button>
    <button type="button" onClick={onLogout} aria-label="Cerrar sesión"
      className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] text-white/30 hover:text-red-400 hover:bg-white/[0.05] transition-all">
      <i className="ti ti-logout" aria-hidden />
    </button>
    <button type="button" aria-label="Mi perfil"
      className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-white mt-1 ring-2 ring-white/10 hover:ring-white/25 transition-all">
      {userInitials}
    </button>
  </nav>
);

// ─── Team Panel ────────────────────────────────────────────────────
const TeamPanel = ({ users, currentUser, onStartDm }) => {
  const online  = users.filter((u) => u.isOnline);
  const offline = users.filter((u) => !u.isOnline);

  const MemberCard = ({ u }) => (
    <div
      onClick={() => onStartDm(u)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all cursor-pointer group"
    >
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(u.name)} flex items-center justify-center text-[12px] font-semibold text-white`}>
          {getInitials(u.name)}
        </div>
        <span className={`absolute -bottom-px -right-px w-3 h-3 rounded-full ring-2 ring-[var(--bg-dark)] ${u.isOnline ? "bg-emerald-400" : "bg-white/20"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white/90 truncate">{u.name}</p>
        <p className={`text-[11px] truncate ${u.isOnline ? "text-emerald-400/80" : "text-white/30"}`}>
          {u.isOnline ? "En línea" : `Visto ${formatLastSeen(u.lastSeen)}`}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onStartDm(u); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center text-[14px] text-white/50 hover:text-white hover:bg-white/[0.08]"
        aria-label={`Enviar mensaje a ${u.name}`}
      >
        <i className="ti ti-message-2" aria-hidden />
      </button>
    </div>
  );

  return (
    <main className="flex-1 bg-[var(--bg-dark)] flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border-dark)] bg-[var(--surface-nav)]/80 backdrop-blur-sm flex-shrink-0">
        <i className="ti ti-users text-white/40 text-[16px]" aria-hidden />
        <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">Equipo</span>
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
        <p className="text-[12px] text-white/30">{users.length + 1} miembros</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">

        {/* Tú */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20 mb-3">Tú</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5">
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(currentUser?.name)} flex items-center justify-center text-[12px] font-semibold text-white`}>
                {getInitials(currentUser?.name)}
              </div>
              <span className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-dark)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90 truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-emerald-400/80">En línea</p>
            </div>
            <span className="text-[10px] text-[var(--primary-light)] bg-[var(--primary)]/10 px-2 py-1 rounded-full">Tú</span>
          </div>
        </div>

        {/* Online */}
        {online.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20 mb-3">
              En línea — {online.length}
            </p>
            <div className="flex flex-col gap-2">
              {online.map((u) => <MemberCard key={u.id} u={u} />)}
            </div>
          </div>
        )}

        {/* Offline */}
        {offline.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20 mb-3">
              Desconectados — {offline.length}
            </p>
            <div className="flex flex-col gap-2">
              {offline.map((u) => <MemberCard key={u.id} u={u} />)}
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────
const ChannelRow = ({ channel, active, onClick }) => (
  <button type="button" onClick={onClick} aria-current={active ? "true" : undefined}
    className={["group w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-left transition-all duration-100 text-[13px] mb-px",
      active ? "bg-white/[0.07] text-white" : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"].join(" ")}>
    <span className={["text-[15px] w-4 text-center flex-shrink-0 leading-none",
      active ? "text-white/50" : "text-white/20 group-hover:text-white/35"].join(" ")}>#</span>
    <span className="flex-1 truncate font-[450] tracking-[-0.01em]">{channel.name}</span>
    {channel.unread > 0 && (
      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
        {channel.unread}
      </span>
    )}
  </button>
);

const DmRow = ({ dm, active, onClick, unread }) => (
  <button type="button" onClick={onClick} aria-current={active ? "true" : undefined}
    className={["group w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-left transition-all duration-100 mb-px",
      active ? "bg-white/[0.07] text-white" : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"].join(" ")}>
    <div className="relative flex-shrink-0">
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getColor(dm.name)} flex items-center justify-center text-[10px] font-semibold text-white`}>
        {getInitials(dm.name)}
      </div>
      {dm.isOnline && (
        <span className="absolute -bottom-px -right-px w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-dark-secondary)]" aria-hidden />
      )}
    </div>
    <span className="text-[13px] font-[450] truncate tracking-[-0.01em]">{dm.name}</span>
    {unread > 0 && (
      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
        {unread}
      </span>
    )}
    {!unread && dm.isOnline && (
      <span className="ml-auto text-[10px] text-emerald-500/70 font-medium">en línea</span>
    )}
  </button>
);

const SideSection = ({ title, children, action }) => (
  <div className="px-3 py-2">
    <div className="flex items-center justify-between px-2.5 mb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">{title}</span>
      {action && (
        <button type="button" aria-label={`Agregar ${title}`}
          className="w-4 h-4 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors rounded">
          <i className="ti ti-plus text-[12px]" aria-hidden />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Sidebar = ({ channels, activeChannel, onSelectChannel, users, currentUser, activeDm, onSelectDm, dmUnreads }) => (
  <aside aria-label="Barra lateral" className="w-[220px] flex-shrink-0 bg-[var(--bg-dark-secondary)] flex flex-col border-r border-[var(--border-dark)]">
    <div className="px-4 py-[14px] border-b border-[var(--border-dark)] flex items-center gap-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white tracking-[-0.01em] truncate">NexusFlow</p>
        <p className="text-[11px] text-white/30 mt-px">{users.filter((u) => u.isOnline).length + 1} miembros activos</p>
      </div>
      <button type="button" aria-label="Opciones"
        className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all flex-shrink-0">
        <i className="ti ti-dots text-[15px]" aria-hidden />
      </button>
    </div>

    <div className="px-3 py-2.5 border-b border-[var(--border-dark)]">
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-colors cursor-text">
        <i className="ti ti-search text-[13px] text-white/25" aria-hidden />
        <span className="text-[12px] text-white/25">Buscar...</span>
        <span className="ml-auto text-[10px] text-white/15 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</span>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-thin">
      <SideSection title="Canales" action>
        {channels.map((ch) => (
          <ChannelRow key={ch.id} channel={ch} active={!activeDm && activeChannel?.id === ch.id} onClick={() => onSelectChannel(ch)} />
        ))}
      </SideSection>
      <div className="mx-3 my-1 border-t border-[var(--border-dark)]" />
      <SideSection title="Directos" action>
        {users.map((u) => (
          <DmRow key={u.id} dm={u} active={activeDm?.id === u.id} onClick={() => onSelectDm(u)} unread={dmUnreads[u.id] || 0} />
        ))}
      </SideSection>
    </div>

    <div className="px-3 py-2.5 border-t border-[var(--border-dark)] flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getColor(currentUser?.name)} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0`}>
        {getInitials(currentUser?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white/80 truncate">{currentUser?.name}</p>
        <p className="text-[10px] text-emerald-400/70 truncate">En línea</p>
      </div>
      <button type="button" className="text-white/20 hover:text-white/60 transition-colors">
        <i className="ti ti-chevron-up-down text-[14px]" aria-hidden />
      </button>
    </div>
  </aside>
);

// ─── Message Bubble ────────────────────────────────────────────────
const MessageBubble = React.memo(({ msg, currentUserId }) => {
  const isMe       = msg.senderId === currentUserId || msg.userId === currentUserId || msg.isMe;
  const authorName = msg.sender?.name || msg.user?.name || msg.author || "Usuario";
  const color      = getColor(authorName);
  const initials   = getInitials(authorName);
  const time       = msg.time || formatTime(msg.createdAt);
  const content    = msg.content || msg.text;

  // Detectar si es una imagen
  const isImage = msg.type === 'IMAGE' || (content && typeof content === 'string' && 
    content.startsWith('https://') && 
    (content.includes('.jpg') || content.includes('.jpeg') || 
     content.includes('.png') || content.includes('.gif') || 
     content.includes('.webp') || content.includes('chat-images')));

  if (isMe) {
    return (
      <div className="flex justify-end items-end gap-2 group">
        <span className="text-[11px] text-white/20 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{time}</span>
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-[13px] leading-[1.6] max-w-[68%] shadow-lg shadow-[var(--primary)]/20">
          {isImage ? (
            <img 
              src={content} 
              alt="Imagen enviada" 
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(content, '_blank')}
              loading="lazy"
            />
          ) : (
            content
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start group">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 mt-0.5`} aria-hidden>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2.5 mb-1">
          <span className="text-[13px] font-semibold text-white/90">{authorName}</span>
          <span className="text-[11px] text-white/25 font-mono">{time}</span>
        </div>
        <div className="bg-white/[0.04] border border-[var(--border-dark)] rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full">
          {isImage ? (
            <img 
              src={content} 
              alt="Imagen enviada" 
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(content, '_blank')}
              loading="lazy"
            />
          ) : (
            <p className="text-[13px] text-white/65 leading-[1.65]">
              {content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// ─── Typing Indicator ──────────────────────────────────────────────
const TypingIndicator = ({ typingUser }) => {
  if (!typingUser) return null;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(typingUser)} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0`}>
        {getInitials(typingUser)}
      </div>
      <div className="flex items-center gap-1.5 bg-white/[0.04] border border-[var(--border-dark)] rounded-2xl rounded-tl-sm px-4 py-2.5">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
            style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }} />
        ))}
      </div>
      <span className="text-[11px] text-white/30">{typingUser} está escribiendo...</span>
    </div>
  );
};

// ─── Input Bar ─────────────────────────────────────────────────────
const InputBar = ({ placeholder, onSend, onTyping, onTypingStop }) => {
  const [input, setInput]         = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const typingTimer               = useRef(null);
  const inputRef                  = useRef(null);
  const fileInputRef              = useRef(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
    setShowEmoji(false);
    onTypingStop?.();
    clearTimeout(typingTimer.current);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    onTyping?.();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTypingStop?.(), 2000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEmojiSelect = (emoji) => {
    const cursor  = inputRef.current?.selectionStart ?? input.length;
    const newText = input.slice(0, cursor) + emoji + input.slice(cursor);
    setInput(newText);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursor + emoji.length, cursor + emoji.length);
    }, 0);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    try {
      setUploading(true);
      const { uploadImage } = await import('../lib/uploadService');
      const result = await uploadImage(file);
      onSend({ content: result.url, type: 'IMAGE' });
      e.target.value = '';
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-5 pb-5 flex-shrink-0 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {showEmoji && (
        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
      )}
      <div className="relative flex items-end gap-2 bg-white/[0.04] rounded-2xl border border-[var(--border-dark)] focus-within:border-[var(--primary)]/40 focus-within:bg-white/[0.05] transition-all duration-200">
        <button
          type="button"
          aria-label="Adjuntar"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex-shrink-0 w-9 h-9 mb-1.5 ml-1.5 rounded-xl flex items-center justify-center text-[16px] transition-all ${
            uploading
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
          }`}
        >
          {uploading ? (
            <i className="ti ti-loader-2 animate-spin" aria-hidden />
          ) : (
            <i className="ti ti-paperclip" aria-hidden />
          )}
        </button>
        <textarea ref={inputRef} value={input} onChange={handleChange} onKeyDown={handleKey}
          placeholder={placeholder} rows={1}
          className="flex-1 bg-transparent text-[13px] text-white/85 placeholder-white/25 outline-none resize-none py-[11px] leading-relaxed max-h-[120px] overflow-y-auto" />
        <button type="button" aria-label="Emoji" onClick={() => setShowEmoji((p) => !p)}
          className={["flex-shrink-0 w-9 h-9 mb-1.5 rounded-xl flex items-center justify-center text-[16px] transition-all",
            showEmoji ? "text-[var(--primary-light)] bg-white/[0.06]" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"].join(" ")}>
          <i className="ti ti-mood-smile" aria-hidden />
        </button>
        <button type="button" onClick={handleSend} aria-label="Enviar" disabled={!input.trim()}
          className={["flex-shrink-0 w-9 h-9 mb-1.5 mr-1.5 rounded-xl flex items-center justify-center text-[16px] transition-all duration-150",
            input.trim() ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white hover:scale-105 shadow-lg shadow-[var(--primary)]/30"
              : "bg-white/[0.05] text-white/20 cursor-not-allowed"].join(" ")}>
          <i className="ti ti-send-2" aria-hidden />
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-white/20">
        <kbd className="font-mono">Enter</kbd> para enviar · <kbd className="font-mono">Shift+Enter</kbd> nueva línea
      </p>
    </div>
  );
};


// ─── Chat Area ─────────────────────────────────────────────────────
const ChatArea = ({ channel, currentUser }) => {
  const [messages,   setMessages]   = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!channel?.id) return;
    setMessages([]);
    setLoading(true);
    socket.emit("channel:join", channel.id);
    api.get(`/channels/${channel.id}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(({ data }) => setMessages(data)).catch(console.error).finally(() => setLoading(false));
    return () => socket.emit("channel:leave", channel.id);
  }, [channel?.id]);

  useEffect(() => {
    const onNew      = (msg) => setMessages((p) => p.find((m) => m.id === msg.id) ? p : [...p, msg]);
    const onTypStart = ({ userName }) => { if (userName !== currentUser?.name) setTypingUser(userName); };
    const onTypStop  = () => setTypingUser(null);
    socket.on("message:new",  onNew);
    socket.on("typing:start", onTypStart);
    socket.on("typing:stop",  onTypStop);
    return () => {
      socket.off("message:new",  onNew);
      socket.off("typing:start", onTypStart);
      socket.off("typing:stop",  onTypStop);
    };
  }, [currentUser?.name]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUser]);

  const handleSend = (payload) => {
    const message = typeof payload === 'string'
      ? { content: payload, type: 'TEXT' }
      : payload;

    socket.emit("message:send", {
      channelId: channel.id,
      content: message.content,
      userId: currentUser.id,
      type: message.type,
    });
  };

  return (
    <main className="flex-1 bg-[var(--bg-dark)] flex flex-col min-w-0">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-dark)] bg-[var(--surface-nav)]/80 backdrop-blur-sm flex-shrink-0">
        <span className="text-white/30 text-[15px] font-light">#</span>
        <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">{channel?.name}</span>
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
        <p className="text-[12px] text-white/30 truncate hidden sm:block">Canal del equipo de {channel?.name}</p>
        <div className="ml-auto flex items-center gap-1">
          {["ti-search", "ti-layout-list", "ti-dots"].map((icon) => (
            <button key={icon} type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
              <i className={`ti ${icon}`} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 scrollbar-thin" aria-live="polite">
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/[0.05]" />
          <span className="text-[11px] text-white/25 font-medium px-2">Hoy</span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
        {loading && <div className="flex items-center justify-center py-8"><span className="text-[12px] text-white/30">Cargando mensajes...</span></div>}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-[13px] text-white/20">No hay mensajes aún</span>
            <span className="text-[12px] text-white/15">¡Sé el primero en escribir!</span>
          </div>
        )}
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} currentUserId={currentUser?.id} />)}
        <TypingIndicator typingUser={typingUser} />
        <div ref={bottomRef} />
      </div>

      <InputBar
        placeholder={`Mensaje en #${channel?.name}`}
        onSend={handleSend}
        onTyping={() => socket.emit("typing:start", { channelId: channel.id, userName: currentUser?.name })}
        onTypingStop={() => socket.emit("typing:stop", { channelId: channel.id })}
      />
    </main>
  );
};

// ─── DM Area ───────────────────────────────────────────────────────
const DmArea = ({ dmUser, currentUser }) => {
  const [messages,   setMessages]   = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const bottomRef = useRef(null);
  const dmRoomId  = [currentUser?.id, dmUser?.id].sort().join("-");

  useEffect(() => {
    if (!dmUser?.id || !currentUser?.id) return;
    setMessages([]);
    setLoading(true);
    socket.emit("dm:join", dmRoomId);
    api.get(`/dms/${dmUser.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(({ data }) => setMessages(data)).catch(console.error).finally(() => setLoading(false));
    return () => socket.emit("dm:leave", dmRoomId);
  }, [dmUser?.id, currentUser?.id, dmRoomId]);

  useEffect(() => {
    const onNew      = (msg) => setMessages((p) => p.find((m) => m.id === msg.id) ? p : [...p, msg]);
    const onTypStart = ({ userName }) => { if (userName !== currentUser?.name) setTypingUser(userName); };
    const onTypStop  = () => setTypingUser(null);
    socket.on("dm:new",       onNew);
    socket.on("typing:start", onTypStart);
    socket.on("typing:stop",  onTypStop);
    return () => {
      socket.off("dm:new",       onNew);
      socket.off("typing:start", onTypStart);
      socket.off("typing:stop",  onTypStop);
    };
  }, [currentUser?.name]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUser]);

const handleSend = (payload) => {
      const message = typeof payload === 'string'
        ? { content: payload, type: 'TEXT' }
        : payload;

      socket.emit("dm:send", {
        receiverId: dmUser.id,
        senderId: currentUser.id,
        content: message.content,
        roomId: dmRoomId,
        type: message.type,
      });
  };

  return (
    <main className="flex-1 bg-[var(--bg-dark)] flex flex-col min-w-0">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-dark)] bg-[var(--surface-nav)]/80 backdrop-blur-sm flex-shrink-0">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(dmUser?.name)} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0`}>
          {getInitials(dmUser?.name)}
        </div>
        <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">{dmUser?.name}</span>
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
        <span className={`text-[11px] ${dmUser?.isOnline ? "text-emerald-400" : "text-white/30"}`}>
          {dmUser?.isOnline ? "En línea" : "Desconectado"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {["ti-search", "ti-dots"].map((icon) => (
            <button key={icon} type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
              <i className={`ti ${icon}`} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 scrollbar-thin" aria-live="polite">
        {loading && <div className="flex items-center justify-center py-8"><span className="text-[12px] text-white/30">Cargando mensajes...</span></div>}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getColor(dmUser?.name)} flex items-center justify-center text-2xl font-semibold text-white`}>
              {getInitials(dmUser?.name)}
            </div>
            <p className="text-[14px] font-semibold text-white/60">{dmUser?.name}</p>
            <p className="text-[12px] text-white/25">Este es el inicio de tu conversación privada</p>
          </div>
        )}
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} currentUserId={currentUser?.id} />)}
        <TypingIndicator typingUser={typingUser} />
        <div ref={bottomRef} />
      </div>

      <InputBar
        placeholder={`Mensaje a ${dmUser?.name}`}
        onSend={handleSend}
        onTyping={() => socket.emit("typing:start", { channelId: dmRoomId, userName: currentUser?.name })}
        onTypingStop={() => socket.emit("typing:stop", { channelId: dmRoomId })}
      />
    </main>
  );
};

// ─── Root ──────────────────────────────────────────────────────────
export default function ChatLayout() {
  const { user, logout }                  = useAuth();
  const [channels, setChannels]           = useState([]);
  const [users, setUsers]                 = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeDm, setActiveDm]           = useState(null);
  const [fullUser, setFullUser]           = useState(null);
  const [dmUnreads, setDmUnreads]         = useState({});
  const [unreadCount, setUnreadCount]     = useState(0);
  const [activeView, setActiveView]       = useState("chat"); // "chat" | "team"
  const { toasts, addToast, dismiss }     = useToasts();

  useEffect(() => {
    const token   = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };
    api.get("/channels", { headers })
      .then(({ data }) => { setChannels(data); if (data.length > 0) setActiveChannel(data[0]); })
      .catch(console.error);
    api.get("/channels/users/all", { headers })
      .then(({ data }) => setUsers(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setFullUser(JSON.parse(stored)); return; } catch {}
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setFullUser({ id: payload.userId, name: user.name || "Usuario" });
      } catch { setFullUser(user); }
    }
  }, [user]);

  useEffect(() => {
    const onNewMessage = (msg) => {
      const isActiveChannel = activeChannel?.id === msg.channelId;
      const isMyMessage     = msg.userId === fullUser?.id || msg.user?.id === fullUser?.id;
      if (!isActiveChannel && !isMyMessage) {
        const channelName = channels.find((c) => c.id === msg.channelId)?.name || "canal";
        addToast({ author: msg.user?.name || "Alguien", message: msg.content, channel: channelName, isDm: false });
        setUnreadCount((p) => p + 1);
      }
    };
    socket.on("message:new", onNewMessage);
    return () => socket.off("message:new", onNewMessage);
  }, [activeChannel?.id, fullUser?.id, channels, addToast]);

  useEffect(() => {
    const onDmNew = (msg) => {
      const isActiveDm  = activeDm?.id === msg.senderId;
      const isMyMessage = msg.senderId === fullUser?.id;
      if (!isActiveDm && !isMyMessage) {
        addToast({ author: msg.sender?.name || "Alguien", message: msg.content, isDm: true });
        setDmUnreads((p) => ({ ...p, [msg.senderId]: (p[msg.senderId] || 0) + 1 }));
        setUnreadCount((p) => p + 1);
      }
    };
    socket.on("dm:new", onDmNew);
    return () => socket.off("dm:new", onDmNew);
  }, [activeDm?.id, fullUser?.id, addToast]);

  const handleSelectChannel = useCallback((ch) => {
    setActiveChannel(ch);
    setActiveDm(null);
    setActiveView("chat");
    setUnreadCount((p) => Math.max(0, p - 1));
  }, []);

  const handleSelectDm = useCallback((u) => {
    setActiveDm(u);
    setActiveChannel(null);
    setActiveView("chat");
    setUnreadCount((p) => Math.max(0, p - (dmUnreads[u.id] || 0)));
    setDmUnreads((p) => ({ ...p, [u.id]: 0 }));
  }, [dmUnreads]);

  // Desde el panel equipo → abrir DM
  const handleStartDmFromTeam = useCallback((u) => {
    setActiveDm(u);
    setActiveChannel(null);
    setActiveView("chat");
    setDmUnreads((p) => ({ ...p, [u.id]: 0 }));
  }, []);

  useEffect(() => {
    const onOnline  = (userId) => setUsers((p) => p.map((u) => u.id === userId ? { ...u, isOnline: true  } : u));
    const onOffline = (userId) => setUsers((p) => p.map((u) => u.id === userId ? { ...u, isOnline: false } : u));
    socket.on("user:online",  onOnline);
    socket.on("user:offline", onOffline);
    return () => { socket.off("user:online", onOnline); socket.off("user:offline", onOffline); };
  }, []);

  const channelsMemo = useMemo(() => channels, [channels]);

  const renderMain = () => {
    if (activeView === "team") {
      return <TeamPanel users={users} currentUser={fullUser} onStartDm={handleStartDmFromTeam} />;
    }
    if (activeDm) return <DmArea dmUser={activeDm} currentUser={fullUser} />;
    if (activeChannel) return <ChatArea channel={activeChannel} currentUser={fullUser} />;
    return <div className="flex-1 flex items-center justify-center text-white/20 text-sm">Selecciona un canal</div>;
  };

  return (
    <div className="flex h-screen bg-[var(--bg-dark)] overflow-hidden font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <NavBar
        userInitials={getInitials(fullUser?.name || "U")}
        onLogout={logout}
        unreadCount={unreadCount}
        activeView={activeView}
        onChangeView={setActiveView}
      />
      <Sidebar
        channels={channelsMemo}
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
        users={users}
        currentUser={fullUser}
        activeDm={activeDm}
        onSelectDm={handleSelectDm}
        dmUnreads={dmUnreads}
      />
      {renderMain()}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.25s ease; }
      `}</style>
    </div>
  );
}
