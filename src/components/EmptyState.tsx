export function EmptyState({ message }: { message: string }) {
	return (
		<div className="state-panel state-panel--empty" role="status">
			<p>{message}</p>
		</div>
	);
}
