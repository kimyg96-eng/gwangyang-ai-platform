type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({
  message = "AI가 응답을 생성하고 있습니다...",
}: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-5 text-slate-600 shadow-sm">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}