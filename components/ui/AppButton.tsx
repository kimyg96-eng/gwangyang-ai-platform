type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function AppButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: AppButtonProps) {
  const baseClass = "rounded-xl px-6 py-3 font-semibold transition";

  const variantClass =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <button {...props} className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </button>
  );
}