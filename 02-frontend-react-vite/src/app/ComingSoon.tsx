interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-white text-center">
      <h2 className="font-sora text-lg font-extrabold text-neutral-900">{title}</h2>
      <p className="text-sm font-manrope text-neutral-500">
        Tính năng đang được xây dựng, sẽ sớm ra mắt.
      </p>
    </div>
  );
}
