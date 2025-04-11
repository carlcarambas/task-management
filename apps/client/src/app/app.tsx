import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Tasks from './components/Tasks';
import ProtectedRoute from './components/auth/ProtectedRoutes';
import AuthRoute from './components/auth/AuthRoute';

export function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
