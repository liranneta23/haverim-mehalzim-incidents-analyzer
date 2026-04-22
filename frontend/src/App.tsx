import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './features/dashboard/DashboardPage';
import TacticalGlobe from './features/map/TacticalGlobe';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<DashboardPage />} />
        <Route path="/map" element={<div style={{ width: '100vw', height: '100vh' }}><TacticalGlobe /></div>} />
      </Routes>
    </BrowserRouter>
  );
}
