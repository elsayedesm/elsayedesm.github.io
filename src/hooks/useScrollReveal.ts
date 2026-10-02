import { useEffect } from 'react';

export function useScrollReveal(selector: string, deps: unknown[] = []) {
	useEffect(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const elements = document.querySelectorAll(selector);
		if (!elements.length) return;

		if (prefersReducedMotion || !('IntersectionObserver' in window)) {
			elements.forEach((el) => el.classList.add('is-visible'));
			return;
		}

		elements.forEach((el) => el.classList.add('scroll-reveal'));

		const observer = new IntersectionObserver(
			(entries, obs) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('is-visible');
					obs.unobserve(entry.target);
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}
