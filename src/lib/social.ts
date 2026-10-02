import { siteConfig } from '../siteConfig';

export type SocialKey = keyof typeof siteConfig.social;

export const socialOrder: SocialKey[] = ['facebook', 'instagram', 'tiktok', 'whatsapp', 'gmail'];

export const socialLabels: Record<SocialKey, string> = {
	facebook: 'Facebook',
	instagram: 'Instagram',
	tiktok: 'TikTok',
	whatsapp: 'WhatsApp',
	gmail: 'Gmail',
};

function toWhatsAppHref(value: string): string {
	let digits = value.replace(/\D/g, '');
	if (digits.startsWith('00')) digits = digits.slice(2);
	if (digits.startsWith('0')) digits = `20${digits.slice(1)}`;
	return `https://wa.me/${digits}`;
}

export function getSocialHref(key: SocialKey, raw: string): string | null {
	const value = raw.trim();
	if (!value) return null;

	if (key === 'whatsapp') return toWhatsAppHref(value);
	if (key === 'gmail') return value.startsWith('mailto:') ? value : `mailto:${value}`;

	if (/^https?:\/\//i.test(value) || value.startsWith('mailto:')) return value;

	if (key === 'facebook') return `https://facebook.com/${value.replace(/^@/, '')}`;
	if (key === 'instagram') return `https://instagram.com/${value.replace(/^@/, '')}`;
	if (key === 'tiktok') return `https://www.tiktok.com/@${value.replace(/^@/, '')}`;
	return value;
}

export function getConfiguredSocialLinks() {
	return socialOrder.map((key) => ({
		key,
		label: socialLabels[key],
		href: getSocialHref(key, siteConfig.social[key]),
	}));
}
