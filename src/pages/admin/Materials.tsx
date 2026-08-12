import { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { PageHeader, Tabs } from '@/components/admin/ui';
import { InfoBanner } from '@/components/ui/form';
import { InputMaterialsTab } from '@/pages/admin/materials/InputMaterialsTab';
import { OccurrenceTab } from '@/pages/admin/materials/OccurrenceTab';
import { WasteCategoriesTab } from '@/pages/admin/materials/WasteCategoriesTab';
import { WasteItemsTab } from '@/pages/admin/materials/WasteItemsTab';

const TABS = [
  { key: 'inputs', label: '① 투입물 목록' },
  { key: 'wastes', label: '② 산출물·폐기물 목록' },
  { key: 'categories', label: '③ 폐기물 성상' },
  { key: 'mapping', label: '④ 발생 매핑' },
];

/** 물질·매핑 데이터 — 투입물 → 발생 폐기물 → 성상 → 통계·EF 파이프라인의 목록·매핑 계층 */
export function Materials() {
  const [tab, setTab] = useState('inputs');

  return (
    <AdminShell>
      <PageHeader
        title="물질·매핑 데이터 관리"
        description="투입물과 산출물·폐기물을 각각 목록으로 관리하고, 발생 관계와 폐기물 성상을 매핑합니다. 처리 통계·EF는 이 매핑을 기준으로 자동 연결됩니다."
      />

      <InfoBanner>
        파이프라인: <b className="font-semibold text-on-surface">투입물 목록</b> ─(발생계수)→{' '}
        <b className="font-semibold text-on-surface">폐기물 목록</b> ─(성상 매핑)→{' '}
        <b className="font-semibold text-on-surface">폐기물 성상</b> → 처리 비율(연도별 통계) × 처리 EF. 성상·품목은 select로만
        연결해 오타·오분류를 방지합니다.
      </InfoBanner>

      <div className="mt-4">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-5">
        {tab === 'inputs' && <InputMaterialsTab />}
        {tab === 'wastes' && <WasteItemsTab />}
        {tab === 'categories' && <WasteCategoriesTab />}
        {tab === 'mapping' && <OccurrenceTab />}
      </div>
    </AdminShell>
  );
}
