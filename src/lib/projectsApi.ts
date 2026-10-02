import type { Project, VideoType } from '../types/project';
import { hydrateProjectMedia } from './storage';
import { supabase } from './supabase';

function mapProject(row: Record<string, unknown>): Project {
	return row as unknown as Project;
}

export async function fetchPublishedProjects(): Promise<Project[]> {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('is_published', true)
		.order('project_date', { ascending: false, nullsFirst: false })
		.order('created_at', { ascending: false });
	if (error) throw error;
	return hydrateProjectMedia((data ?? []).map(mapProject));
}

export async function fetchAllProjectsAdmin(): Promise<Project[]> {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return hydrateProjectMedia((data ?? []).map(mapProject));
}

export async function fetchProjectById(id: string): Promise<Project | null> {
	if (!supabase) return null;
	const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
	if (error) throw error;
	if (!data) return null;
	const [hydrated] = await hydrateProjectMedia([mapProject(data)]);
	return hydrated;
}

export interface ProjectInput {
	title: string;
	description: string;
	thumbnail_url: string;
	video_url: string | null;
	video_type: VideoType;
	project_date: string | null;
	is_published?: boolean;
}

export async function createProject(input: ProjectInput): Promise<Project> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { data, error } = await supabase.from('projects').insert(input).select('*').single();
	if (error) throw error;
	return mapProject(data);
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { data, error } = await supabase.from('projects').update(input).eq('id', id).select('*').single();
	if (error) throw error;
	return mapProject(data);
}

export async function deleteProject(id: string): Promise<void> {
	if (!supabase) throw new Error('Supabase is not configured.');
	const { error } = await supabase.from('projects').delete().eq('id', id);
	if (error) throw error;
}

export async function fetchProjectStats(): Promise<{
	total: number;
	published: number;
	latest: Project | null;
}> {
	if (!supabase) return { total: 0, published: 0, latest: null };
	const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
	if (error) throw error;
	const projects = (data ?? []).map(mapProject);
	return {
		total: projects.length,
		published: projects.filter((p) => p.is_published).length,
		latest: projects[0] ?? null,
	};
}
