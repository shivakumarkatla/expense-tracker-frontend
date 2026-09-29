import { CheckCircle2, XCircle, X } from "lucide-react";

function Toast({ type = "success", message, onClose }) {
  const isError = type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-red-50" : "bg-emerald-50"
        }`}
      >
        {isError ? (
          <XCircle
            size={18}
            className="text-red-600"
          />
        ) : (
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />
        )}
      </div>

      <p className="flex-1 pt-1 text-sm font-medium text-zinc-800">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;