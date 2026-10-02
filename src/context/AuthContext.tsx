import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: string | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}

		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});

		const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
		});

		return () => subscription.subscription.unsubscribe();
	}, []);

	const signIn = useCallback(async (email: string, password: string) => {
		if (!supabase) return { error: 'Supabase غير مهيأ. راجع ملف البيئة.' };
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		return { error: error?.message ?? null };
	}, []);

	const signOut = useCallback(async () => {
		if (supabase) await supabase.auth.signOut();
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user: session?.user ?? null,
			session,
			loading,
			signIn,
			signOut,
		}),
		[session, loading, signIn, signOut]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
