import { Link } from 'react-router-dom';
import { siteConfig } from '../siteConfig';
import { getConfiguredSocialLinks } from '../lib/social';
import { SocialIcon, type SocialIconName } from './SocialIcon';

export function Footer() {
	const socials = getConfiguredSocialLinks();

	return (
		<footer>
			<div className="footer-inner">
				<p className="do">عندك مشروع؟ يسعدني التعاون معك.</p>
				<Link to="/contact" className="footer-cta">
					<svg className="icon-envelope" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
					</svg>
					<span>تواصل معي</span>
				</Link>
				<ul className="footer-social" aria-label="حسابات التواصل">
					{socials.map((item) =>
						item.href ? (
							<li key={item.key}>
								<a
									href={item.href}
									target={item.href.startsWith('mailto:') ? undefined : '_blank'}
									rel="noreferrer"
									aria-label={item.label}
								>
									<SocialIcon name={item.key as SocialIconName} />
									<span>{item.label}</span>
								</a>
							</li>
						) : null
					)}
				</ul>
				<nav className="footer-nav" aria-label="روابط سريعة">
					{siteConfig.nav.map((item) => (
						<Link key={item.href} to={item.href}>
							{item.label}
						</Link>
					))}
				</nav>
				<p className="copy">السيد أنور. جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
				<p className="by">Designed & Built by Elsayed Anwar Esmail</p>
			</div>
		</footer>
	);
}
