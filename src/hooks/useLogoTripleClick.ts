import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TRIPLE_CLICK_MS = 900;

export function useLogoTripleClick() {
	const navigate = useNavigate();
	const clicksRef = useRef(0);
	const timerRef = useRef<number | null>(null);

	return useCallback(() => {
		clicksRef.current += 1;
		if (timerRef.current) window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(() => {
			clicksRef.current = 0;
		}, TRIPLE_CLICK_MS);

		if (clicksRef.current >= 3) {
			clicksRef.current = 0;
			if (timerRef.current) window.clearTimeout(timerRef.current);
			navigate('/admin/login');
		}
	}, [navigate]);
}
