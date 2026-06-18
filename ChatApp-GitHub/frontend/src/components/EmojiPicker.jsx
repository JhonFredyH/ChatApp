import { useEffect, useRef } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-14 right-12 z-50">
      <Picker
        data={data}
        onEmojiSelect={(emoji) => {
          onSelect(emoji.native);
          onClose();
        }}
        theme="dark"
        locale="es"
        previewPosition="none"
        skinTonePosition="none"
      />
    </div>
  );
}
