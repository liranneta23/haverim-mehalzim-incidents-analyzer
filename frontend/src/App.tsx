import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './features/dashboard/DashboardPage';
import TacticalGlobe from './features/map/TacticalGlobe';
import FundOurTeamPage from './features/fund/FundOurTeamPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<DashboardPage />} />
        <Route path="/map"          element={<div style={{ width: '100dvw', height: '100dvh' }}><TacticalGlobe /></div>} />
        <Route path="/fund-our-team" element={<FundOurTeamPage />} />
      </Routes>
    </BrowserRouter>
  );
}
