interface BadgeProps {
  status: "recebido" | "confirmado";
}

const config = {
  recebido: {
    label: "Recebido",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  confirmado: {
    label: "Confirmado",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

export function StatusBadge({ status }: BadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "confirmado" ? "bg-green-500" : "bg-amber-500"}`}
      />
      {label}
    </span>
  );
}
