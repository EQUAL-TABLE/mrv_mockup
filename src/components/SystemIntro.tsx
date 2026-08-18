import { ArrowRight, Calculator, FileCheck2, Plus } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SystemIntroProps {
  onStart?: () => void;
}

/** 홈 상단 시스템 설명 (신뢰도 톤: 차분한 정보 패널 + 두 방식 안내) */
export function SystemIntro({ onStart }: SystemIntroProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold text-on-surface">커피 전과정 탄소발자국 산정 시스템</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            생두 재배부터 로스팅·유통·폐기까지 전 과정에서 발생하는 온실가스를 표준(ISO 14067·환경성적표지)에 맞춰 산정하고, 검토·확정 절차를 거쳐 탄소 회계 산정 결과를 담은 결과확인서를 제공합니다.시작 전 아래 두 가지 방식을 확인하세요.
          </p>
        </div>
        <Button className="shrink-0" onClick={onStart}>
          <Plus className="h-4 w-4" /> 탄소발자국 산정
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <TrackInfoCard
          Icon={FileCheck2}
          title="MRV 기반 탄소배출량 산정"
          tag="탄소 회계 기반 산정"
          tagVariant="primary"
          description="전기 고지서·거래명세서 등 실제 증빙 문서를 올리면 자동으로 읽어 계산합니다. 탄소 회계 산정 결과를 담은 결과확인서·보고서를 제공합니다."
          learnMoreHref="/guide?track=mrv"
        />
        <TrackInfoCard
          Icon={Calculator}
          title="탄소배출량 추정치 계산기"
          tag="참고용"
          tagVariant="warning"
          description="증빙 문서 없이 값을 직접 입력해 대략적인 탄소량을 빠르게 확인합니다. 간편하지만 인증·문서 발급은 되지 않는 참고용입니다."
          learnMoreHref="/guide?track=calculator"
        />
      </div>
    </section>
  );
}

interface TrackInfoCardProps {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  tag: string;
  tagVariant: 'primary' | 'warning';
  description: string;
  learnMoreHref: string;
}

function TrackInfoCard({ Icon, title, tag, tagVariant, description, learnMoreHref }: TrackInfoCardProps) {
  return (
    <div className="flex flex-col rounded-md border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={tagVariant === 'primary' ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-warning'} />
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
        <Badge variant={tagVariant}>{tag}</Badge>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>
      <Link
        to={learnMoreHref}
        className="group mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary underline underline-offset-4 hover:gap-2"
      >
        자세히 알아보기
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
