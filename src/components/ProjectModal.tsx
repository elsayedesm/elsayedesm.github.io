import { useEffect, useId, useRef } from 'react';
import type { Project } from '../types/project';
import { ProjectVideo } from './ProjectVideo';

interface ProjectModalProps {
	project: Project | null;
	onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
	const titleId = useId();
	const closeRef = useRef<HTMLButtonElement>(null);
	const open = Boolean(project);

	useEffect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeRef.current?.focus();

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener('keydown', onKey);
		};
	}, [open, onClose]);

	if (!project) return null;

	let dateLabel: string | null = null;
	if (project.project_date) {
		try {
			dateLabel = new Intl.DateTimeFormat('ar-EG', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}).format(new Date(project.project_date));
		} catch {
			dateLabel = project.project_date;
		}
	}

	return (
		<div className={`project-modal ${open ? 'is-open' : ''}`} role="presentation">
			<button type="button" className="project-modal-backdrop" aria-label="إغلاق" onClick={onClose} />
			<div className="project-modal-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
				<button ref={closeRef} type="button" className="project-modal-close" onClick={onClose} aria-label="إغلاق">
					×
				</button>
				<div className="project-modal-media">
					<ProjectVideo project={project} />
				</div>
				<div className="project-modal-body">
					<h2 id={titleId}>{project.title}</h2>
					{dateLabel ? <p className="project-modal-date">{dateLabel}</p> : null}
					<p>{project.description}</p>
				</div>
			</div>
		</div>
	);
}
