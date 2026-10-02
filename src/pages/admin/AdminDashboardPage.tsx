import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState } from '../../components/LoadingState';
import { fetchProjectStats } from '../../lib/projectsApi';
import { fetchMessageStats } from '../../lib/messagesApi';
import type { ContactMessage, Project } from '../../types/project';

export function AdminDashboardPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [projectStats, setProjectStats] = useState<{ total: number; published: number; latest: Project | null }>({
		total: 0,
		published: 0,
		latest: null,
	});
	const [messageStats, setMessageStats] = useState<{ total: number; unread: number; latest: ContactMessage | null }>({
		total: 0,
		unread: 0,
		latest: null,
	});

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [projects, messages] = await Promise.all([fetchProjectStats(), fetchMessageStats()]);
				if (!cancelled) {
					setProjectStats(projects);
					setMessageStats(messages);
				}
			} catch {
				if (!cancelled) setError('تعذر تحميل الإحصائيات.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) return <LoadingState />;
	if (error) return <p className="form-error">{error}</p>;

	return (
		<div className="admin-page">
			<h1>لوحة التحكم</h1>
			<div className="admin-stats-grid">
				<article className="admin-stat-card">
					<h2>إجمالي المشاريع</h2>
					<p>{projectStats.total}</p>
				</article>
				<article className="admin-stat-card">
					<h2>المشاريع المنشورة</h2>
					<p>{projectStats.published}</p>
				</article>
				<article className="admin-stat-card">
					<h2>إجمالي الرسائل</h2>
					<p>{messageStats.total}</p>
				</article>
				<article className="admin-stat-card">
					<h2>رسائل غير مقروءة</h2>
					<p>{messageStats.unread}</p>
				</article>
			</div>

			<div className="admin-panels">
				<section className="glass-panel admin-panel">
					<h3>آخر مشروع</h3>
					{projectStats.latest ? (
						<p>{projectStats.latest.title}</p>
					) : (
						<p className="muted">لا توجد مشاريع بعد.</p>
					)}
				</section>
				<section className="glass-panel admin-panel">
					<h3>آخر رسالة</h3>
					{messageStats.latest ? (
						<p>
							{messageStats.latest.name} — {messageStats.latest.phone}
						</p>
					) : (
						<p className="muted">لا توجد رسائل بعد.</p>
					)}
				</section>
			</div>

			<div className="admin-quick-actions">
				<Link to="/admin/projects/new" className="primary-btn">
					إضافة مشروع
				</Link>
				<Link to="/admin/projects" className="ghost-btn">
					إدارة المشاريع
				</Link>
				<Link to="/admin/messages" className="ghost-btn">
					عرض الرسائل
				</Link>
			</div>
		</div>
	);
}
