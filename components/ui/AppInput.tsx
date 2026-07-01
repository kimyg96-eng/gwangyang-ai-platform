type AppInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function AppInput(props: AppInputProps) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
    />
  );
}