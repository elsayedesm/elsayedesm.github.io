import { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchPublishedProjects } from '../lib/projectsApi';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Project } from '../types/project';

export function WorksPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<Project | null>(null);

	useScrollReveal('.page-hero, .works-grid');

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!isSupabaseConfigured) {
				setError('لم يتم إعداد Supabase بعد. ستظهر المشاريع بعد ربط قاعدة البيانات.');
				setLoading(false);
				return;
			}
			try {
				const data = await fetchPublishedProjects();
				if (!cancelled) setProjects(data);
			} catch {
				if (!cancelled) setError('تعذر تحميل المشاريع.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="works-page">
			<section className="page-hero page-section">
				<p className="eyebrow">أعمالي</p>
				<h1>مشاريع مختارة</h1>
				<p>اضغط على أي مشروع لمشاهدة التفاصيل والفيديو.</p>
			</section>

			<section className="page-section">
				{loading ? <LoadingState /> : null}
				{error ? <p className="inline-notice" role="alert">{error}</p> : null}
				{!loading && !projects.length && !error ? <EmptyState message="لا توجد مشاريع منشورة بعد." /> : null}
				{projects.length ? (
					<div className="projects-grid works-grid">
						{projects.map((project) => (
							<ProjectCard key={project.id} project={project} onClick={() => setSelected(project)} />
						))}
					</div>
				) : null}
			</section>

			<ProjectModal project={selected} onClose={() => setSelected(null)} />
		</div>
	);
}
