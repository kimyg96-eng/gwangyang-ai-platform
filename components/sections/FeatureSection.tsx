import FeatureCard from "@/components/cards/FeatureCard";

const features = [
  ["AI 문화해설사", "광양 지역문화자산에 대해 질문하고 답변을 받습니다."],
  ["AI 정채봉 아바타", "정채봉 작가의 생애와 작품세계를 대화형으로 학습합니다."],
  ["AI 스토리 생성", "매화마을, 섬진강, 백운산을 소재로 이야기를 만듭니다."],
  ["AI 이미지 생성", "상상한 지역문화 장면을 이미지로 표현합니다."],
];

export default function FeatureSection() {
  return (
    <section className="mt-10 grid gap-6 md:grid-cols-4">
      {features.map(([title, desc]) => (
        <FeatureCard key={title} title={title} description={desc} />
      ))}
    </section>
  );
}