import { useEffect, useState } from 'react';
import type { Project } from '../types/project';
import { getGoogleDriveViewUrl, getProjectVideoSource, parseGoogleDriveFileId } from '../lib/video';
import { resolveSignedMediaUrl } from '../lib/storage';
import { MediaImage } from './MediaImage';

interface ProjectVideoProps {
	project: Project;
}

export function ProjectVideo({ project }: ProjectVideoProps) {
	const source = getProjectVideoSource(project.video_url, project.video_type);
	const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'paused' | 'failed'>('idle');
	const [playbackSrc, setPlaybackSrc] = useState(source.kind === 'video' ? source.src : '');
	const [retried, setRetried] = useState(false);

	useEffect(() => {
		setStatus('idle');
		setRetried(false);
		setPlaybackSrc(source.kind === 'video' ? source.src : '');
	}, [source.kind, source.src, project.id]);

	if (source.kind === 'none') {
		return (
			<div className="project-modal-no-video">
				<MediaImage src={project.thumbnail_url} alt={project.title} storageBucket="thumbnails" />
				<p className="media-status-text">{source.message}</p>
			</div>
		);
	}

	if (source.kind === 'iframe') {
		const driveId = source.provider === 'drive' && project.video_url ? parseGoogleDriveFileId(project.video_url) : null;
		return (
			<div className="project-video-frame">
				<iframe
					src={source.src}
					title={project.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
					allowFullScreen
					loading="lazy"
				/>
				{source.provider === 'drive' ? (
					<p className="media-status-text">
						{source.message}{' '}
						{driveId ? (
							<a href={getGoogleDriveViewUrl(driveId)} target="_blank" rel="noreferrer">
								فتح في Google Drive
							</a>
						) : null}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className={`project-video-player is-${status}`}>
			{status === 'loading' || status === 'idle' ? <div className="media-skeleton media-skeleton--video" /> : null}
			{status === 'failed' ? (
				<div className="media-fallback">
					<span>تعذر تشغيل الفيديو. تحقق من الملف أو الرابط.</span>
				</div>
			) : (
				<video
					controls
					playsInline
					preload="none"
					src={playbackSrc}
					poster={project.thumbnail_url || undefined}
					onLoadStart={() => setStatus('loading')}
					onLoadedData={() => setStatus('ready')}
					onPlaying={() => setStatus('ready')}
					onPause={() => setStatus('paused')}
					onError={() => {
						if (!retried && project.video_type === 'upload') {
							setRetried(true);
							void resolveSignedMediaUrl(project.video_url, 'videos').then((signed) => {
								if (signed && signed !== playbackSrc) {
									setPlaybackSrc(signed);
									setStatus('loading');
								} else {
									setStatus('failed');
								}
							});
							return;
						}
						setStatus('failed');
					}}
				/>
			)}
		</div>
	);
}
