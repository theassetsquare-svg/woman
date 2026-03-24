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
          <Route path="/venue/:id" element={<OldVenueRedirect />} />
          <Route path="/:regionId" element={<RegionPage />} />
          <Route path="/:region/:slug" element={<VenueDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
