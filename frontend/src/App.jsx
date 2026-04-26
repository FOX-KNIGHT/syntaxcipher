import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login       from './pages/Login';
import JudgePanel  from './pages/JudgePanel';
import PlayerDash  from './pages/PlayerDash';
import Projector   from './pages/Projector';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<Navigate to="/login" replace />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/join"      element={<Login mode="join" />} />
            <Route path="/judge"     element={<JudgePanel />} />
            <Route path="/team"      element={<PlayerDash />} />
            <Route path="/projector" element={<Projector />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
