import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { WorkflowStep } from '@/data/workflow';

interface StepActionsProps {
  projectId: string;
  currentKey: string;
  steps: WorkflowStep[];
}

/** 하단 액션 바 (이전 / 다음 / 저장, 검토 단계는 검토·확정 추가) */
export function StepActions({ projectId, currentKey, steps }: StepActionsProps) {
  const navigate = useNavigate();
  const index = steps.findIndex((s) => s.key === currentKey);
  const prev = index > 0 ? steps[index - 1] : undefined;
  const next = index >= 0 && index < steps.length - 1 ? steps[index + 1] : undefined;
  const isReview = currentKey === 'review';
  const isResult = currentKey === 'result';

  const go = (key?: string) => key && navigate(`/projects/${projectId}/${key}`);

  return (
    <div className="sticky bottom-0 flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
      <Button variant="secondary" disabled={!prev} onClick={() => go(prev?.key)}>
        <ArrowLeft className="h-4 w-4" /> 이전
      </Button>

      <div className="flex items-center gap-2">
        {!isResult && (
          <Button variant="secondary" onClick={() => alert('저장되었습니다. (목업)')}>
            <Save className="h-4 w-4" /> 저장
          </Button>
        )}
        {isReview && (
          <>
            <Button variant="secondary" onClick={() => alert('검토 항목을 점검합니다. (목업)')}>
              <ClipboardCheck className="h-4 w-4" /> 검토
            </Button>
            <Button onClick={() => alert('확정 시 결과가 잠기고 보고서를 발급할 수 있습니다. (목업)')}>
              <Check className="h-4 w-4" /> 확정
            </Button>
          </>
        )}
        {!isReview && next && (
          <Button onClick={() => go(next.key)}>
            다음 <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
