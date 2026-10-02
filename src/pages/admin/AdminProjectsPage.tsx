import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { MediaImage } from '../../components/MediaImage';
import { LoadingState } from '../../components/LoadingState';
import { deleteProject, fetchAllProjectsAdmin } from '../../lib/projectsApi';
import { removeStorageFile } from '../../lib/storage';
import type { Project } from '../../types/project';

export function AdminProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			setProjects(await fetchAllProjectsAdmin());
		} catch {
			setError('تعذر تحميل المشاريع.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const onDelete = async (project: Project) => {
		setDeletingId(project.id);
		setFeedback(null);
		try {
			await deleteProject(project.id);
			await removeStorageFile('thumbnails', project.thumbnail_url);
			if (project.video_type === 'upload') await removeStorageFile('videos', project.video_url);
			setProjects((prev) => prev.filter((p) => p.id !== project.id));
			setFeedback('تم حذف المشروع.');
		} catch {
			setFeedback('تعذر حذف المشروع.');
		} finally {
			setDeletingId(null);
			setConfirmId(null);
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-head">
				<h1>المشاريع</h1>
				<Link to="/admin/projects/new" className="primary-btn">
					مشروع جديد
				</Link>
			</div>
			{loading ? <LoadingState /> : null}
			{error ? <p className="form-error">{error}</p> : null}
			{feedback ? <p className="form-success">{feedback}</p> : null}
			{!loading && !projects.length ? <EmptyState message="لا توجد مشاريع بعد." /> : null}

			<div className="admin-project-list">
				{projects.map((project) => (
					<article key={project.id} className="admin-project-row glass-panel">
						<div className="admin-thumb">
							<MediaImage src={project.thumbnail_url} alt={project.title} storageBucket="thumbnails" />
						</div>
						<div>
							<h2>{project.title}</h2>
							<p className="muted">{project.project_date ?? 'بدون تاريخ'}</p>
						</div>
						<div className="admin-row-actions">
							<Link to={`/admin/projects/${project.id}/edit`} className="ghost-btn">
								تعديل
							</Link>
							<button type="button" className="danger-btn" onClick={() => setConfirmId(project.id)}>
								حذف
							</button>
						</div>
						{confirmId === project.id ? (
							<div className="confirm-dialog" role="dialog" aria-modal="true">
								<p>Are you sure you want to delete this project?</p>
								<div className="confirm-actions">
									<button type="button" className="ghost-btn" onClick={() => setConfirmId(null)}>
										إلغاء
									</button>
									<button
										type="button"
										className="danger-btn"
										disabled={deletingId === project.id}
										onClick={() => void onDelete(project)}
									>
										{deletingId === project.id ? 'جاري الحذف...' : 'تأكيد الحذف'}
									</button>
								</div>
							</div>
						) : null}
					</article>
				))}
			</div>
		</div>
	);
}
