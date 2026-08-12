import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { FormField, InfoBanner, RadioGroup, Select, TextInput, Textarea, UnitInput } from '@/components/ui/form';
import { DEFAULT_PROJECT_DATA } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';

type Track = 'mrv' | 'calculator';
type Methodology = 'iso' | 'epd';
type Boundary = 'gate' | 'grave';

interface BasicInfoProps {
  initialTrack?: Track;
  initialMethodology?: Methodology;
  initialBoundary?: Boundary;
  /** 프로젝트명 (신규는 빈 값) */
  name?: string;
  data?: ProjectData;
}

/** ① 프로젝트 기본정보 (Section 1~4, 조건부 렌더링) */
export function BasicInfo({
  initialTrack = 'mrv',
  initialMethodology = 'iso',
  initialBoundary = 'grave',
  name = '',
  data = DEFAULT_PROJECT_DATA,
}: BasicInfoProps = {}) {
  const [track, setTrack] = useState<Track>(initialTrack);
  const [methodology, setMethodology] = useState<Methodology>(initialMethodology);
  const [boundary, setBoundary] = useState<Boundary>(initialBoundary);
  const [writeMode, setWriteMode] = useState<'A' | 'B'>('A');
  const [fuel, setFuel] = useState(data.production.fuel);
  const [blending, setBlending] = useState<'y' | 'n'>(data.production.blending === 'blend' ? 'y' : 'n');
  const [scenario, setScenario] = useState(data.production.scenario);

  // 조건부 렌더링 규칙
  const showWriteMode = track === 'mrv' && boundary === 'grave';
  const showLinkedProject = showWriteMode && writeMode === 'B';
  const showAuthor = track === 'mrv';
  const showScenario = methodology === 'iso' && boundary === 'grave';

  // 방법론 = 환경성적표지 → 경계 폐기까지 고정 / 계산기 → 방법론 없음
  const onMethodology = (v: string) => {
    const m = v as Methodology;
    setMethodology(m);
    if (m === 'epd') setBoundary('grave');
  };
  const onTrack = (v: string) => {
    const t = v as Track;
    setTrack(t);
    if (t === 'calculator') setMethodology('iso');
  };

  return (
    <div className="space-y-4">
      {/* Section 1 — 산정 설정 */}
      <SectionCard
        title="1. 산정 설정"
        description="산정 방식·방법론·범위를 정합니다. 이 선택이 이후 단계 구성과 계산 방식을 결정하며, 생성 후에는 변경할 수 없습니다."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="산정 방식" required help="고지서 등 증빙 기반(MRV)인지, 값을 직접 넣는 추정(계산기)인지 선택합니다.">
            <Select
              value={track}
              onChange={(e) => onTrack(e.target.value)}
              options={[
                { value: 'mrv', label: 'MRV 기반 (증빙·인증 가능)' },
                { value: 'calculator', label: '계산기 (추정·참고용)' },
              ]}
            />
          </FormField>

          {track !== 'calculator' && (
            <FormField label="방법론" required help="ISO 14067 또는 환경성적표지 중 탄소발자국 기준을 선택합니다.">
              <Select
                value={methodology}
                onChange={(e) => onMethodology(e.target.value)}
                options={[
                  { value: 'iso', label: 'ISO 14067' },
                  { value: 'epd', label: '환경성적표지 중 탄소발자국' },
                ]}
              />
            </FormField>
          )}

          <FormField
            label="산정 범위"
            required
            help="'제품 생산까지'는 제조 완료 시점까지, '폐기까지'는 유통·사용·폐기를 포함합니다. 환경성적표지는 폐기까지로 고정됩니다."
          >
            <Select
              value={boundary}
              disabled={methodology === 'epd'}
              onChange={(e) => setBoundary(e.target.value as Boundary)}
              options={[
                { value: 'gate', label: '제품 생산까지 (제조 완료)' },
                { value: 'grave', label: '폐기까지 (유통·사용·폐기 포함)' },
              ]}
            />
          </FormField>
        </div>

        {showWriteMode && (
          <FormField label="작성 방식" required help="새로 작성하거나, 이미 확정된 '제품 생산까지' 프로젝트의 투입물을 이어받아 작성할 수 있습니다.">
            <RadioGroup
              name="writeMode"
              value={writeMode}
              onChange={(v) => setWriteMode(v as 'A' | 'B')}
              options={[
                { value: 'A', label: '신규 작성', desc: '처음부터 새로 입력합니다.' },
                { value: 'B', label: '제품 생산까지 프로젝트 연동', desc: '확정된 제품 생산까지 산정을 이어받습니다.' },
              ]}
            />
          </FormField>
        )}

        {showLinkedProject && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="연동 프로젝트" required hint="확정 완료된 ISO 14067 · 제품 생산까지 프로젝트만 표시됩니다.">
              <Select
                options={[
                  { value: '', label: '프로젝트 선택' },
                  { value: 'p3', label: '디카페인 하우스블렌드 2026 (제품 생산까지·확정)' },
                ]}
              />
            </FormField>
            <FormField label="출고량" required help="이 산정의 실제 출고량입니다. 연동 프로젝트 대비 비율로 투입물이 자동 조정됩니다.">
              <UnitInput unit="kg RC" type="number" placeholder="0" />
            </FormField>
          </div>
        )}
      </SectionCard>

      {/* Section 2 — 프로젝트 정보 */}
      <SectionCard title="2. 프로젝트 정보" description="제품명과 산정 대상 기간, 결과 표시 기준을 입력합니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="프로젝트명" required hint="제품명과 동일하게 입력하세요.">
            <TextInput defaultValue={name} placeholder="예: 에티오피아 예가체프 싱글오리진 2026" />
          </FormField>
          <FormField label="기준연도" required>
            <UnitInput unit="년" type="number" defaultValue={data.baseYear} />
          </FormField>
          <FormField label="데이터 수집 시작" required>
            <TextInput type="month" defaultValue={data.collectFrom} />
          </FormField>
          <FormField label="데이터 수집 종료" required hint="수집 기간이 12개월 미만이면 경고가 표시됩니다(진행은 가능).">
            <TextInput type="month" defaultValue={data.collectTo} />
          </FormField>
          <FormField
            label="기능단위 (기준 수량)"
            required
            help="결과를 표시할 기준 수량입니다. 내부 계산은 1kg 기준이며, 표시할 때 이 수량을 곱합니다. 생성 후 변경 불가."
          >
            <UnitInput unit="kg" type="number" defaultValue={data.functionalUnit} />
          </FormField>
          <FormField label="기능단위 표시" hint="자동으로 조합됩니다.">
            <TextInput value={`로스팅된 커피 ${data.functionalUnit} kg`} disabled readOnly />
          </FormField>
        </div>
        <FormField label="산정 범위 설명 (선택)" help="일반적인 범위와 다른 자사 공정의 특이사항을 자유롭게 적으면 보고서에 반영됩니다.">
          <Textarea rows={2} placeholder="예: 자사는 재생에너지 자가발전 설비를 운영합니다." />
        </FormField>
      </SectionCard>

      {/* Section 3 — 작성자 정보 (계산기 트랙은 없음) */}
      {showAuthor && (
        <SectionCard title="3. 작성자 정보" description="사업장 정보는 회원 정보에서 자동으로 불러오며 수정할 수 없습니다.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="사업장명">
              <TextInput value={data.business.name} disabled readOnly />
            </FormField>
            <FormField label="사업자등록번호">
              <TextInput value={data.business.bizNo} disabled readOnly />
            </FormField>
            <FormField label="사업장 주소" className="sm:col-span-2">
              <TextInput value={data.business.address} disabled readOnly />
            </FormField>
            <FormField label="담당자명" required>
              <TextInput defaultValue={data.contact.manager} />
            </FormField>
            <FormField label="연락처" required>
              <TextInput defaultValue={data.contact.phone} />
            </FormField>
            <FormField label="이메일" required className="sm:col-span-2">
              <TextInput type="email" defaultValue={data.contact.email} />
            </FormField>
          </div>
        </SectionCard>
      )}

      {/* Section 4 — 생산 정보 */}
      <SectionCard title="4. 생산 정보" description="로스팅 생산량과 설비·원두 구성을 입력합니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="단위 기간 원두 생산량" required help="수집 기간 동안 로스팅한 총 원두량입니다. 평균 탄소발자국 계산의 기준이 됩니다.">
            <UnitInput unit="kg RC" type="number" defaultValue={data.production.roastVolume} placeholder="0" />
          </FormField>
          <FormField label="로스터기 연료 유형" required help="가스를 함께 쓰면 이후 제조 단계에서 가스 사용량 입력과 가스 고지서가 필요합니다.">
            <Select
              value={fuel}
              onChange={(e) => setFuel(e.target.value as 'elec' | 'elec_gas')}
              options={[
                { value: 'elec', label: '전기 전용' },
                { value: 'elec_gas', label: '전기 + 가스' },
              ]}
            />
          </FormField>
        </div>

        {track === 'calculator' ? (
          <InfoBanner>계산기 방식은 단일 원두 기준으로 계산합니다. (블렌딩 비율 입력 없음)</InfoBanner>
        ) : (
          <FormField label="블렌딩 여부" required>
            <RadioGroup
              name="blending"
              value={blending}
              onChange={(v) => setBlending(v as 'y' | 'n')}
              options={[
                { value: 'n', label: '단일 원두', desc: '한 종류의 생두만 사용합니다.' },
                { value: 'y', label: '블렌딩', desc: '여러 생두를 섞습니다. 비율을 입력합니다.' },
              ]}
            />
          </FormField>
        )}

        {track === 'mrv' && blending === 'y' && (
          <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-on-surface">생두별 블렌딩 비율</p>
              <span className="text-xs text-on-surface-variant">합계 100% (현재 100%)</span>
            </div>
            <div className="space-y-2">
              {data.farms.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <TextInput className="flex-1" defaultValue={row.bean} placeholder={`생두 ${idx + 1}`} />
                  <div className="w-32">
                    <UnitInput unit="%" type="number" defaultValue={row.ratio} />
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high"
                    aria-label="행 삭제"
                    onClick={() => alert('행 삭제 (목업)')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => alert('생두 행 추가 (목업)')}
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> 생두 추가
            </button>
          </div>
        )}

        {showScenario && (
          <FormField
            label="사용 방식 시나리오"
            required
            help="소비자가 커피를 내리는 방식에 따라 사용 단계 배출량이 달라집니다. 드립을 고르면 여과지가 자동 포함됩니다. 생성 후 변경 불가."
          >
            <Select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as 'drip' | 'espresso' | 'coldbrew')}
              options={[
                { value: 'drip', label: '드립' },
                { value: 'espresso', label: '에스프레소' },
                { value: 'coldbrew', label: '콜드브루' },
              ]}
            />
          </FormField>
        )}
      </SectionCard>
    </div>
  );
}
