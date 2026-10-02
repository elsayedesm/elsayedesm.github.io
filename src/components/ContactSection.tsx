import { useMemo, useState, type FormEvent } from 'react';
import { siteConfig } from '../siteConfig';
import { submitContactMessage } from '../lib/messagesApi';
import { getConfiguredSocialLinks } from '../lib/social';
import { isSupabaseConfigured } from '../lib/supabase';
import { SocialIcon, type SocialIconName } from './SocialIcon';

function isValidPhone(value: string) {
	const digits = value.replace(/\D/g, '');
	return digits.length >= 8 && digits.length <= 15;
}

interface ContactSectionProps {
	variant?: 'page' | 'home';
}

export function ContactSection({ variant = 'page' }: ContactSectionProps) {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [submittedOnce, setSubmittedOnce] = useState(false);

	const socialLinks = useMemo(() => getConfiguredSocialLinks(), []);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (loading || submittedOnce) return;
		setError(null);

		if (!name.trim()) {
			setError('الاسم مطلوب.');
			return;
		}
		if (!isValidPhone(phone)) {
			setError('رقم الهاتف غير صالح.');
			return;
		}
		if (!isSupabaseConfigured) {
			setError('نموذج التواصل غير متصل بقاعدة البيانات بعد.');
			return;
		}

		setLoading(true);
		try {
			await submitContactMessage({
				name: name.trim(),
				phone: phone.trim(),
				message: message.trim(),
			});
			setSuccess(true);
			setSubmittedOnce(true);
			setName('');
			setPhone('');
			setMessage('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'تعذر إرسال الرسالة.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`contact-block contact-block--${variant}`}>
			{variant === 'home' ? (
				<section className="page-hero page-section home-contact-hero">
					<p className="eyebrow">تواصل معي</p>
					<h2>جاهز نبدأ مشروعك؟</h2>
					<p>راسلني عبر القنوات التالية أو املأ النموذج، وسأرد عليك في أقرب وقت.</p>
				</section>
			) : (
				<section className="page-hero page-section">
					<p className="eyebrow">تواصل معي</p>
					<h1>لنبدأ مشروعك</h1>
					<p>املأ النموذج أو تواصل عبر القنوات التالية.</p>
				</section>
			)}

			<div className="contact-layout page-section">
				<section className="contact-panel glass-panel" aria-label="روابط التواصل">
					<h2>قنوات التواصل</h2>
					<ul className="social-list">
						{socialLinks.map((item) => (
							<li key={item.key}>
								{item.href ? (
									<a
										href={item.href}
										target={item.href.startsWith('mailto:') ? undefined : '_blank'}
										rel="noreferrer"
									>
										<span className={`social-icon social-icon--${item.key}`} aria-hidden="true">
											<SocialIcon name={item.key as SocialIconName} />
										</span>
										{item.label}
									</a>
								) : (
									<span className="social-list-disabled">
										<span className={`social-icon social-icon--${item.key}`} aria-hidden="true">
											<SocialIcon name={item.key as SocialIconName} />
										</span>
										{item.label}
										<small>أضف الرابط من الإعدادات</small>
									</span>
								)}
							</li>
						))}
					</ul>
					<p className="contact-note">
						{siteConfig.email} — يسعدني التعاون على مشروعك القادم.
					</p>
				</section>

				<section className="contact-form-wrap glass-panel">
					<h2>نموذج التواصل</h2>
					<form className="contact-form" onSubmit={onSubmit} noValidate>
						<label className="form-field">
							<span className="form-label">الاسم</span>
							<input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
						</label>
						<label className="form-field">
							<span className="form-label">رقم الهاتف</span>
							<input
								className="form-input ltr-field"
								dir="ltr"
								inputMode="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
							/>
						</label>
						<label className="form-field">
							<span className="form-label">وصف المشروع / الخدمة</span>
							<textarea
								className="form-textarea"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="أخبرني باختصار عن مشروعك أو الخدمة التي تحتاجها."
								rows={5}
							/>
						</label>
						{error ? (
							<p className="form-error" role="alert">
								{error}
							</p>
						) : null}
						{success ? (
							<p className="form-success" role="status">
								تم إرسال رسالتك بنجاح.
							</p>
						) : null}
						<button type="submit" className="primary-btn" disabled={loading || submittedOnce}>
							{loading ? 'جاري الإرسال...' : 'إرسال'}
						</button>
					</form>
				</section>
			</div>
		</div>
	);
}
