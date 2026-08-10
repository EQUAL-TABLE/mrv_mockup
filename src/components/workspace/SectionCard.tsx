import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** 단계 화면 내 섹션 카드 */
export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      {description && <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
