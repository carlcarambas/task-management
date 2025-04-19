import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authSlice';
import { useSocket } from '../../context/SocketContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const location = useLocation();

  if (!user) {
    socket?.disconnect();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
