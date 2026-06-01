# 자동 점검 리포트 (autopilot)
- 시각: 2026-06-01T20:40:50.117Z
- 결과: 문제 없음 ✅

## ✅ 빌드(프리렌더+sitemap)

```
dist/assets/RankingPage-AQUDhL1-.js        3.41 kB │ gzip:   1.51 kB
dist/assets/GuidelinesPage-E3qW124n.js     3.53 kB │ gzip:   1.34 kB
dist/assets/MapPage-MK0tTctB.js            3.55 kB │ gzip:   1.48 kB
dist/assets/EventsPage-BwI9E7Lr.js         5.01 kB │ gzip:   2.15 kB
dist/assets/CommunityPage-DZxYu3rK.js      5.16 kB │ gzip:   2.09 kB
dist/assets/QuizPage-ClkG11tb.js           5.24 kB │ gzip:   2.51 kB
dist/assets/SafetyPage-uUahq2sV.js         7.95 kB │ gzip:   2.83 kB
dist/assets/VenueDetailPage-CI0XpHUM.js  356.05 kB │ gzip:  87.56 kB
dist/assets/index-crYr9hnf.js            432.27 kB │ gzip: 126.60 kB
✓ built in 4.61s
Sitemap: 156 URLs (trailing-slash).
Prerender complete: 158 pages generated.
```

## ✅ 콘텐츠 감사(중복/스터핑)

```
[2] 교차페이지 보일러플레이트(여러 업소 공통 문장)
  ✓ 공통 템플릿 없음

[3] 업소 제목/설명 중복·빈값
  ✓ 업소 hook(제목): 103개 모두 고유
  ✓ 업소 desc: 103개 모두 고유

[4] 지역 제목/설명 중복·규격
  ✓ 지역 title: 38개 모두 고유
  ✓ 지역 desc: 38개 모두 고유

=== 감사 결과: PASS ✅ ===
```

## ✅ 가게이름 SEO 전수점검

```
  ✓ 없음

[3] 같은 지역 타업소 상호 교차오염 (0)
  ✓ 없음

[4] 스키마 name 불일치 (0)
  ✓ 없음

[5] 프리렌더 누락 (0)
  ✓ 없음

=== 전 업소 가게이름 SEO: PASS ✅ ===
```

## ✅ 라이브 건강검진(전 페이지)

```
-   · "부천 고래 나이트" → /bucheon/ , /bucheon/gorae-night/
-   · "성남 샴푸나이트" → /seongnam/ , /seongnam/shampoo-night/
-   · "수원 비스트 후기" → / , /gyeonggi/suwon-beast/
-   · "인덕원 나이트" → /indeogwon/ , /indeogwon/gukbingwan-night/
-   · "장안동 큐브" → /jangan/bini , /jangan/cube , /jangan/cube/
-   · "장안동 큐브 후기" → /jangan/cube , /jangan/cube/
-   · "장안동 호빠" → /jangan/bbangbbang , /jangan/bini , /jangan/bini/ , /jangan/cube
-   · "장안동호빠" → /jangan/bbangbbang , /jangan/bini , /jangan/bini/ , /jangan/cube
-   · "장안동호빠 장안동호스트바" → /jangan/bbangbbang , /jangan/cube


[OK] 문제 없음
```
