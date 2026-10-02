import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, VideoType } from '../types/project';
import {
	ACCEPTED_IMAGE_TYPES,
	ACCEPTED_VIDEO_TYPES,
	MAX_THUMBNAIL_BYTES,
	MAX_VIDEO_BYTES,
	removeStorageFile,
	resolveStoredMediaUrl,
	uploadProjectFile,
} from '../lib/storage';
import { createProject, updateProject } from '../lib/projectsApi';
import { describeVideoSource, validateVideoUrl } from '../lib/video';
import { FileUploader } from './FileUploader';

type VideoMode = 'upload' | 'url';

interface ProjectFormProps {
	mode: 'create' | 'edit';
	initial?: Project | null;
}

export function ProjectForm({ mode, initial }: ProjectFormProps) {
	const navigate = useNavigate();
	const [title, setTitle] = useState(initial?.title ?? '');
	const [description, setDescription] = useState(initial?.description ?? '');
	const [projectDate, setProjectDate] = useState(initial?.project_date ?? '');
	const [videoMode, setVideoMode] = useState<VideoMode>(initial?.video_type === 'url' ? 'url' : 'upload');
	const [videoUrl, setVideoUrl] = useState(initial?.video_type === 'url' ? initial.video_url ?? '' : '');
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [resolvedThumb, setResolvedThumb] = useState(initial?.thumbnail_url ?? null);
	const [resolvedVideo, setResolvedVideo] = useState(initial?.video_type === 'upload' ? initial.video_url : null);

	useEffect(() => {
		let cancelled = false;
		if (initial?.thumbnail_url) {
			void resolveStoredMediaUrl(initial.thumbnail_url, 'thumbnails').then((url) => {
				if (!cancelled) setResolvedThumb(url);
			});
		}
		if (initial?.video_type === 'upload' && initial.video_url) {
			void resolveStoredMediaUrl(initial.video_url, 'videos').then((url) => {
				if (!cancelled) setResolvedVideo(url);
			});
		}
		return () => {
			cancelled = true;
		};
	}, [initial?.thumbnail_url, initial?.video_url, initial?.video_type]);

	const thumbnailPreview = useMemo(() => {
		if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
		return resolvedThumb;
	}, [thumbnailFile, resolvedThumb]);

	const videoPreview = useMemo(() => {
		if (videoFile) return URL.createObjectURL(videoFile);
		if (videoMode === 'upload') return resolvedVideo;
		return null;
	}, [videoFile, videoMode, resolvedVideo]);

	const urlKind = videoMode === 'url' && videoUrl.trim() ? describeVideoSource(videoUrl, 'url') : null;
	const urlCheck = videoMode === 'url' && videoUrl.trim() ? validateVideoUrl(videoUrl) : null;

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!title.trim() || !description.trim()) {
			setError('اسم المشروع والوصف مطلوبان.');
			return;
		}
		if (!thumbnailFile && !initial?.thumbnail_url) {
			setError('صورة الغلاف مطلوبة.');
			return;
		}
		if (videoMode === 'url') {
			const check = validateVideoUrl(videoUrl);
			if (!check.ok) {
				setError(check.message);
				return;
			}
		}
		if (videoMode === 'upload' && !videoFile && !initial?.video_url) {
			setError('يجب رفع فيديو أو اختيار رابط.');
			return;
		}

		setSubmitting(true);
		try {
			let thumbnailUrl = initial?.thumbnail_url ?? '';
			let nextVideoUrl = initial?.video_url ?? null;
			let videoType: VideoType = initial?.video_type ?? 'upload';
			const oldThumbnail = initial?.thumbnail_url;
			const oldVideo = initial?.video_type === 'upload' ? initial.video_url : null;

			if (thumbnailFile) {
				thumbnailUrl = await uploadProjectFile('thumbnails', thumbnailFile, 'thumbnails');
			}

			if (videoMode === 'url') {
				videoType = 'url';
				nextVideoUrl = videoUrl.trim();
			} else if (videoFile) {
				videoType = 'upload';
				nextVideoUrl = await uploadProjectFile('videos', videoFile, 'videos');
			}

			const payload = {
				title: title.trim(),
				description: description.trim(),
				thumbnail_url: thumbnailUrl,
				video_url: nextVideoUrl,
				video_type: videoType,
				project_date: projectDate.trim() ? projectDate : null,
				is_published: true,
			};

			if (mode === 'create') {
				await createProject(payload);
			} else if (initial) {
				await updateProject(initial.id, payload);
				if (thumbnailFile && oldThumbnail) await removeStorageFile('thumbnails', oldThumbnail);
				if (videoFile && oldVideo) await removeStorageFile('videos', oldVideo);
			}

			setSuccess('تم حفظ المشروع بنجاح.');
			window.setTimeout(() => navigate('/admin/projects'), 700);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'تعذر حفظ المشروع.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form className="admin-form" onSubmit={onSubmit} noValidate>
			<FileUploader
				label="صورة الغلاف"
				accept={ACCEPTED_IMAGE_TYPES.join(',')}
				maxBytes={MAX_THUMBNAIL_BYTES}
				previewUrl={thumbnailPreview}
				onFileSelect={setThumbnailFile}
				hint="PNG أو JPG أو WEBP — حتى 5MB"
			/>

			<fieldset className="video-mode-fieldset">
				<legend>فيديو المشروع</legend>
				<div className="video-mode-toggle">
					<label>
						<input
							type="radio"
							name="videoMode"
							checked={videoMode === 'upload'}
							onChange={() => setVideoMode('upload')}
						/>
						رفع فيديو
					</label>
					<label>
						<input
							type="radio"
							name="videoMode"
							checked={videoMode === 'url'}
							onChange={() => setVideoMode('url')}
						/>
						رابط الفيديو
					</label>
				</div>
				{videoMode === 'upload' ? (
					<FileUploader
						label="ملف الفيديو"
						accept={`${ACCEPTED_VIDEO_TYPES.join(',')},.mp4,.webm,.mov`}
						maxBytes={MAX_VIDEO_BYTES}
						previewUrl={videoPreview}
						previewType="video"
						onFileSelect={setVideoFile}
						hint="MP4 أو WEBM (موصى به للمتصفح) — حتى 200MB. السحب والإفلات مدعوم."
					/>
				) : (
					<label className="form-field">
						<span className="form-label">رابط الفيديو</span>
						<input
							type="url"
							dir="ltr"
							className="form-input ltr-field"
							value={videoUrl}
							onChange={(ev) => setVideoUrl(ev.target.value)}
							placeholder="https:// — YouTube / Vimeo / Google Drive / MP4 مباشر"
						/>
						<span className="file-hint">
							أنواع المصدر: فيديو مرفوع، رابط مباشر (MP4/WebM)، YouTube، Vimeo، أو Google Drive. روابط Drive تُعرض بالمعاينة لأن رابط المشاركة ليس ملف فيديو مباشر.
						</span>
						{urlKind ? <span className="video-source-badge">المصدر المكتشف: {urlKind}</span> : null}
						{urlCheck && !urlCheck.ok ? (
							<span className="form-error" role="alert">
								{urlCheck.message}
							</span>
						) : null}
					</label>
				)}
			</fieldset>

			<label className="form-field">
				<span className="form-label">اسم المشروع</span>
				<input className="form-input" value={title} onChange={(ev) => setTitle(ev.target.value)} required />
			</label>

			<label className="form-field">
				<span className="form-label">وصف المشروع</span>
				<textarea
					className="form-textarea"
					value={description}
					onChange={(ev) => setDescription(ev.target.value)}
					rows={5}
					required
				/>
			</label>

			<label className="form-field">
				<span className="form-label">تاريخ المشروع (اختياري)</span>
				<input
					type="date"
					className="form-input ltr-field"
					dir="ltr"
					value={projectDate}
					onChange={(ev) => setProjectDate(ev.target.value)}
				/>
			</label>

			{error ? (
				<p className="form-error" role="alert">
					{error}
				</p>
			) : null}
			{success ? (
				<p className="form-success" role="status">
					{success}
				</p>
			) : null}

			<button type="submit" className="primary-btn" disabled={submitting}>
				{submitting ? 'جاري النشر...' : 'نشر المشروع'}
			</button>
		</form>
	);
}
