import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../../components/LoadingState';
import { ProjectForm } from '../../components/ProjectForm';
import { fetchProjectById } from '../../lib/projectsApi';
import type { Project } from '../../types/project';

export function AdminProjectEditPage() {
	const { id } = useParams();
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		let cancelled = false;
		(async () => {
			try {
				const data = await fetchProjectById(id);
				if (!cancelled) {
					if (!data) setError('المشروع غير موجود.');
					else setProject(data);
				}
			} catch {
				if (!cancelled) setError('تعذر تحميل المشروع.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id]);

	if (loading) return <LoadingState />;
	if (error) return <p className="form-error">{error}</p>;
	if (!project) return null;

	return (
		<div className="admin-page">
			<h1>تعديل المشروع</h1>
			<ProjectForm mode="edit" initial={project} />
		</div>
	);
}
