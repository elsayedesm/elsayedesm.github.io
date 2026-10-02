import type { Project } from '../types/project';
import { STORAGE_BUCKETS, supabase } from './supabase';

export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MIME_BY_EXT: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	mp4: 'video/mp4',
	m4v: 'video/mp4',
	webm: 'video/webm',
	mov: 'video/quicktime',
	ogg: 'video/ogg',
};

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

function assertSupabase() {
	if (!supabase) throw new Error('Supabase is not configured.');
	return supabase;
}

export function getFileExtension(fileName: string): string {
	const ext = fileName.split('.').pop()?.toLowerCase() || '';
	return ext.replace(/[^a-z0-9]/g, '') || 'bin';
}

export function inferMimeType(file: File): string {
	if (file.type && file.type !== 'application/octet-stream') {
		if (file.type === 'video/x-m4v' || file.type === 'video/x-mp4') return 'video/mp4';
		return file.type;
	}
	return MIME_BY_EXT[getFileExtension(file.name)] || file.type || 'application/octet-stream';
}

export function fileWithInferredType(file: File): File {
	const type = inferMimeType(file);
	if (file.type === type) return file;
	return new File([file], file.name, { type, lastModified: file.lastModified });
}

export function extractStoragePath(value: string | null | undefined, bucket: keyof typeof STORAGE_BUCKETS): string | null {
	if (!value?.trim()) return null;
	const trimmed = value.trim();
	const bucketName = STORAGE_BUCKETS[bucket];

	if (trimmed.startsWith('/') && !trimmed.includes('/storage/')) {
		return null;
	}

	if (!/^https?:\/\//i.test(trimmed)) {
		return decodeURIComponent(trimmed.replace(/^\//, ''));
	}

	try {
		const url = new URL(trimmed);
		const markers = [
			`/storage/v1/object/public/${bucketName}/`,
			`/storage/v1/object/sign/${bucketName}/`,
			`/storage/v1/object/authenticated/${bucketName}/`,
			`/storage/v1/render/image/public/${bucketName}/`,
		];
		for (const marker of markers) {
			const index = url.pathname.indexOf(marker);
			if (index !== -1) {
				return decodeURIComponent(url.pathname.slice(index + marker.length));
			}
		}

		const generic = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)/);
		if (generic?.[1] === bucketName && generic[2]) {
			return decodeURIComponent(generic[2]);
		}
	} catch {
		return null;
	}
	return null;
}

export function getStoragePathFromPublicUrl(publicUrl: string, bucket: keyof typeof STORAGE_BUCKETS): string | null {
	return extractStoragePath(publicUrl, bucket);
}

export function getPublicMediaUrl(pathOrUrl: string, bucket: keyof typeof STORAGE_BUCKETS): string {
	const client = supabase;
	if (!client) return pathOrUrl;
	const path = extractStoragePath(pathOrUrl, bucket);
	if (!path) return pathOrUrl;
	return client.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path).data.publicUrl;
}

async function signPaths(bucket: keyof typeof STORAGE_BUCKETS, paths: string[]): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	const unique = [...new Set(paths.filter(Boolean))];
	if (!unique.length || !supabase) return map;

	const bucketName = STORAGE_BUCKETS[bucket];
	const { data, error } = await supabase.storage.from(bucketName).createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);

	if (!error && data?.length) {
		for (const item of data) {
			const path = item.path;
			const signed = item.signedUrl;
			if (path && signed) map.set(path, signed);
		}
	}

	for (const path of unique) {
		if (!map.has(path)) {
			map.set(path, supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl);
		}
	}

	return map;
}

export async function resolveStoredMediaUrl(
	value: string | null | undefined,
	bucket: keyof typeof STORAGE_BUCKETS,
	prefer: 'public' | 'signed' = 'public'
): Promise<string | null> {
	if (!value?.trim()) return null;
	const path = extractStoragePath(value, bucket);
	if (!path) return value.trim();
	if (prefer === 'signed') {
		const signed = await signPaths(bucket, [path]);
		return signed.get(path) ?? getPublicMediaUrl(path, bucket);
	}
	return getPublicMediaUrl(path, bucket);
}

export async function resolveSignedMediaUrl(
	value: string | null | undefined,
	bucket: keyof typeof STORAGE_BUCKETS
): Promise<string | null> {
	return resolveStoredMediaUrl(value, bucket, 'signed');
}

export async function hydrateProjectMedia<T extends Pick<Project, 'thumbnail_url' | 'video_url' | 'video_type'>>(
	projects: T[]
): Promise<T[]> {
	if (!projects.length || !supabase) return projects;

	return projects.map((project) => {
		const next = { ...project };
		if (project.thumbnail_url) {
			next.thumbnail_url = getPublicMediaUrl(project.thumbnail_url, 'thumbnails');
		}
		if (project.video_type === 'upload' && project.video_url) {
			next.video_url = getPublicMediaUrl(project.video_url, 'videos');
		}
		return next;
	});
}

export async function uploadProjectFile(
	bucket: keyof typeof STORAGE_BUCKETS,
	file: File,
	pathPrefix: string
): Promise<string> {
	const client = assertSupabase();
	const typedFile = fileWithInferredType(file);
	const ext = getFileExtension(typedFile.name);
	const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
	const contentType = inferMimeType(typedFile);

	const { error } = await client.storage.from(STORAGE_BUCKETS[bucket]).upload(path, typedFile, {
		cacheControl: '3600',
		upsert: false,
		contentType,
	});
	if (error) {
		throw new Error(error.message || 'تعذر رفع الملف إلى التخزين.');
	}

	const { data } = client.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path);
	if (!data.publicUrl) {
		throw new Error('تم رفع الملف لكن تعذر إنشاء الرابط العام.');
	}
	return data.publicUrl;
}

export async function removeStorageFile(
	bucket: keyof typeof STORAGE_BUCKETS,
	publicUrl: string | null | undefined
): Promise<void> {
	if (!publicUrl) return;
	const path = extractStoragePath(publicUrl, bucket);
	if (!path) return;
	const client = assertSupabase();
	await client.storage.from(STORAGE_BUCKETS[bucket]).remove([path]);
}
