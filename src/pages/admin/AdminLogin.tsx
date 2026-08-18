import { AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField, TextInput } from '@/components/ui/form';

/** ADM-AUTH-001 관리자 로그인 — 일반 사용자 로그인과 완전 분리된 별도 인증 경로 */
export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@equaltable.io');
  const [rejected, setRejected] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // 목업: 일반계정(@equaltable.io 도메인이 아닌 경우) 접근 거부 시연
    if (!email.endsWith('@equaltable.io')) {
      setRejected(true);
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111827] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <p className="mt-4 font-headline text-2xl tracking-wide text-white">COFFEE MRV</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-fixed">Admin Console · EQUAL TABLE</p>
          <p className="mt-2 text-sm text-slate-400">관리자 전용 인증 경로입니다.</p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="space-y-4 [&_label]:text-slate-200 [&_span]:text-slate-200">
            <FormField label="관리자 이메일" required>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setRejected(false);
                }}
                className="border-white/15 bg-white/5 text-white placeholder:text-slate-500"
                placeholder="admin@equaltable.io"
              />
            </FormField>
            <FormField label="비밀번호" required>
              <TextInput
                type="password"
                defaultValue="********"
                className="border-white/15 bg-white/5 text-white placeholder:text-slate-500"
              />
            </FormField>
          </div>

          {rejected && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-error/40 bg-error/10 p-3 text-xs leading-relaxed text-error-container">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>일반 사용자 계정으로는 관리자 사이트에 접근할 수 없습니다. (접근 시도가 기록되었습니다)</span>
            </div>
          )}

          <Button type="submit" className="mt-5 w-full">
            <Lock className="h-4 w-4" /> 로그인
          </Button>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
            2단계 인증 미적용 · 로그인 성공·실패 이력(일시·IP)이 기록됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}
