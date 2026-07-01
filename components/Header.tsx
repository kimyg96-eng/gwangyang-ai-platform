import Link from "next/link";
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-bold text-slate-900">
            광양 AI 문화학습 플랫폼
          </p>
          <p className="text-xs text-slate-500">
            Generative AI Cultural Learning Platform
          </p>
        </div>

        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/guide">AI 문화해설사</Link>
            <Link href="/avatar">정채봉 아바타</Link>
            <Link href="/map">문화지도</Link>
            <Link href="/story">스토리 생성</Link>
            <Link href="/image">이미지 생성</Link>
        </nav>
      </div>
    </header>
  );
}