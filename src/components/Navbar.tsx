import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '../siteConfig';
import { useLogoTripleClick } from '../hooks/useLogoTripleClick';

export function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const onLogoClick = useLogoTripleClick();
	const headerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		document.body.classList.toggle('nav-open', menuOpen);
		return () => document.body.classList.remove('nav-open');
	}, [menuOpen]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setMenuOpen(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useEffect(() => {
		if (!menuOpen) return;
		const onPointer = (e: MouseEvent | TouchEvent) => {
			const target = e.target as Node | null;
			if (headerRef.current && target && !headerRef.current.contains(target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('touchstart', onPointer);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('touchstart', onPointer);
		};
	}, [menuOpen]);

	return (
		<>
			<header className="site-header" ref={headerRef}>
				<Link to="/" className="logo" onClick={onLogoClick} aria-label="Render Room">
					<img src="/assets/logo.png" alt="" width={100} height={40} />
				</Link>

				<nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="التنقل الرئيسي">
					<div className="main-nav-panel">
						<ul>
							{siteConfig.nav.map((item) => (
								<li key={item.href}>
									<NavLink
										to={item.href}
										end={item.href === '/'}
										onClick={() => setMenuOpen(false)}
										className={({ isActive }) => (isActive ? 'is-active' : undefined)}
									>
										{item.label}
									</NavLink>
								</li>
							))}
						</ul>
						<Link to="/contact" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>
							تواصل معي
						</Link>
					</div>
				</nav>

				<div className="hire-me">
					<Link to="/contact" onClick={() => setMenuOpen(false)}>
						تواصل معي
					</Link>
				</div>

				<button
					type="button"
					className={`nav-toggle ${menuOpen ? 'active' : ''}`}
					aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
					aria-expanded={menuOpen}
					aria-controls="main-navigation"
					onClick={() => setMenuOpen((open) => !open)}
				>
					<span />
					<span />
					<span />
				</button>
			</header>
			{menuOpen ? (
				<button type="button" className="nav-backdrop" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} />
			) : null}
		</>
	);
}
