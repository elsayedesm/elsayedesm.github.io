export type SocialIconName = 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'gmail';

export function SocialIcon({ name }: { name: SocialIconName }) {
	switch (name) {
		case 'facebook':
			return (
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z"
					/>
				</svg>
			);
		case 'instagram':
			return (
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM17.4 7.1a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z"
					/>
				</svg>
			);
		case 'tiktok':
			return (
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M14.5 3c.4 2.4 1.8 4.2 4.2 4.6v2.5c-1.4 0-2.7-.4-3.9-1.2v6.6c0 3.4-2.7 6.2-6.2 6.2S2.4 18.9 2.4 15.4 5.1 9.2 8.6 9.2c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6V3h2.3z"
					/>
				</svg>
			);
		case 'whatsapp':
			return (
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M12.04 3A8.94 8.94 0 0 0 3.1 11.9a8.86 8.86 0 0 0 1.2 4.46L3 21.1l4.86-1.26A9 9 0 1 0 12.04 3zm0 16.3a7.3 7.3 0 0 1-3.72-1l-.27-.16-2.88.75.77-2.8-.17-.29a7.28 7.28 0 1 1 6.27 3.5zm4.2-5.45c-.23-.12-1.36-.67-1.57-.75s-.36-.12-.52.12-.6.75-.73.9-.27.17-.5.06a6 6 0 0 1-1.76-1.08 6.6 6.6 0 0 1-1.22-1.52c-.13-.23 0-.35.1-.46s.23-.27.35-.4.16-.23.23-.38.04-.29-.02-.4-.52-1.25-.71-1.71-.36-.39-.5-.4h-.42a.81.81 0 0 0-.58.27 2.46 2.46 0 0 0-.77 1.83 4.27 4.27 0 0 0 .9 2.26 9.77 9.77 0 0 0 3.74 3.3 4.2 4.2 0 0 0 2.46.62 2.1 2.1 0 0 0 1.39-.62 1.72 1.72 0 0 0 .38-1.23c-.06-.1-.21-.16-.44-.27z"
					/>
				</svg>
			);
		case 'gmail':
			return (
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5z"
					/>
				</svg>
			);
		default:
			return null;
	}
}
