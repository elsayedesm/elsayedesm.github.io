import { useEffect, useState } from 'react';
import { resolveSignedMediaUrl } from '../lib/storage';
import { STORAGE_BUCKETS } from '../lib/supabase';

type BucketKey = keyof typeof STORAGE_BUCKETS;

interface MediaImageProps {
	src?: string | null;
	alt: string;
	className?: string;
	fallback?: string;
	storageBucket?: BucketKey;
}

export function MediaImage({
	src,
	alt,
	className,
	fallback = 'لا توجد صورة غلاف',
	storageBucket,
}: MediaImageProps) {
	const [currentSrc, setCurrentSrc] = useState(src ?? '');
	const [status, setStatus] = useState<'missing' | 'loading' | 'loaded' | 'failed'>(src ? 'loading' : 'missing');
	const [retried, setRetried] = useState(false);

	useEffect(() => {
		setCurrentSrc(src ?? '');
		setStatus(src ? 'loading' : 'missing');
		setRetried(false);
	}, [src]);

	if (status === 'missing' || !currentSrc) {
		return (
			<div className={`media-frame media-fallback ${className ?? ''}`} role="img" aria-label={fallback}>
				<span>{fallback}</span>
			</div>
		);
	}

	return (
		<div className={`media-frame ${className ?? ''}`}>
			{status === 'loading' ? <div className="media-skeleton" aria-hidden="true" /> : null}
			{status === 'failed' ? (
				<div className="media-fallback" role="img" aria-label="تعذر تحميل الصورة">
					<span>تعذر تحميل الصورة</span>
				</div>
			) : (
				<img
					src={currentSrc}
					alt={alt}
					loading="lazy"
					decoding="async"
					onLoad={() => setStatus('loaded')}
					onError={() => {
						if (!retried && storageBucket) {
							setRetried(true);
							void resolveSignedMediaUrl(src, storageBucket).then((signed) => {
								if (signed && signed !== currentSrc) {
									setCurrentSrc(signed);
									setStatus('loading');
								} else {
									setStatus('failed');
								}
							});
							return;
						}
						setStatus('failed');
					}}
					style={status === 'loading' ? { opacity: 0 } : undefined}
				/>
			)}
		</div>
	);
}
