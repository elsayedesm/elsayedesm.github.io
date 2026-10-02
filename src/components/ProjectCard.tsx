import type { Project } from '../types/project';
import { MediaImage } from './MediaImage';

interface ProjectCardProps {
	project: Project;
	onClick?: () => void;
}

function formatDate(date: string | null) {
	if (!date) return null;
	try {
		return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(
			new Date(date)
		);
	} catch {
		return date;
	}
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
	const dateLabel = formatDate(project.project_date);

	return (
		<article
			className="project-card project-card--interactive"
			data-project-id={project.id}
			onClick={onClick}
			onKeyDown={(e) => {
				if (onClick && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					onClick();
				}
			}}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			<MediaImage src={project.thumbnail_url} alt={project.title} storageBucket="thumbnails" />
			<div className="project-card-content">
				<h2>{project.title}</h2>
				{project.description ? <p>{project.description}</p> : null}
				{dateLabel ? (
					<time className="project-card-date" dateTime={project.project_date ?? undefined}>
						{dateLabel}
					</time>
				) : null}
			</div>
		</article>
	);
}
