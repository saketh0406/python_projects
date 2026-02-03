import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const colors = {
    success: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
    error: { bg: "#FEF2F2", border: "#EF4444", text: "#991B1B" },
    info: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF" },
  };

  const color = colors[type];

  return (
    <div
      className="toast slide-down"
      style={{
        position: "fixed",
        top: "2rem",
        right: "2rem",
        background: color.bg,
        borderLeft: `4px solid ${color.border}`,
        padding: "1rem 1.5rem",
        borderRadius: "10px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        zIndex: 10000,
        minWidth: "300px",
        maxWidth: "500px",
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          background: color.border,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1.2rem",
        }}
      >
        {icons[type]}
      </div>
      <span style={{ flex: 1, color: color.text, fontWeight: "500" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: color.text,
          cursor: "pointer",
          fontSize: "1.2rem",
          padding: "0.25rem",
          opacity: 0.6,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;