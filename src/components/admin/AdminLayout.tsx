import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
	{ to: '/admin', label: 'لوحة التحكم', end: true },
	{ to: '/admin/projects', label: 'المشاريع' },
	{ to: '/admin/projects/new', label: 'مشروع جديد' },
	{ to: '/admin/messages', label: 'الرسائل' },
];

export function AdminLayout() {
	const [open, setOpen] = useState(false);
	const { signOut } = useAuth();
	const navigate = useNavigate();

	const onLogout = async () => {
		await signOut();
		navigate('/admin/login');
	};

	return (
		<div className="admin-shell">
			<aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
				<div className="admin-brand">
					<Link to="/" onClick={() => setOpen(false)}>
						<img src="/assets/logo.png" alt="Render Room" width={72} />
					</Link>
					<p>لوحة الإدارة</p>
				</div>
				<nav aria-label="إدارة الموقع">
					<ul>
						{links.map((link) => (
							<li key={link.to}>
								<NavLink
									to={link.to}
									end={link.end}
									onClick={() => setOpen(false)}
									className={({ isActive }) => (isActive ? 'active' : undefined)}
								>
									{link.label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
				<button type="button" className="ghost-btn admin-logout" onClick={onLogout}>
					تسجيل الخروج
				</button>
			</aside>
			{open ? <button type="button" className="admin-backdrop" aria-label="إغلاق" onClick={() => setOpen(false)} /> : null}
			<div className="admin-main-wrap">
				<header className="admin-topbar">
					<button type="button" className="nav-toggle admin-menu-toggle" aria-label="القائمة" onClick={() => setOpen((v) => !v)}>
						<span />
						<span />
						<span />
					</button>
					<Link to="/" className="admin-back-link">
						العودة للموقع
					</Link>
				</header>
				<main className="admin-main">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
