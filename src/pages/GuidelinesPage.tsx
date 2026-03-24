import { Link } from 'react-router-dom';
import { useOgMeta } from '../hooks/useOgMeta';

export default function GuidelinesPage() {
  useOgMeta({
    title: '커뮤니티 가이드라인 — 건강한 밤문화 이야기',
    description: '서로 존중하는 커뮤니티를 위한 가이드라인. 욕설·허위정보·불법광고는 삭제됩니다.',
    image: '/og/default.svg',
    url: '/community/guidelines',
  });

  return (
    <div className="px-4 py-8">
      <nav className="breadcrumb mb-6" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <Link to="/community" target="_blank" rel="noopener noreferrer">커뮤니티</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">가이드라인</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-6">커뮤니티 가이드라인</h1>

      <div className="space-y-6">
        <section className="content-section">
          <h2 className="text-lg">기본 원칙</h2>
          <ul className="space-y-2 text-sm text-[#333333] leading-relaxed">
            <li>서로 존중합니다. 인격 모독, 혐오 발언, 차별적 표현은 금지합니다.</li>
            <li>직접 경험한 사실만 적습니다. 허위 후기, 과장된 정보는 삭제됩니다.</li>
            <li>불법 광고, 스팸, 도배는 즉시 삭제됩니다.</li>
            <li>개인정보 노출은 금지합니다. 본인 동의 없는 사진·연락처 게시는 삭제됩니다.</li>
          </ul>
        </section>

        <section className="content-section">
          <h2 className="text-lg">글 작성 규칙</h2>
          <ul className="space-y-2 text-sm text-[#333333] leading-relaxed">
            <li>제목에 업소명을 정확히 작성합니다.</li>
            <li>후기는 방문 날짜와 함께 적으면 더 도움이 됩니다.</li>
            <li>욕설이 포함된 글은 필터링 후 자동 삭제됩니다.</li>
            <li>같은 내용 반복 게시 (도배)는 계정 제한 사유입니다.</li>
          </ul>
        </section>

        <section className="content-section">
          <h2 className="text-lg">신고 절차</h2>
          <ul className="space-y-2 text-sm text-[#333333] leading-relaxed">
            <li>부적절한 글 발견 시 "신고" 버튼을 눌러주세요.</li>
            <li>신고 접수 후 24시간 내 검토합니다.</li>
            <li>가이드라인 위반 확인 시 해당 글은 삭제됩니다.</li>
            <li>반복 위반 시 계정이 제한됩니다.</li>
          </ul>
        </section>

        <section className="content-section">
          <h2 className="text-lg">레벨 시스템</h2>
          <div className="space-y-2 text-sm text-[#333333] leading-relaxed">
            <p>활동에 따라 레벨이 올라갑니다:</p>
            <ul className="space-y-1.5 ml-4">
              <li>뉴비 → 클러버 → 파티피플 → VIP → 레전드</li>
              <li>글 작성 +20P / 리뷰 작성 +50P / 댓글 +5P / 출석 +10P</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/community"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-hover font-semibold"
        >
          ← 커뮤니티로 돌아가기
        </Link>
      </div>
    </div>
  );
}
