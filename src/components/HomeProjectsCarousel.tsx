import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project } from '../types/project';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from './EmptyState';

function getPageSize(width: number) {
	if (width < 700) return 1;
	if (width < 1024) return 2;
	return 3;
}

interface HomeProjectsCarouselProps {
	projects: Project[];
	onProjectClick?: (project: Project) => void;
}

export function HomeProjectsCarousel({ projects, onProjectClick }: HomeProjectsCarouselProps) {
	const limited = useMemo(() => projects.slice(0, 6), [projects]);
	const [pageSize, setPageSize] = useState(3);
	const pageCount = Math.max(1, Math.ceil(limited.length / pageSize));
	const [activePage, setActivePage] = useState(0);
	const [isChanging, setIsChanging] = useState(false);

	useEffect(() => {
		const update = () => setPageSize(getPageSize(window.innerWidth));
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, []);

	const visible = useMemo(() => {
		const start = activePage * pageSize;
		return limited.slice(start, start + pageSize);
	}, [activePage, limited, pageSize]);

	const goToPage = useCallback(
		(page: number) => {
			const next = Math.max(0, Math.min(page, pageCount - 1));
			if (next === activePage) return;
			setIsChanging(true);
			window.setTimeout(() => {
				setActivePage(next);
				setIsChanging(false);
			}, 180);
		},
		[activePage, pageCount]
	);

	useEffect(() => {
		if (activePage > pageCount - 1) setActivePage(0);
	}, [activePage, pageCount]);

	if (!limited.length) {
		return <EmptyState message="لا توجد مشاريع لعرضها حاليًا." />;
	}

	return (
		<div className={`latest-carousel ${isChanging ? 'is-changing' : ''}`} aria-roledescription="carousel" aria-label="أحدث المشاريع">
			<div className="latest-works">
				<div className="projects-grid home-projects-grid" aria-live="polite">
					{visible.map((project) => (
						<ProjectCard key={project.id} project={project} onClick={onProjectClick ? () => onProjectClick(project) : undefined} />
					))}
				</div>
			</div>
			<div className="carousel-controls" dir="ltr">
				<button
					type="button"
					className="carousel-button carousel-previous"
					aria-label="المشروع السابق"
					disabled={activePage === 0}
					onClick={() => goToPage(activePage - 1)}
				>
					<span aria-hidden="true">&#8592;</span>
				</button>
				<div className="carousel-dots" aria-label="صفحات المشاريع" hidden={pageCount <= 1}>
					{Array.from({ length: pageCount }, (_, page) => (
						<button
							key={page}
							type="button"
							className={`carousel-dot ${page === activePage ? 'is-active' : ''}`}
							aria-label={`الصفحة ${page + 1}`}
							aria-current={page === activePage}
							onClick={() => goToPage(page)}
						/>
					))}
				</div>
				<button
					type="button"
					className="carousel-button carousel-next"
					aria-label="المشروع التالي"
					disabled={activePage >= pageCount - 1}
					onClick={() => goToPage(activePage + 1)}
				>
					<span aria-hidden="true">&#8594;</span>
				</button>
			</div>
		</div>
	);
}
