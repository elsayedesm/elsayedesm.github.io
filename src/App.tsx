import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { WorksPage } from './pages/WorksPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminProjectNewPage } from './pages/admin/AdminProjectNewPage';
import { AdminProjectEditPage } from './pages/admin/AdminProjectEditPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<PublicLayout />}>
						<Route index element={<HomePage />} />
						<Route path="about" element={<AboutPage />} />
						<Route path="works" element={<WorksPage />} />
						<Route path="contact" element={<ContactPage />} />
					</Route>

					<Route path="/admin/login" element={<AdminLoginPage />} />
					<Route element={<ProtectedAdminRoute />}>
						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<AdminDashboardPage />} />
							<Route path="projects" element={<AdminProjectsPage />} />
							<Route path="projects/new" element={<AdminProjectNewPage />} />
							<Route path="projects/:id/edit" element={<AdminProjectEditPage />} />
							<Route path="messages" element={<AdminMessagesPage />} />
						</Route>
					</Route>

					<Route path="/contacts.html" element={<Navigate to="/contact" replace />} />
					<Route path="/projects.html" element={<Navigate to="/works" replace />} />
					<Route path="/about.html" element={<Navigate to="/about" replace />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
