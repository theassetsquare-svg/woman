import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Component, type ReactNode } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VenueListPage from './pages/VenueListPage';
import VenueDetailPage from './pages/VenueDetailPage';
import RegionPage from './pages/RegionPage';
import CategoryPage from './pages/CategoryPage';
import CommunityPage from './pages/CommunityPage';
import GuidelinesPage from './pages/GuidelinesPage';
import QuizPage from './pages/QuizPage';
import SafetyPage from './pages/SafetyPage';
import MagazinePage from './pages/MagazinePage';
import RankingPage from './pages/RankingPage';
import EventsPage from './pages/EventsPage';
import MapPage from './pages/MapPage';
import { useCanonical } from './hooks/useCanonical';
import { getVenueById } from './data/venues';
import { venuePath } from './utils/slug';

// ErrorBoundary — 에러 나도 빈 화면 방지
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px 24px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#111' }}>페이지를 불러오지 못했습니다</p>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>일시적인 오류입니다. 다시 시도해 주세요.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ background: '#DB2777', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', minHeight: '48px' }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CanonicalUpdater() {
  useCanonical();
  return null;
}

function OldVenueRedirect() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;
  if (!venue) return <Navigate to="/venues" replace />;
  return <Navigate to={venuePath(venue)} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CanonicalUpdater />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/venues" element={<VenueListPage />} />
            <Route path="/clubs" element={<CategoryPage />} />
            <Route path="/nights" element={<CategoryPage />} />
            <Route path="/lounges" element={<CategoryPage />} />
            <Route path="/rooms" element={<CategoryPage />} />
            <Route path="/yojeong" element={<CategoryPage />} />
            <Route path="/hoppa" element={<CategoryPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/guidelines" element={<GuidelinesPage />} />
            <Route path="/venue/:id" element={<OldVenueRedirect />} />
            <Route path="/:regionId" element={<RegionPage />} />
            <Route path="/:region/:slug" element={<VenueDetailPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
