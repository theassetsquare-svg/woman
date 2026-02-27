import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VenueListPage from './pages/VenueListPage';
import VenueDetailPage from './pages/VenueDetailPage';
import RegionPage from './pages/RegionPage';
import { useCanonical } from './hooks/useCanonical';

function CanonicalUpdater() {
  useCanonical();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <CanonicalUpdater />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenueListPage />} />
          <Route path="/venue/:id" element={<VenueDetailPage />} />
          <Route path="/region/:regionId" element={<RegionPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
