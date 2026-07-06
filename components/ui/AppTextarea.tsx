type AppTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function AppTextarea(props: AppTextareaProps) {
  return (
    <textarea
      {...props}
      className="h-36 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
    />
  );
}