import AssetCard from "@/components/cards/AssetCard";

const assets = [
  ["매화마을", "광양의 봄과 매화문화를 대표하는 지역문화자산"],
  ["섬진강", "자연·생태·생활문화가 함께 흐르는 광양의 대표 강"],
  ["백운산", "생태적 가치와 자연문화가 살아있는 광양의 명산"],
  ["정채봉 문학", "나눔, 배려, 자연사랑의 가치를 담은 문학 콘텐츠"],
];

export default function AssetSection() {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">광양 지역문화자산</h2>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {assets.map(([title, desc]) => (
          <AssetCard key={title} title={title} description={desc} />
        ))}
      </div>
    </section>
  );
}