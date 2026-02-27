import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VenueListPage from './pages/VenueListPage';
import VenueDetailPage from './pages/VenueDetailPage';
import RegionPage from './pages/RegionPage';
import { useCanonical } from './hooks/useCanonical';
import { getVenueById } from './data/venues';
import { venuePath } from './utils/slug';

function CanonicalUpdater() {
  useCanonical();
  return null;
}

/** Redirect old /venue/:id → /:region/:slug */
function OldVenueRedirect() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;
  if (!venue) return <Navigate to="/venues" replace />;
  return <Navigate to={venuePath(venue)} replace />;
}

/** Redirect old /region/:regionId → /:regionId */
function OldRegionRedirect() {
  const { regionId } = useParams<{ regionId: string }>();
  return <Navigate to={`/${regionId}`} replace />;
}

/** Redirect old /seoul/* routes to new categories */
const seoulRedirects: Record<string, string> = {
  boston: '/gangnam/boston',
  i: '/gangnam/i',
  flirting: '/gangnam/flirting',
  blackhole: '/gangnam/blackhole',
  wclub: '/geondae/wclub',
  bini: '/jangan/bini',
};

function OldSeoulRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const target = slug ? seoulRedirects[slug] : undefined;
  if (target) return <Navigate to={target} replace />;
  return <Navigate to="/venues" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <CanonicalUpdater />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenueListPage />} />
          {/* Legacy redirects — static prefix beats dynamic */}
          <Route path="/venue/:id" element={<OldVenueRedirect />} />
          <Route path="/region/:regionId" element={<OldRegionRedirect />} />
          <Route path="/seoul/:slug" element={<OldSeoulRedirect />} />
          <Route path="/seoul" element={<Navigate to="/gangnam" replace />} />
          {/* New canonical routes */}
          <Route path="/:regionId" element={<RegionPage />} />
          <Route path="/:region/:slug" element={<VenueDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
