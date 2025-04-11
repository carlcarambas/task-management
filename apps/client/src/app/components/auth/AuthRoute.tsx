import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authSlice';

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthRoute;
