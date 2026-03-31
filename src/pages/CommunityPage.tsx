import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOgMeta } from '../hooks/useOgMeta';
import { getMainLink } from '../data/venues';

const MAIN = getMainLink();

const boards = [
  { id: 'free', label: '자유', desc: '밤문화 관련 자유로운 이야기' },
  { id: 'review', label: '후기', desc: '업소 방문 솔직 후기' },
  { id: 'party', label: '파티모집', desc: '같이 갈 사람 N빵 모집' },
  { id: 'tips', label: '팁', desc: '알아두면 좋은 꿀팁' },
  { id: 'fashion', label: '패션', desc: '드레스코드·스타일 공유' },
  { id: 'qna', label: 'Q&A', desc: '궁금한 것 질문' },
];

const samplePosts = [
  { board: '자유', title: '금요일 강남 어디가 핫한지 아는 분?', author: '밤의왕자', likes: 47, comments: 12 },
  { board: '후기', title: '수원찬스돔나이트 다녀왔는데 강호동 실장 진짜 웃겨', author: '수원토박이', likes: 83, comments: 24 },
  { board: '팁', title: '나이트 처음 가는 사람이 꼭 알아야 할 5가지', author: '베테랑', likes: 156, comments: 31 },
  { board: '패션', title: '클럽 갈 때 이 조합이면 무조건 입장', author: '패션피플', likes: 72, comments: 18 },
  { board: 'Q&A', title: '홍대 vs 강남 클럽 분위기 차이가 뭐예요?', author: '초보탐험가', likes: 34, comments: 15 },
  { board: '파티모집', title: '이번 토요일 강남 4명 N빵 모집합니다', author: '파티메이커', likes: 28, comments: 9 },
  { board: '후기', title: '압구정클럽 하입 분위기 미쳤다 진짜', author: '클럽매니아', likes: 91, comments: 27 },
  { board: '팁', title: '웨이터한테 팁 주는 문화 있는지 정리해봄', author: '정보통', likes: 64, comments: 20 },
];

export default function CommunityPage() {
  useOgMeta({
    title: '커뮤니티 — 밤문화 후기·팁·파티모집',
    description: '전국 밤문화 솔직 후기, 꿀팁, 파티 모집. 진짜 경험한 사람들의 이야기.',
    image: '/og/default.svg',
    url: '/community',
  });

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">커뮤니티</h1>
      <p className="text-sm text-[#333333] leading-relaxed mb-6">
        가본 사람만 아는 진짜 이야기. 후기, 팁, 파티 모집까지.
      </p>

      {/* 게시판 6종 안내 */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {boards.map((b) => (
          <div key={b.id} className="p-3 bg-surface-warm border border-rosegold rounded-xl text-center">
            <p className="text-sm font-bold text-[#111111]">{b.label}</p>
            <p className="text-xs text-[#555555] mt-0.5">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* 인기글 미리보기 */}
      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-[#111111] mb-4">인기글</h2>
        <div className="space-y-3">
          {samplePosts.map((post, i) => (
            <a
              key={i}
              href={MAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-accent bg-surface-warm px-2 py-0.5 rounded-full">{post.board}</span>
                <span className="text-xs text-[#555555]">{post.author}</span>
              </div>
              <p className="text-sm font-bold text-[#111111] leading-snug">{post.title}</p>
              <div className="flex gap-3 mt-2 text-xs text-[#555555]">
                <span>좋아요 {post.likes}</span>
                <span>댓글 {post.comments}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 글쓰기 → 밤키 유입 */}
      <section className="mb-8">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="main-hook-banner block text-center"
        >
          <p className="font-black text-base mb-1">글쓰기 · 댓글 · 좋아요</p>
          <p className="text-sm opacity-80">밤키에서 참여하기 →</p>
        </a>
      </section>

      {/* [N빵 계산기] */}
      <section className="mb-8">
        <NbbangCalculator />
      </section>

      {/* 가이드라인 링크 */}
      <div className="text-center">
        <Link
          to="/community/guidelines"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-hover font-semibold"
        >
          커뮤니티 가이드라인 →
        </Link>
      </div>
    </div>
  );
}

function NbbangCalculator() {
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  const perPerson = total && people && Number(people) > 0 ? Math.ceil(Number(total) / Number(people)) : 0;

  return (
    <div className="cta-section p-5">
      <h3 className="text-base font-extrabold text-[#111111] mb-3">N빵 계산기</h3>
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label htmlFor="nbbang-total" className="text-xs text-[#555555] font-medium block mb-1">총 금액 (원)</label>
          <input
            id="nbbang-total"
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="300000"
            className="search-input text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="nbbang-people" className="text-xs text-[#555555] font-medium block mb-1">인원 수</label>
          <input
            id="nbbang-people"
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="4"
            className="search-input text-sm"
          />
        </div>
      </div>
      {perPerson > 0 && (
        <div className="text-center p-3 bg-surface-warm rounded-xl">
          <p className="text-xs text-[#555555]">1인당</p>
          <p className="text-xl font-black text-accent">{perPerson.toLocaleString()}원</p>
        </div>
      )}
    </div>
  );
}
