import Header from "./Header";
import Footer from "./Footer";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-10">{children}</section>
      <Footer />
    </main>
  );
}