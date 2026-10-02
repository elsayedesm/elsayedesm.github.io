import { ContactSection } from '../components/ContactSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function ContactPage() {
	useScrollReveal('.page-hero, .contact-panel, .contact-form-wrap');
	return (
		<div className="contact-page">
			<ContactSection variant="page" />
		</div>
	);
}
