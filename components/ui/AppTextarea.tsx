type AppTextareaProps = {
  placeholder?: string;
};

export default function AppTextarea({ placeholder }: AppTextareaProps) {
  return (
    <textarea
      className="h-36 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
      placeholder={placeholder}
    />
  );
}