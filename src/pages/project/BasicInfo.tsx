import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { FormField, HelpOptions, InfoBanner, RadioGroup, Select, TextInput, Textarea, UnitInput } from '@/components/ui/form';
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
          <FormField
            label="산정 방식"
            required
            helpWide
            help={
              <HelpOptions
                intro="탄소발자국을 어떻게 계산할지 정합니다. 만든 뒤에는 바꿀 수 없어요."
                items={[
                  {
                    term: 'MRV 기반 (증빙·인증 가능)',
                    desc: '전기 고지서·거래명세서 같은 실제 증빙을 올려 계산합니다. 값이 정확해 인증이나 납품처 제출용으로 쓸 수 있어요. 대신 준비할 서류가 조금 더 많습니다. (MRV = 측정·보고·검증)',
                  },
                  {
                    term: '계산기 (추정·참고용)',
                    desc: '증빙 없이 대략적인 값만 넣어 예상치를 빠르게 봅니다. 우리 커피가 대략 얼마나 나오는지 참고할 때 좋지만, 인증에는 쓸 수 없어요.',
                  },
                ]}
              />
            }
          >
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
            <FormField
              label="방법론"
              required
              helpWide
              help={
                <HelpOptions
                  intro="어떤 국제·국내 기준으로 계산할지 고릅니다. 목적에 맞는 쪽을 고르면 됩니다."
                  items={[
                    {
                      term: 'ISO 14067',
                      desc: '제품 하나의 탄소발자국을 계산하는 국제 표준입니다. 해외 거래처나 글로벌 기준이 필요할 때 주로 씁니다.',
                    },
                    {
                      term: '환경성적표지 중 탄소발자국',
                      desc: '국내 환경부가 운영하는 인증(EPD)의 탄소발자국 기준입니다. 국내 인증·조달이 목적이면 이 쪽을 고르세요. 이 방식은 산정 범위가 ‘폐기까지’로 자동 고정됩니다.',
                    },
                  ]}
                />
              }
            >
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
            helpWide
            help={
              <HelpOptions
                intro="어디까지 계산에 넣을지 정합니다."
                items={[
                  {
                    term: '제품 생산까지 (제조 완료)',
                    desc: '생두 구매부터 로스팅·포장을 마칠 때까지만 계산합니다. 공장 문을 나서기 전까지예요.',
                  },
                  {
                    term: '폐기까지 (유통·사용·폐기 포함)',
                    desc: '위 과정에 더해 납품처로 가는 배송, 소비자가 내려 마시는 사용, 다 쓰고 버리는 폐기까지 전부 포함합니다.',
                  },
                ]}
                outro="환경성적표지 방법론을 고르면 ‘폐기까지’로 고정됩니다."
              />
            }
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
          <FormField label="작성 방식" required helpWide help="처음부터 새로 입력할지, 이미 끝낸 ‘제품 생산까지’ 프로젝트의 입력값을 가져와 이어서 작성할지 정합니다. 이어받으면 생두·포장재처럼 겹치는 값을 다시 넣지 않아도 돼요.">
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
            <FormField label="출고량" required helpWide help="이번에 실제로 내보내는(출고하는) 원두 양입니다. 이어받은 프로젝트의 생산량과 비교해, 재료 투입량이 그 비율만큼 자동으로 조정됩니다. (kg RC = 로스팅된 원두 kg)">
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
            helpWide
            help="결과를 ‘얼마당’ 보여줄지 정하는 값입니다. 계산은 항상 원두 1kg 기준으로 하고, 화면·보고서에는 여기 적은 수량을 곱해 보여줍니다. (예: 1로 두면 1kg당 결과) 만든 뒤에는 바꿀 수 없어요."
          >
            <UnitInput unit="kg" type="number" defaultValue={data.functionalUnit} />
          </FormField>
          <FormField label="기능단위 표시" hint="자동으로 조합됩니다.">
            <TextInput value={`로스팅된 커피 ${data.functionalUnit} kg`} disabled readOnly />
          </FormField>
        </div>
        <FormField label="산정 범위 설명 (선택)" helpWide help="표준 계산과 다른, 우리 회사만의 특이한 공정이 있으면 자유롭게 적어 주세요. 적은 내용은 보고서에 그대로 들어갑니다. 특별한 게 없으면 비워 둬도 됩니다.">
          <Textarea rows={2} placeholder="예: 자사는 재생에너지 자가발전 설비를 운영합니다." />
        </FormField>
      </SectionCard>

      {/* Section 3 — 작성자 정보 (계산기 트랙은 입력받지 않음: 번호 유지 + 안내) */}
      {showAuthor ? (
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
      ) : (
        <section>
          <h3 className="text-xl font-bold text-on-surface">3. 작성자 정보</h3>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            계산기 방식은 참고용 추정 결과만 제공하며 인증서·보고서를 발행하지 않으므로, 작성자·사업장 정보가 필요하지
            않습니다. 이 항목은 건너뛰고 바로 <b className="font-medium text-on-surface">생산 정보</b>로 진행하세요.
          </p>
        </section>
      )}

      {/* Section 4 — 생산 정보 */}
      <SectionCard title="4. 생산 정보" description="로스팅 생산량과 설비·원두 구성을 입력합니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="단위 기간 원두 생산량" required helpWide help="데이터 수집 기간 동안 로스팅한 원두 총량입니다. 이 값으로 원두 1kg당 평균 탄소발자국을 계산하니 되도록 정확히 넣어 주세요. (kg RC = 로스팅된 원두 kg)">
            <UnitInput unit="kg RC" type="number" defaultValue={data.production.roastVolume} placeholder="0" />
          </FormField>
          <FormField
            label="로스터기 연료 유형"
            required
            helpWide
            help={
              <HelpOptions
                intro="로스터기를 돌릴 때 무엇으로 열을 내는지 고릅니다."
                items={[
                  { term: '전기 전용', desc: '전기로만 볶습니다.' },
                  {
                    term: '전기 + 가스',
                    desc: '전기와 함께 가스(도시가스·LPG)로 불을 씁니다. 이걸 고르면 이후 제조 단계에서 가스 사용량과 가스 고지서를 추가로 입력하게 됩니다.',
                  },
                ]}
              />
            }
          >
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
            helpWide
            help={
              <HelpOptions
                intro="소비자가 이 커피를 어떻게 내려 마시는지 고릅니다. 내리는 방식마다 쓰는 전기·물이 달라 사용 단계 배출량이 바뀝니다."
                items={[
                  { term: '드립', desc: '뜨거운 물을 부어 여과지로 내립니다. 고르면 여과지가 자동으로 포함됩니다.' },
                  { term: '에스프레소', desc: '머신으로 고압 추출합니다.' },
                  { term: '콜드브루', desc: '찬물로 오래 우립니다. 추출에 전기를 거의 안 써 사용 단계 전력이 0으로 잡힙니다.' },
                ]}
                outro="만든 뒤에는 바꿀 수 없어요."
              />
            }
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
