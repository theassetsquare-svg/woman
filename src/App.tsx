import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import { useCanonical } from './hooks/useCanonical';
import { getVenueById } from './data/venues';
import { venuePath } from './utils/slug';

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
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/guidelines" element={<GuidelinesPage />} />
          <Route path="/venue/:id" element={<OldVenueRedirect />} />
          <Route path="/:regionId" element={<RegionPage />} />
          <Route path="/:region/:slug" element={<VenueDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
