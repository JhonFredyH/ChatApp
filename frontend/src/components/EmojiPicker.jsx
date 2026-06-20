import { useState, useEffect, useRef } from "react";

const EMOJIS = {
  "😊 Caras": ["😊","😂","🤣","😍","🥰","😘","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","😈","💀","☠️","💩","🤡","👻","👽","🤖","😺","😸","😹","😻"],
  "👋 Gestos": ["👍","👎","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👋","🤚","🖐️","✋","🖖","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","👄"],
  "❤️ Corazones": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎"],
  "🎉 Celebración": ["🎉","🎊","🎈","🎁","🎀","🎗️","🎟️","🎫","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎪","🤹","🎭","🎨","🎬","🎤","🎧","🎼","🎵","🎶","🎹","🥁","🎷","🎺","🎸","🪕","🎻"],
  "🔥 Popular": ["🔥","⭐","✨","💫","🌟","🎯","🚀","💡","👑","💎","🌈","☀️","🌙","⚡","❄️","🌊","🍀","🦋","🌸","🌺","🌻","🌹","🍕","🍔","🍟","🌮","🍜","🍣","🍩","🍪","🎂","🍰","🧁","🍫"],
};

export function EmojiPicker({ onSelect, onClose }) {
  const [category, setCategory] = useState(Object.keys(EMOJIS)[0]);
  const [search, setSearch]     = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = search
    ? Object.values(EMOJIS).flat().filter((emoji) => emoji.includes(search.trim()))
    : EMOJIS[category] || [];

  return (
    <div ref={ref}
      className="absolute bottom-14 right-12 z-50 w-72 rounded-2xl border border-white/[0.08] bg-[#1a1a2e] shadow-2xl overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar emoji..."
          className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/30 outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Categories */}
      {!search && (
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
          {Object.keys(EMOJIS).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-all ${
                category === cat ? "bg-[var(--primary)] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
              }`}>
              {cat.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emojis */}
      <div className="grid grid-cols-8 gap-0.5 px-3 pb-3 max-h-48 overflow-y-auto scrollbar-thin">
        {filtered.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-white/[0.08] transition-all">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}