import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { FormField, HelpOptions, InfoBanner, RadioGroup, Select, SourceBadge, TextInput, Textarea, UnitInput } from '@/components/ui/form';
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
  // 계산기 트랙은 참고용 추정 결과만 제공하므로 데이터 출처 등급을 표시하지 않는다.
  const isMrv = track === 'mrv';

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
                intro="탄소발자국을 어떻게 계산할지 정합니다. 생성 후 수정이 불가합니다."
                items={[
                  {
                    term: 'MRV 기반 탄소배출량 산정 (증빙·인증 가능)',
                    desc: '전기 고지서·거래명세서와 같은 실제 증빙을 올려 데이터를 추출하고 탄소발자국을 계산합니다. 값이 정확해 인증이나 납품처 제출용으로 활용 가능합니다. 대신 준비할 서류가 조금 더 많습니다. (MRV = 측정·보고·검증. 단, 제출 등을 위한 외부 검증은 별도 절차 필요)',
                  },
                  {
                    term: '탄소배출량 추정치 계산기 (추정·참고용)',
                    desc: '증빙 없이 대략적인 값만 넣어 탄소배출량 예상치를 빠르게 확인할 수 있습니다. 우리 커피에서 대략 적인 탄소배출량을 참고할 수 있지만, 인증에는 활용할 수 없습니다.',
                  },
                ]}
              />
            }
          >
            <Select
              value={track}
              onChange={(e) => onTrack(e.target.value)}
              options={[
                { value: 'mrv', label: 'MRV 기반 탄소배출량 산정 (증빙·인증 가능)' },
                { value: 'calculator', label: '탄소배출량 추정치 계산기 (추정·참고용)' },
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
                intro="탄소발자국을 산정한 범위를 선택합니다."
                items={[
                  {
                    term: '제품 생산까지 (제조)',
                    desc: '생두 생산부터 운송·로스팅·포장을 통해 제품이 생산되는 공정까지 발생하는 탄소배출량을 산정합니다. 제품 생산 후 유통·사용·폐기 과정에서 발생하는 탄소배출량은 포함하지 않습니다.(단, 제조공정에서 발생한 폐기물에 대한 탄소배출량은 포함합니다.)',
                  },
                  {
                    term: '폐기까지 (유통·사용·폐기 포함)',
                    desc: '생두 생산부터 제품 제조·유통·사용·폐기에 이르는 전 과정에서 발생하는 탄소배출량을 산정합니다.',
                  },
                ]}
                outro="환경성적표지 방법론의 경우 ‘폐기까지’가 자동으로 선택되지만, 환경성적표지 방법론에 의거하여 사용 및 폐기물 운송 단계는 생략됩니다."
              />
            }
          >
            <Select
              value={boundary}
              disabled={methodology === 'epd'}
              onChange={(e) => setBoundary(e.target.value as Boundary)}
              options={[
                { value: 'gate', label: '제품 생산까지 (제조)' },
                { value: 'grave', label: '폐기까지 (유통·사용·폐기 포함)' },
              ]}
            />
          </FormField>
        </div>

        {showWriteMode && (
          <FormField label="작성 방식" 
          required 
          helpWide 
          help="처음부터 새로 입력할지, 이미 작성한 ‘제품 생산까지’ 프로젝트의 입력값을 가져와 후단 데이터를 연결하여 작성할지 정합니다. 프로젝트 연동의 경우 생두·포장재 등 겹치는 데이터는 다시 입력할 필요가 없습니다.">
            <RadioGroup
              name="writeMode"
              value={writeMode}
              onChange={(v) => setWriteMode(v as 'A' | 'B')}
              options={[
                { value: 'A', label: '신규 작성', desc: '처음부터 모든 데이터를 새로 입력합니다.' },
                { value: 'B', label: '프로젝트 연동', desc: '기존 작성·확정한 "제품 생산까지" 프로젝트에 이후 단계 데이터를 이어서 작성할 수 있습니다.' },
              ]}
            />
          </FormField>
        )}

        {showLinkedProject && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="연동 프로젝트" required hint="확정 완료된 ISO 14067·'제품 생산'까지 프로젝트만 표시됩니다.">
              <Select
                options={[
                  { value: '', label: '프로젝트 선택' },
                  { value: 'p3', label: '디카페인 하우스블렌드 2026 (제품 생산까지·확정)' },
                ]}
              />
            </FormField>
            <FormField label="출고량" required helpWide source={isMrv ? 'measured' : undefined} help="이 프로젝트에서 출고되는 원두 양을 의미합니다. 이어받은 프로젝트의 생산량과 비교해, 출고량 기반으로 원부자재 투입량이 자동 결정됩니다. (kg RC = 로스팅된 원두 kg)">
              <UnitInput unit="kg RC" type="number" placeholder="0" />
            </FormField>
          </div>
        )}
      </SectionCard>

      {/* Section 2 — 프로젝트 정보 */}
      <SectionCard
        title="2. 프로젝트 정보"
        description={
          isMrv
            ? '프로젝트 명과 산정 대상 기간, 결과 표시 기준을 입력합니다.'
            : '프로젝트 명과 기준연도를 입력합니다. 계산기 방식은 원두 1kg 기준으로 추정 결과를 제공합니다.'
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="프로젝트명" required >
            <TextInput defaultValue={name} placeholder="예: 에티오피아 예가체프 싱글오리진 2026" />
          </FormField>
          <FormField label="기준연도" required>
            <UnitInput unit="년" type="number" defaultValue={data.baseYear} />
          </FormField>
          {isMrv && (
            <>
              <FormField label="데이터 수집 시작" required>
                <TextInput type="month" defaultValue={data.collectFrom} />
              </FormField>
              <FormField label="데이터 수집 종료" required hint="데이터 수집기간은 연단위를 권장합니다. 따라서 수집 기간이 12개월 미만이면 경고가 표시될 수 있습니다.">
                <TextInput type="month" defaultValue={data.collectTo} />
              </FormField>
              <FormField
                label="기준 수량(기능단위)"
                required
                helpWide
                help="결과를 ‘얼마당’ 보여줄지 정하는 값입니다. 계산은 항상 원두 1kg 기준으로 하되, 화면·보고서에는 기준 수량을 기반으로 제공합니다."
              >
                <UnitInput unit="kg" type="number" defaultValue={data.functionalUnit} />
              </FormField>
              <FormField label="기능단위 표시" hint="자동으로 조합됩니다.">
                <TextInput value={`로스팅된 커피 ${data.functionalUnit} kg`} disabled readOnly />
              </FormField>
            </>
          )}
        </div>
        {isMrv && (
          <FormField label="산정 범위 설명 (선택)" helpWide help="표준 계산 방식·공정과 다른, 이 프로젝트 만의 특이한 공정을 작성할 수 있습니다. 작성 내용은 결과 보고서에 반영됩니다.">
            <Textarea rows={2} placeholder="예: 자사는 재생에너지 자가발전 설비를 운영합니다." />
          </FormField>
        )}
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
            계산기 방식은 참고용 추정 결과만 제공하며 인증서·보고서를 발행하지 않으므로, 작성자·사업장 정보가 필요하지 않습니다.
          </p>
        </section>
      )}

      {/* Section 4 — 생산 정보 */}
      <SectionCard title="4. 생산 정보" 
      description="이 프로젝트에 해당하는 원두 생산량과 로스팅 설비·생두 구성을 입력하세요.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="단위 기간 원두 생산량"
          required
          helpWide
          source={isMrv ? 'measured' : undefined}
          help="데이터 수집 기간 동안 로스팅한 원두 총량입니다. 이 값으로 원두 1kg당 평균 탄소발자국을 계산하니 정확히 넣어 주세요. (kg RC = 로스팅된 원두 kg)
          생두 사용량은 원두 생산량의 로스팅 수율 76.12%를 일괄 적용하여 자동 계산됩니다.">
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
                  { term: '전기 로스터기', desc: '전기로만 원두를 로스팅하는 경우' },
                  {
                    term: '전기+가스 복합 로스터기',
                    desc: '전기와 함께 가스(도시가스·LPG)를 사용하여 로스팅하는 경우',
                  },
                ]}
              />
            }
          >
            <Select
              value={fuel}
              onChange={(e) => setFuel(e.target.value as 'elec' | 'elec_gas')}
              options={[
                { value: 'elec', label: '전기 로스터기' },
                { value: 'elec_gas', label: '전기+가스 복합 로스터기' },
              ]}
            />
          </FormField>
        </div>

        {track === 'calculator' ? (
          <InfoBanner>계산기 방식은 단일 원두 기준으로 탄소발자국을 산정합니다.</InfoBanner>
        ) : (
          <FormField label="블렌딩 여부" required>
            <RadioGroup
              name="blending"
              value={blending}
              onChange={(v) => setBlending(v as 'y' | 'n')}
              options={[
                { value: 'n', label: '단일 원두', desc: '한 종류의 생두만 사용' },
                { value: 'y', label: '블렌딩', desc: '여러 생두를 함께 사용할 경우' },
              ]}
            />
          </FormField>
        )}

        {track === 'mrv' && blending === 'y' && (
          <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-on-surface">생두별 블렌딩 비율</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">합계 100% (현재 100%)</span>
                <SourceBadge source="measured" />
              </div>
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
                intro="커피 추출 방식을에 따라 사용 단계 배출량이 결정됩니다. 한 프로젝트에는 한 가지 사용 방식만 적용할 수 있습니다."
                items={[
                  { term: '드립', desc: '선택시 원부자재에 "여과지"가 자동으로 포함됩니다. 물 가열에 다른 에너지 소모가 발생합니다.' },
                  { term: '에스프레소', desc: '에스프레소 머신으로 고압 추출하며, 머신 사용에 따른 에너지 소모가 발생합니다.' },
                  { term: '콜드브루', desc: '장시간 미온수를 활용하여 커피를 추출하므로, 추출시 별도의 에너지를 사용하지 않습니다.' },
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
