export default function ModalContent(props) {
	return (
		<div className="relative h-full w-full overflow-hidden">
			{props.children}
		</div>
	);
}
