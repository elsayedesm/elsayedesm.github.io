export function LoadingState({ label = 'جاري التحميل...' }: { label?: string }) {
	return (
		<div className="state-panel" role="status" aria-live="polite">
			<div className="state-spinner" aria-hidden="true" />
			<p>{label}</p>
		</div>
	);
}
