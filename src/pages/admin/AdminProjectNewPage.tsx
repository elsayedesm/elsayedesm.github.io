import { ProjectForm } from '../../components/ProjectForm';

export function AdminProjectNewPage() {
	return (
		<div className="admin-page">
			<h1>إضافة مشروع جديد</h1>
			<ProjectForm mode="create" />
		</div>
	);
}
