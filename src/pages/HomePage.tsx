import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContactSection } from '../components/ContactSection';
import { HomeProjectsCarousel } from '../components/HomeProjectsCarousel';
import { LoadingState } from '../components/LoadingState';
import { ProjectModal } from '../components/ProjectModal';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchPublishedProjects } from '../lib/projectsApi';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Project } from '../types/project';

const demoProjects: Project[] = Array.from({ length: 6 }, (_, i) => ({
	id: `demo-${i + 1}`,
	title: `نموذج من أعمالي ${i + 1}`,
	description: '',
	thumbnail_url: '/assets/project.png',
	video_url: null,
	video_type: 'url',
	project_date: null,
	is_published: true,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
}));

export function HomePage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<Project | null>(null);

	useScrollReveal('.hero-content, .hero-actions, .hero-divider, .hero-about-copy, .service, .latest, .home-contact, footer', [
		loading,
	]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!isSupabaseConfigured) {
				setProjects(demoProjects);
				setLoading(false);
				return;
			}
			try {
				const data = await fetchPublishedProjects();
				if (!cancelled) setProjects(data.length ? data : demoProjects);
			} catch {
				if (!cancelled) {
					setError('تعذر تحميل المشاريع.');
					setProjects(demoProjects);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<section className="hero page-section">
				<div className="hero-content">
					<h1>مونتاج احترافي يخلي قصتك تتحكي</h1>
					<p>
						أنا السيد أنور، مونتير أساعدك في تحويل لقطاتك إلى محتوى مؤثر وجذاب لتحقيق اهدافك، سواء كنت
						صانع محتوى أو شركة أو علامة تجارية.
					</p>
				</div>
				<div className="hero-actions">
					<Link to="/contact" className="con-btn">
						تواصل معي
					</Link>
					<Link to="/works" className="pro-btn">
						شاهد أعمالي
					</Link>
				</div>
			</section>

			<div className="hero-divider">
				<hr />
			</div>

			<section className="hero2 page-section">
				<div className="hero-about">
					<div className="hero-about-copy">
						<p>خدماتي</p>
						<h1>ماذا أقدم؟</h1>
						<p>
							أقدم لك خدمات مونتاج احترافية بمختلف انواعه.
							<br />
							مع التركيز على جودة الصورة والصوت والتسليم في الموعد المحدد.
						</p>
					</div>
					<div className="services">
						<div className="service">
							<img src="/assets/icon1.png" alt="" />
							<h3>مونتاج الفيديو</h3>
							<p>تحويل لقطاتك إلى محتوى جذاب واحترافي.</p>
						</div>
						<div className="service">
							<img src="/assets/icon3.png" alt="" />
							<h3>مونتاج الريلز</h3>
							<p>تحويل لقطاتك إلى ريلز جذابة تزيد من التفاعل والمتابعين.</p>
						</div>
						<div className="service">
							<img src="/assets/icon2.png" alt="" />
							<h3>مونتاج الإعلانات</h3>
							<p>تحويل لقطاتك إلى إعلانات مؤثرة تجذب العملاء.</p>
						</div>
					</div>
				</div>
			</section>

			<div className="hero-divider">
				<hr />
			</div>

			<section className="latest page-section">
				<div className="latest-copy">
					<h3>أحدث المشاريع</h3>
					<h1>بعض من أعمالي الأخيرة</h1>
					<p>القي نظرة على أحدث أعمالى و للمزيد من الاعمال اضغط على المزيد من الاعمال.</p>
					{error ? <p className="inline-notice">{error}</p> : null}
					<div className="latest-actions">
						<Link to="/works" className="pro-btn">
							المزيد من الأعمال
						</Link>
					</div>
				</div>
				{loading ? <LoadingState /> : <HomeProjectsCarousel projects={projects} onProjectClick={setSelected} />}
			</section>

			<div className="hero-divider">
				<hr />
			</div>

			<section className="home-contact">
				<ContactSection variant="home" />
			</section>

			<ProjectModal project={selected} onClose={() => setSelected(null)} />
		</>
	);
}
