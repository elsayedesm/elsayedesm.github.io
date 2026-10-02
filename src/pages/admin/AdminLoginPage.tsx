import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export function AdminLoginPage() {
	const { signIn, user, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from ?? '/admin';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	if (!loading && user) return <Navigate to="/admin" replace />;

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		if (!isSupabaseConfigured) {
			setError('Supabase غير مهيأ.');
			return;
		}
		setSubmitting(true);
		const result = await signIn(email.trim(), password);
		setSubmitting(false);
		if (result.error) {
			setError(result.error);
			return;
		}
		navigate(from, { replace: true });
	};

	return (
		<div className="admin-login-page">
			<div className="admin-login-card glass-panel">
				<img src="/assets/logo.png" alt="Render Room" width={90} />
				<h1>تسجيل دخول الإدارة</h1>
				<form onSubmit={onSubmit} className="contact-form">
					<label className="form-field">
						<span className="form-label">البريد الإلكتروني</span>
						<input
							type="email"
							dir="ltr"
							className="form-input ltr-field"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</label>
					<label className="form-field">
						<span className="form-label">كلمة المرور</span>
						<input
							type="password"
							dir="ltr"
							className="form-input ltr-field"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</label>
					{error ? <p className="form-error" role="alert">{error}</p> : null}
					<button type="submit" className="primary-btn" disabled={submitting}>
						{submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
					</button>
				</form>
			</div>
		</div>
	);
}
