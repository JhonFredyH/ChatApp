import { ArrowRight, LoaderCircle } from "lucide-react";

export function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[length:var(--text-sm)] font-medium text-white transition-all duration-200 active:scale-[0.98] ${
        loading
          ? "bg-[var(--primary-dark)] shadow-none"
          : "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-[0_0_24px_rgba(83,74,183,0.4)]"
      }`}
    >
      {loading ? (
        <>
          <LoaderCircle className="spin-anim" size={15} strokeWidth={2} />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={14} strokeWidth={1.8} />
        </>
      )}
    </button>
  );
}