import type { ContactMessage } from '../types/project';
import { supabase } from './supabase';

function mapMessage(row: Record<string, unknown>): ContactMessage {
	return row as unknown as ContactMessage;
}

export async function submitContactMessage(input: {
	name: string;
	phone: string;
	message: string;
}): Promise<void> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { error } = await supabase.from('contact_messages').insert(input);
	if (error) throw error;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('contact_messages')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []).map(mapMessage);
}

export async function markMessageRead(id: string, isRead: boolean): Promise<void> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
	if (error) throw error;
}

export async function deleteContactMessage(id: string): Promise<void> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { error } = await supabase.from('contact_messages').delete().eq('id', id);
	if (error) throw error;
}

export async function fetchMessageStats(): Promise<{ total: number; unread: number; latest: ContactMessage | null }> {
	if (!supabase) return { total: 0, unread: 0, latest: null };
	const { data, error } = await supabase
		.from('contact_messages')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	const messages = (data ?? []).map(mapMessage);
	return {
		total: messages.length,
		unread: messages.filter((m) => !m.is_read).length,
		latest: messages[0] ?? null,
	};
}
