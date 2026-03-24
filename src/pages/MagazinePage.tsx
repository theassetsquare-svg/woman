import { Link } from 'react-router-dom';
import { getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';

const MAIN = getMainLink();

const articles = [
  {
    id: 1,
    title: '강남 vs 홍대 — 처음 간다면 어디?',
    excerpt:
      '강남은 대형 나이트와 프리미엄 라운지가 밀집한 정통 코스이고, 홍대는 클럽 중심의 자유로운 분위기가 매력입니다. 첫 방문이라면 본인 취향에 맞는 분위기를 먼저 파악하는 것이 핵심입니다.',
    category: '비교 가이드',
    readingTime: '3분',
  },
  {
    id: 2,
    title: '나이트 처음이면 이것만 알면 된다',
    excerpt:
      '입장 시간, 드레스코드, 실장 연결 방법까지 — 나이트클럽 첫 방문 전 꼭 알아야 할 기본기를 정리했습니다. 미리 알고 가면 어색함 없이 즐길 수 있습니다.',
    category: '초보 가이드',
    readingTime: '4분',
  },
  {
    id: 3,
    title: '프라이빗하게 즐기고 싶다면 — 룸과 요정 비교',
    excerpt:
      '단체 모임이나 접대 자리에서 선택지가 되는 룸과 요정, 각각의 분위기와 운영 방식은 상당히 다릅니다. 목적에 맞는 선택이 만족도를 크게 좌우합니다.',
    category: '심층 분석',
    readingTime: '5분',
  },
];

export default function MagazinePage() {
  useOgMeta({
    title: '매거진 — 밤문화 가이드 & 비교 분석',
    description:
      '강남 vs 홍대 비교, 나이트 초보 가이드, 룸과 요정 차이까지. 현장 기반 밤문화 매거진.',
    image: '/og/default.svg',
    url: '/magazine',
  });

  return (
    <div className="px-4 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#555555] mb-4">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          홈
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[#111111] font-semibold">매거진</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">매거진</h1>
      <p className="text-base text-[#333333] leading-relaxed mb-6">
        현장 경험을 바탕으로 정리한 밤문화 가이드. 비교, 분석, 초보 안내까지.
      </p>

      {/* Article cards */}
      <div className="space-y-4 mb-8">
        {articles.map((article) => (
          <a
            key={article.id}
            href={MAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-accent bg-surface-warm px-2 py-0.5 rounded-full">
                {article.category}
              </span>
              <span className="text-[11px] text-[#555555]">읽기 {article.readingTime}</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#111111] leading-snug mb-2">
              {article.title}
            </h2>
            <p className="text-sm text-[#333333] leading-relaxed">{article.excerpt}</p>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mb-6">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="main-hook-banner inline-block text-center px-6 py-3"
        >
          <p className="font-black text-base mb-1">밤키에서 더 보기</p>
          <p className="text-sm opacity-80">더 많은 매거진 콘텐츠 →</p>
        </a>
      </div>
    </div>
  );
}
