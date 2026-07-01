type AppInputProps = {
  placeholder?: string;
};

export default function AppInput({ placeholder }: AppInputProps) {
  return (
    <input
      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
      placeholder={placeholder}
    />
  );
}