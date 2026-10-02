import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { fileWithInferredType, inferMimeType } from '../lib/storage';

interface FileUploaderProps {
	label: string;
	accept: string;
	maxBytes: number;
	previewUrl?: string | null;
	previewType?: 'image' | 'video';
	onFileSelect: (file: File | null) => void;
	hint?: ReactNode;
}

function fileMatchesAccept(file: File, accept: string): boolean {
	const tokens = accept.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean);
	if (!tokens.length) return true;
	const mime = inferMimeType(file).toLowerCase();
	const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
	return tokens.some((token) => {
		if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1));
		if (token.startsWith('.')) return ext === token;
		return mime === token;
	});
}

export function FileUploader({
	label,
	accept,
	maxBytes,
	previewUrl,
	previewType = 'image',
	onFileSelect,
	hint,
}: FileUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validate = (file: File) => {
		if (file.size > maxBytes) {
			setError('حجم الملف أكبر من الحد المسموح.');
			return false;
		}
		if (!fileMatchesAccept(file, accept)) {
			setError(previewType === 'video' ? 'صيغة الفيديو غير مدعومة. استخدم MP4 أو WEBM.' : 'صيغة الصورة غير مدعومة.');
			return false;
		}
		setError(null);
		return true;
	};

	const handleFile = (file: File | null) => {
		if (!file) {
			onFileSelect(null);
			return;
		}
		if (!validate(file)) return;
		onFileSelect(fileWithInferredType(file));
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) handleFile(file);
	};

	return (
		<div className="file-uploader">
			<p className="form-label">{label}</p>
			<div
				className={`file-drop ${dragOver ? 'is-dragover' : ''}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={onDrop}
				onClick={() => inputRef.current?.click()}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
				role="button"
				tabIndex={0}
			>
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					className="visually-hidden"
					onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
				/>
				<p>اسحب الملف هنا أو انقر للرفع</p>
				{hint ? <span className="file-hint">{hint}</span> : null}
			</div>
			{previewUrl ? (
				<div className="file-preview">
					{previewType === 'video' ? (
						<video src={previewUrl} controls playsInline preload="metadata" />
					) : (
						<img src={previewUrl} alt="" />
					)}
					<button
						type="button"
						className="ghost-btn"
						onClick={(e) => {
							e.stopPropagation();
							onFileSelect(null);
							if (inputRef.current) inputRef.current.value = '';
						}}
					>
						إزالة
					</button>
				</div>
			) : null}
			{error ? <p className="form-error">{error}</p> : null}
		</div>
	);
}
