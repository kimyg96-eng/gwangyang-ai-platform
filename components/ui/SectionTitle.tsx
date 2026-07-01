type SectionTitleProps = {
  label?: string;
  title: string;
  description?: string;
};

export default function SectionTitle({
  label,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div>
      {label && (
        <p className="text-sm font-semibold text-emerald-600">{label}</p>
      )}
      <h1 className="mt-3 text-4xl font-bold">{title}</h1>
      {description && (
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}