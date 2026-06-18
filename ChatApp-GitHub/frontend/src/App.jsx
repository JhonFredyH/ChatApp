import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/useAuth.js";
import Login from "./pages/Login.jsx";
import ChatLayout from "./pages/ChatLayout.jsx";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <ChatLayout />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}