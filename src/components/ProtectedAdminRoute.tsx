import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './LoadingState';

export function ProtectedAdminRoute() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <LoadingState label="جاري التحقق من الجلسة..." />;
	if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
	return <Outlet />;
}
