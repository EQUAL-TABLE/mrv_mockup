import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { DocPicker, FormField, InfoBanner, OcrBadge, RadioGroup, ReadonlyField, TextInput, UnitInput } from '@/components/ui/form';

/**
 * ⑦ 제품유통 
 *
 * 로스터리 → 납품처(또는 자체 소비)까지의 유통 수송을 등록한다.
 * 수송 구간 단일·수송수단 트럭 고정. 배출량은 결과 단계에서만 표시.
 * (환경성적표지·ISO 폐기까지 전용 화면. 제품 생산까지·계산기는 이 단계 없음)
 */
export function Distribution() {
  const [mode, setMode] = useState<'delivery' | 'self'>('delivery');
  const isDelivery = mode === 'delivery';

  return (
    <div className="space-y-4">
      <SectionCard title="유통 정보" description="납품 방식과 배송 정보를 입력합니다. 수송수단은 트럭으로 고정됩니다. 입력한 납품처 위치는 폐기 단계에서 포장재·커피박이 어디서 버려지는지 판단하는 기준점이 됩니다.">
        <FormField label="유통 방식" required>
          <RadioGroup
            name="deliveryMode"
            value={mode}
            onChange={(v) => setMode(v as 'delivery' | 'self')}
            options={[
              { value: 'delivery', label: '납품·배송', desc: '납품처로 제품을 배송합니다.' },
              { value: 'self', label: '자체 소비', desc: '자사 매장 등에서 직접 소비합니다. (배송 없음)' },
            ]}
          />
        </FormField>

        {isDelivery ? (
          <>
            <FormField label="납품 거래명세서 (선택)" hint="선택하거나 [업로드]로 새 명세서를 올리면 납품처 정보가 자동으로 채워집니다.">
              <DocPicker placeholder="납품 거래명세서 선택" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="납품처명" required hint={<OcrBadge />}>
                <TextInput placeholder="문서에서 자동 추출" />
              </FormField>
              <FormField label="납품처 주소" required hint={<OcrBadge />}>
                <TextInput placeholder="문서에서 자동 추출" />
              </FormField>
              <FormField label="수송 거리" required hint="로스터리·납품처 주소로 자동 산출됩니다. 안 되면 직접 입력하세요.">
                <UnitInput unit="km" type="number" placeholder="자동 계산" />
              </FormField>
              <ReadonlyField label="수송수단" value="트럭 (고정)" />
            </div>
          </>
        ) : (
          <InfoBanner>자체 소비로 분류되어 제품유통 수송 거리 = 0km, 배출량 = 0으로 산정됩니다.</InfoBanner>
        )}

        <ReadonlyField label="수송량" value="—" unit="kg RC" help="배송한 원두 무게입니다. 단위 기간 원두 생산량이 자동으로 연결됩니다. (kg RC = 로스팅된 원두 kg)" />
        <p className="text-xs text-on-surface-variant">
          유통 배출량은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>

    </div>
  );
}
