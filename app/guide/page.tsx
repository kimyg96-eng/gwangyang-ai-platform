import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";

const assets = ["매화마을", "섬진강", "백운산", "광양읍성", "정채봉 문학"];

export default function GuidePage() {
  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">지역문화자산</h2>
          <div className="mt-6 space-y-3">
            {assets.map((asset) => (
              <button
                key={asset}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-medium hover:bg-emerald-50"
              >
                {asset}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <SectionTitle
            label="AI Cultural Guide"
            title="AI 문화해설사"
            description="광양 지역문화자산에 대해 자유롭게 질문하면 AI 문화해설사가 역사·문화·생태적 의미를 설명합니다."
          />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>
              <p className="mt-3 leading-7 text-slate-700">
                안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다.
                매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="max-w-xl rounded-2xl bg-emerald-600 p-5 text-white">
                섬진강은 왜 광양의 대표적인 문화자산인가요?
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>
              <p className="mt-3 leading-7 text-slate-700">
                섬진강은 광양의 자연환경과 생활문화가 함께 형성된 중요한
                지역문화자산입니다.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <AppInput placeholder="궁금한 내용을 입력하세요." />
              <AppButton>전송</AppButton>
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}