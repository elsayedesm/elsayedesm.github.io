export type VideoType = 'upload' | 'url';

export interface Project {
	id: string;
	title: string;
	description: string;
	thumbnail_url: string;
	video_url: string | null;
	video_type: VideoType;
	project_date: string | null;
	is_published: boolean;
	created_at: string;
	updated_at: string;
}

export interface ContactMessage {
	id: string;
	name: string;
	phone: string;
	message: string;
	is_read: boolean;
	created_at: string;
}
