import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './pages/Admin';
import TV from './pages/TV';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/tv1" element={<TV id="1" />} />
        <Route path="/tv2" element={<TV id="2" />} />
        <Route path="/tv3" element={<TV id="3" />} />
        <Route path="/tv4" element={<TV id="4" />} />
        <Route path="/tv5" element={<TV id="5" />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
