import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import {
	deleteContactMessage,
	fetchContactMessages,
	markMessageRead,
} from '../../lib/messagesApi';
import type { ContactMessage } from '../../types/project';

export function AdminMessagesPage() {
	const [messages, setMessages] = useState<ContactMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState<ContactMessage | null>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			setMessages(await fetchContactMessages());
		} catch {
			setError('تعذر تحميل الرسائل.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return messages;
		return messages.filter(
			(m) =>
				m.name.toLowerCase().includes(q) ||
				m.phone.includes(q) ||
				m.message.toLowerCase().includes(q)
		);
	}, [messages, query]);

	const openMessage = async (message: ContactMessage) => {
		setSelected(message);
		if (!message.is_read) {
			try {
				await markMessageRead(message.id, true);
				setMessages((prev) =>
					prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
				);
			} catch {
				// non-blocking
			}
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteContactMessage(id);
			setMessages((prev) => prev.filter((m) => m.id !== id));
			if (selected?.id === id) setSelected(null);
		} catch {
			setError('تعذر حذف الرسالة.');
		}
	};

	return (
		<div className="admin-page">
			<h1>الرسائل</h1>
			<input
				className="form-input admin-search"
				placeholder="بحث بالاسم أو الهاتف..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			{loading ? <LoadingState /> : null}
			{error ? <p className="form-error">{error}</p> : null}
			{!loading && !filtered.length ? <EmptyState message="No messages yet." /> : null}

			<div className="admin-messages-layout">
				<ul className="admin-message-list">
					{filtered.map((message) => (
						<li key={message.id}>
							<button
								type="button"
								className={`admin-message-item ${message.is_read ? 'is-read' : 'is-unread'} ${
									selected?.id === message.id ? 'is-active' : ''
								}`}
								onClick={() => void openMessage(message)}
							>
								<strong>{message.name}</strong>
								<span dir="ltr">{message.phone}</span>
								<time dateTime={message.created_at}>
									{new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(
										new Date(message.created_at)
									)}
								</time>
							</button>
						</li>
					))}
				</ul>

				<section className="glass-panel admin-message-detail">
					{selected ? (
						<>
							<h2>{selected.name}</h2>
							<p dir="ltr">{selected.phone}</p>
							<p>{selected.message || '—'}</p>
							<div className="admin-row-actions">
								<button
									type="button"
									className="ghost-btn"
									onClick={() =>
										void markMessageRead(selected.id, !selected.is_read).then(() => {
											setMessages((prev) =>
												prev.map((m) =>
													m.id === selected.id ? { ...m, is_read: !selected.is_read } : m
												)
											);
											setSelected({ ...selected, is_read: !selected.is_read });
										})
									}
								>
									{selected.is_read ? 'تعليم كغير مقروء' : 'تعليم كمقروء'}
								</button>
								<button type="button" className="danger-btn" onClick={() => void onDelete(selected.id)}>
									حذف
								</button>
							</div>
						</>
					) : (
						<p className="muted">اختر رسالة لعرض التفاصيل.</p>
					)}
				</section>
			</div>
		</div>
	);
}
