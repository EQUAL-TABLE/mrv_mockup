import { FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyHomeProps {
  onStart?: () => void;
}

/** 프로젝트가 하나도 없는 첫 사용자 상태 (신뢰도 톤) */
export function EmptyHome({ onStart }: EmptyHomeProps) {
  const steps = [
    { no: 1, title: '방식 선택', desc: 'MRV 기반 산정(정확·인증) 또는 계산기(간편·참고) 중 선택합니다.' },
    { no: 2, title: '정보 입력', desc: '생두·에너지·포장 등 단계별 정보를 안내에 따라 입력합니다.' },
    { no: 3, title: '결과 확인', desc: '탄소발자국 결과와 (MRV 기반 시) 인증용 보고서를 받습니다.' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
        <h2 className="text-lg font-bold text-on-surface">커피 전과정 탄소발자국 산정을 시작하세요</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
          생두 재배부터 로스팅·유통·폐기까지 커피 전 과정의 온실가스를 표준에 맞춰 계산합니다.
          아래 3단계로 진행됩니다.
        </p>

        <ol className="mt-6 divide-y divide-outline-variant border-y border-outline-variant">
          {steps.map((s) => (
            <li key={s.no} className="flex items-start gap-3 py-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {s.no}
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{s.title}</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center gap-2 rounded-md border border-dashed border-outline-variant bg-surface-container-low/40 p-5">
          <FolderPlus className="h-5 w-5 text-on-surface-variant" />
          <span className="flex-1 text-sm text-on-surface-variant">아직 등록된 산정 프로젝트가 없습니다.</span>
          <Button onClick={onStart}>
            <Plus className="h-4 w-4" /> 탄소발자국 산정
          </Button>
        </div>
      </section>
    </div>
  );
}
