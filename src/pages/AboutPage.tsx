import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const skills = [
	'Video Editing',
	'Short-Form Content',
	'Podcast Editing',
	'Social Media Content',
	'Storytelling & Pacing',
	'Audio Design and Sound Effects',
	'Color Grading and Correction',
	'Translation and Subtitling',
	'Exporting in Multiple Qualities for Platforms',
];

const tools = ['Adobe Premiere Pro', 'CapCut', 'Google Flows', 'Adobe Podcast', 'Media Encoder'];

const workflow = [
	{ title: '1. فهم المشروع', text: 'نحدد الهدف، الجمهور، ونبرة المحتوى قبل أي لقطة.' },
	{ title: '2. تجميع المواد', text: 'استلام اللقطات والملفات الصوتية وترتيبها في هيكل واضح.' },
	{ title: '3. المونتاج الأولي', text: 'بناء السرد، اختيار اللقطات، وضبط الإيقاع.' },
	{ title: '4. المونتاج النهائي', text: 'إكمال المونتاج وتحسين الجودة.' },
	{ title: '5. المراجعة', text: 'جولة أو أكثر من التعديلات حتى الوصول للنسخة النهائية.' },
	{ title: '6. التسليم', text: 'تصدير بجودة مناسبة للمنصة المطلوبة في الموعد المتفق عليه.' },
];

export function AboutPage() {
	useScrollReveal('.page-hero, .about-block, .about-cta');

	return (
		<div className="about-page">
			<section className="page-hero about-hero page-section">
				<p className="eyebrow">من أنا</p>
				<h1>مونتير يركز على القصة قبل المؤثرات</h1>
				<p>
					أنا السيد أنور، مونتير فيديو أعمل مع صناع المحتوى والعلامات التجارية لتحويل اللقطات الخام إلى
					محتوى واضح، مؤثر، وجاهز للنشر — بلمسة عصرية تحترم هوية العميل.
				</p>
			</section>

			<section className="about-block page-section glass-panel">
				<h2>نبذة عني</h2>
				<p>
					أؤمن أن المونتاج ليس مجرد قص ولصق، بل بناء تجربة مشاهدة: إيقاع، صمت، موسيقى، وانتقالات
					مدروسة. أعمل على مشاريع متنوعة من الريلز السريعة إلى الإعلانات والمحتوى الطويل، مع الالتزام
					بالمواعيد والتواصل الواضح طوال المشروع.
				</p>
			</section>

			<section className="about-block page-section glass-panel">
				<h2>أسلوب المونتاج</h2>
				<p>
					أبدأ دائمًا من رسالة الفيديو: ماذا نريد أن يشعر المشاهد؟ من هناك أختار الإيقاع، زاوية
					القص، ومعالجة الصوت. الهدف محتوى نظيف، احترافي، وقابل للمشاركة — بدون حشو بصري.
				</p>
			</section>

			<section className="about-block page-section">
				<h2>المهارات</h2>
				<ul className="tag-list">
					{skills.map((skill) => (
						<li key={skill}>{skill}</li>
					))}
				</ul>
			</section>

			<section className="about-block page-section">
				<h2>البرامج والأدوات</h2>
				<ul className="tag-list tag-list--ltr">
					{tools.map((tool) => (
						<li key={tool}>{tool}</li>
					))}
				</ul>
			</section>

			<section className="about-block page-section">
				<h2>آلية العمل</h2>
				<ol className="workflow-list">
					{workflow.map((step) => (
						<li key={step.title}>
							<h3>{step.title}</h3>
							<p>{step.text}</p>
						</li>
					))}
				</ol>
			</section>

			<section className="about-cta page-section">
				<h2>جاهز لمشروعك القادم؟</h2>
				<p>أرسل تفاصيل مشروعك وسأرد عليك في أقرب وقت.</p>
				<Link to="/contact" className="con-btn">
					تواصل معي
				</Link>
			</section>
		</div>
	);
}
