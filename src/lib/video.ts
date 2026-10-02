export type VideoProvider = 'upload' | 'direct' | 'youtube' | 'vimeo' | 'drive';

export type ProjectVideoSource =
	| { kind: 'none'; src: ''; provider: null; message: string }
	| { kind: 'video'; src: string; provider: 'upload' | 'direct'; message?: string }
	| { kind: 'iframe'; src: string; provider: 'youtube' | 'vimeo' | 'drive'; message?: string }
	| { kind: 'external'; src: string; provider: 'drive'; message: string };

function safeUrl(url: string): URL | null {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

export function getYouTubeEmbedUrl(url: string): string | null {
	const parsed = safeUrl(url);
	if (!parsed) return null;
	const host = parsed.hostname.replace(/^www\./, '');
	if (host === 'youtu.be') {
		const id = parsed.pathname.split('/').filter(Boolean)[0];
		return id ? `https://www.youtube.com/embed/${id}` : null;
	}
	if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
		const id = parsed.searchParams.get('v');
		if (id) return `https://www.youtube.com/embed/${id}`;
		const parts = parsed.pathname.split('/');
		const embedIndex = parts.indexOf('embed');
		if (embedIndex >= 0 && parts[embedIndex + 1]) {
			return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
		}
		const shortsIndex = parts.indexOf('shorts');
		if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
			return `https://www.youtube.com/embed/${parts[shortsIndex + 1]}`;
		}
	}
	return null;
}

export function getVimeoEmbedUrl(url: string): string | null {
	const parsed = safeUrl(url);
	if (!parsed || !parsed.hostname.includes('vimeo.com')) return null;
	if (parsed.hostname.includes('player.vimeo.com')) return url;
	const id = parsed.pathname.split('/').filter(Boolean).pop();
	return id ? `https://player.vimeo.com/video/${id}` : null;
}

export function parseGoogleDriveFileId(url: string): string | null {
	const parsed = safeUrl(url);
	if (!parsed) return null;
	const host = parsed.hostname.replace(/^www\./, '');
	if (host !== 'drive.google.com' && host !== 'docs.google.com') return null;

	const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
	if (fileMatch?.[1]) return fileMatch[1];

	const openId = parsed.searchParams.get('id');
	if (openId) return openId;

	return null;
}

export function getGoogleDrivePreviewUrl(fileId: string): string {
	return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getGoogleDriveViewUrl(fileId: string): string {
	return `https://drive.google.com/file/d/${fileId}/view`;
}

export function isDirectVideoUrl(url: string): boolean {
	if (parseGoogleDriveFileId(url)) return false;
	if (getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)) return false;
	if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) return true;
	if (/\/storage\/v1\/object\//i.test(url)) return true;
	return false;
}

export function isSupportedVideoUrl(url: string): boolean {
	const trimmed = url.trim();
	if (!trimmed) return false;
	if (!safeUrl(trimmed)) return false;
	return Boolean(
		getYouTubeEmbedUrl(trimmed) ||
			getVimeoEmbedUrl(trimmed) ||
			parseGoogleDriveFileId(trimmed) ||
			isDirectVideoUrl(trimmed)
	);
}

export function validateVideoUrl(url: string): { ok: true } | { ok: false; message: string } {
	const trimmed = url.trim();
	if (!trimmed) {
		return { ok: false, message: 'رابط الفيديو مطلوب.' };
	}
	if (!safeUrl(trimmed)) {
		return { ok: false, message: 'رابط الفيديو غير صالح. استخدم رابطًا كاملًا يبدأ بـ https://' };
	}
	if (parseGoogleDriveFileId(trimmed)) {
		return { ok: true };
	}
	if (!isSupportedVideoUrl(trimmed)) {
		return {
			ok: false,
			message:
				'هذا الرابط غير مدعوم. استخدم فيديو مرفوع، أو رابط MP4/WebM مباشر، أو YouTube، أو Vimeo، أو رابط مشاركة Google Drive.',
		};
	}
	return { ok: true };
}

export function describeVideoSource(url: string, videoType: string): string {
	if (videoType === 'upload') return 'فيديو مرفوع';
	const trimmed = url.trim();
	if (getYouTubeEmbedUrl(trimmed)) return 'YouTube';
	if (getVimeoEmbedUrl(trimmed)) return 'Vimeo';
	if (parseGoogleDriveFileId(trimmed)) return 'Google Drive (معاينة)';
	if (isDirectVideoUrl(trimmed)) return 'رابط فيديو مباشر';
	return 'رابط فيديو';
}

export function getProjectVideoSource(videoUrl: string | null, videoType: string): ProjectVideoSource {
	if (!videoUrl?.trim()) {
		return { kind: 'none', src: '', provider: null, message: 'لا يوجد فيديو لهذا المشروع.' };
	}

	const trimmed = videoUrl.trim();

	const yt = getYouTubeEmbedUrl(trimmed);
	if (yt) return { kind: 'iframe', src: yt, provider: 'youtube' };

	const vimeo = getVimeoEmbedUrl(trimmed);
	if (vimeo) return { kind: 'iframe', src: vimeo, provider: 'vimeo' };

	const driveId = parseGoogleDriveFileId(trimmed);
	if (driveId) {
		return {
			kind: 'iframe',
			src: getGoogleDrivePreviewUrl(driveId),
			provider: 'drive',
			message:
				'Google Drive لا يوفّر بث HTML5 موثوقًا من رابط المشاركة، لذلك يُعرض عبر المعاينة. اجعل الملف متاحًا لأي شخص لديه الرابط.',
		};
	}

	if (videoType === 'upload' || isDirectVideoUrl(trimmed)) {
		return { kind: 'video', src: trimmed, provider: videoType === 'upload' ? 'upload' : 'direct' };
	}

	return {
		kind: 'none',
		src: '',
		provider: null,
		message: 'تعذر تشغيل هذا الرابط داخل المشغّل.',
	};
}
