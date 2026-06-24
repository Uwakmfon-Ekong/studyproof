import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudyApp from './pages/StudyApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<StudyApp />} />
      </Routes>
    </BrowserRouter>
  );
}
