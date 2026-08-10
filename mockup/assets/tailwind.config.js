/*
 * 공유 Tailwind 설정 (Play CDN용)
 * 기존 프론트 repo(mrv-frontend)의 src/index.css @theme 토큰을 그대로 옮김.
 * 모든 목업 페이지가 이 파일을 공유하여 색/폰트 일관성을 유지한다.
 * 사용법: <script src="https://cdn.tailwindcss.com"></script> 다음에 이 파일을 include.
 */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        headline: ['BebasKai', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#366247',
          container: '#2A4D38',
          fixed: '#B1F0CE',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          'container-low': '#F1F3F5',
          'container-lowest': '#ffffff',
          'container-high': '#E9ECEF',
          'container-highest': '#E0E3E5',
        },
        'on-surface': {
          DEFAULT: '#0F171B',
          variant: '#374151',
        },
        'outline-variant': '#C1C8C2',
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        warning: {
          DEFAULT: '#855400',
          container: '#FFDDB3',
        },
      },
    },
  },
};
