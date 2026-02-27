import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VenueListPage from './pages/VenueListPage';
import VenueDetailPage from './pages/VenueDetailPage';
import RegionPage from './pages/RegionPage';

function App() {
  return (
    <BrowserRouter>
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
