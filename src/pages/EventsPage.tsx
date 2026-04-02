import { Link } from 'react-router-dom';
import { getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';

const MAIN = getMainLink();

interface RecurringEvent {
  id: string;
  title: string;
  description: string;
  dayLabel: string;
  dayNumbers: number[]; // 0=Sun ... 6=Sat
  color: string;
}

const recurringEvents: RecurringEvent[] = [
  {
    id: 'friday-peak',
    title: '금요일 밤 — 전국 나이트 피크타임',
    description:
      '전국 나이트클럽이 가장 붐비는 시간대. 강남·수원·부산 등 주요 지역 나이트에서 금요 밤 특별 무대가 운영됩니다.',
    dayLabel: '매주 금요일',
    dayNumbers: [5],
    color: '#D4A574',
  },
  {
    id: 'saturday-dj',
    title: '토요일 밤 — 클럽 DJ 파티 시즌',
    description:
      '주말 클럽 파티의 절정. 홍대, 강남, 이태원 등 클럽 밀집 지역에서 게스트 DJ 이벤트가 집중됩니다.',
    dayLabel: '매주 토요일',
    dayNumbers: [6],
    color: '#C49A6C',
  },
  {
    id: 'weekday-event',
    title: '평일 이벤트 — 화수목 할인 시간대',
    description:
      '화요일부터 목요일까지 여유롭게 즐길 수 있는 시간대. 평일 방문 시 비교적 한산한 분위기에서 여유로운 경험이 가능합니다.',
    dayLabel: '매주 화·수·목',
    dayNumbers: [2, 3, 4],
    color: '#B08A5C',
  },
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function getEventColorsForDay(dayOfWeek: number): string[] {
  return recurringEvents
    .filter((e) => e.dayNumbers.includes(dayOfWeek))
    .map((e) => e.color);
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];
const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

export default function EventsPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const weeks = buildCalendar(year, month);
  const today = now.getDate();

  useOgMeta({
    title: '이벤트 캘린더 — 전국 밤문화 일정',
    description:
      '금요 나이트 피크타임, 토요 클럽 DJ 파티, 평일 이벤트까지. 전국 밤문화 일정을 한 번에.',
    image: '/og/default.jpg',
    url: '/events',
  });

  /* JSON-LD for a sample event (Friday night peak) */
  const nextFriday = new Date(now);
  nextFriday.setDate(today + ((5 - now.getDay() + 7) % 7 || 7));
  const fridayISO = nextFriday.toISOString().split('T')[0];

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: '금요일 밤 — 전국 나이트 피크타임',
    startDate: `${fridayISO}T21:00:00+09:00`,
    endDate: `${fridayISO}T03:00:00+09:00`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description:
      '전국 나이트클럽이 가장 붐비는 시간대. 강남·수원·부산 등 주요 지역 나이트에서 금요 밤 특별 무대가 운영됩니다.',
    organizer: {
      '@type': 'Organization',
      name: '여성이 편안한 밤문화',
      url: 'https://woman-5nj.pages.dev',
    },
  };

  return (
    <div className="px-4 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-[#555555] mb-4">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          홈
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[#111111] font-semibold">이벤트</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">이벤트 캘린더</h1>
      <p className="text-base text-[#333333] leading-relaxed mb-6">
        전국 밤문화 주요 일정을 바로 확인하자.
      </p>

      {/* Calendar */}
      <section className="mb-8">
        <h2 className="text-xl font-extrabold text-[#111111] mb-4">
          {year}년 {MONTH_NAMES[month]}
        </h2>
        <div className="grid grid-cols-7 text-center text-xs font-bold text-[#555555] mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 text-center">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={di} className="py-2" />;
              }
              const dayOfWeek = new Date(year, month, day).getDay();
              const colors = getEventColorsForDay(dayOfWeek);
              const isToday = day === today;
              return (
                <div
                  key={di}
                  className="py-2 relative"
                  style={{
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? '#D4A574' : '#333333',
                    fontSize: 14,
                  }}
                >
                  {day}
                  {colors.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {colors.map((c, ci) => (
                        <span
                          key={ci}
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </section>

      {/* Event cards */}
      <section className="mb-8">
        <h2 className="text-xl font-extrabold text-[#111111] mb-4">정기 이벤트</h2>
        <div className="space-y-3">
          {recurringEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 bg-white border-2 border-rosegold rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: evt.color }}
                />
                <span className="text-xs font-bold text-[#555555]">{evt.dayLabel}</span>
              </div>
              <h3 className="text-base font-extrabold text-[#111111] mb-1">{evt.title}</h3>
              <p className="text-sm text-[#333333] leading-relaxed">{evt.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center mb-6">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="main-hook-banner inline-block text-center px-6 py-3"
        >
          <p className="font-black text-base mb-1">이벤트 등록은 밤키에서</p>
          <p className="text-sm opacity-80">밤키에서 더 보기 →</p>
        </a>
      </div>
    </div>
  );
}
