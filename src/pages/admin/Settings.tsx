import { Save } from 'lucide-react';
import { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, PageHeader } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, InfoBanner, Select, TextInput } from '@/components/ui/form';

/** 시스템 설정 — 비밀번호 규칙·세션 만료시간 (Feature flag·API 키 관리는 범위 제외) */
export function Settings() {
  const [toast, setToast] = useState(false);

  const save = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 2500);
  };

  return (
    <AdminShell>
      <PageHeader
        title="시스템 설정"
        description="비밀번호 규칙과 세션 만료시간을 설정합니다. 설정 변경은 감사 로그에 기록됩니다."
      />

      <InfoBanner>
        Feature flag 및 외부 연동 API 키 관리는 본 화면의 범위에서 제외됩니다.
      </InfoBanner>

      <div className="mt-4 space-y-5">
        <Card>
          <CardTitle title="비밀번호 규칙" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <FormField label="최소 길이">
              <TextInput type="number" defaultValue={10} />
            </FormField>
            <FormField label="복잡도">
              <Select
                defaultValue="mix"
                options={[
                  { value: 'basic', label: '영문 + 숫자' },
                  { value: 'mix', label: '영문 + 숫자 + 특수문자' },
                  { value: 'strong', label: '대소문자 + 숫자 + 특수문자' },
                ]}
              />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardTitle title="세션" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <FormField label="세션 만료시간" hint="미조작 상태 지속 시 자동 로그아웃">
              <Select
                defaultValue="60"
                options={[
                  { value: '30', label: '30분' },
                  { value: '60', label: '60분' },
                  { value: '120', label: '120분' },
                ]}
              />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button size="sm" onClick={save}>
            <Save className="h-4 w-4" /> 설정 저장
          </Button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-on-surface px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          설정을 저장했습니다. (감사 로그 기록됨)
        </div>
      )}
    </AdminShell>
  );
}
