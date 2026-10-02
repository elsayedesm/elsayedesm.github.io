import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
	return (
		<>
			<div className="site-bg" aria-hidden="true" />
			<div className="site-bg-overlay" aria-hidden="true" />
			<Navbar />
			<main className="site-main">
				<Outlet />
			</main>
			<Footer />
		</>
	);
}
