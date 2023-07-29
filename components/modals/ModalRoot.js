import { useState, useEffect, useRef } from "react";
import ModalService from "./services/ModalService";
import styles from "../../styles/Modal.module.css";

export default function ModalRoot() {
	const [modal, setModal] = useState({});
	const modalRef = useRef(null);

	function setBGFixed() {
		document
			.getElementsByTagName("html")[0]
			.setAttribute("style", "overflow: hidden");
	}

	function setBGScroll() {
		document
			.getElementsByTagName("html")[0]
			.setAttribute("style", "overflow-y: scroll");
	}

	const handleClose = () => {
		setModal({});
		setBGScroll();
	};

	const handleCloseOutsideModal = (e) => {
		let modal = modalRef.current.getBoundingClientRect();
		let cY = e.clientY;
		let cX = e.clientX;
		// close modal if user clicks off it
		if (
			cX < modal.left ||
			cX > modal.right ||
			cY > modal.bottom ||
			cY < modal.top
		) {
			setBGScroll();
			setModal({});
		}
	};

	/*
	 * useEffect will run when the component renders, which might be more times than you think.
	 * 2nd arg = If present, effect will only activate if the values in the list change.
	 */
	useEffect(() => {
		ModalService.on("open", ({ component, props }) => {
			setModal({
				component,
				props,
				close: (value) => {
					handleClose();
				},
			});
			setBGFixed();
		});
		// when modal service receives new props for the modal, update the modal
		ModalService.on("update", ({ props }) => {
			setModal((prevModal) => ({
				component: prevModal.component,
				props: { ...prevModal.props, ...props },
				close: prevModal.close,
			}));
		});
	}, []);

	useEffect(() => {
		if (!modal.component) {
			setBGScroll();
		} else {
			setBGFixed();
		}
	});

	const ModalComponent = modal.component ? modal.component : null;

	return (
		<section
			className={modal.component ? styles.overlay : ""}
			onClick={handleCloseOutsideModal}
		>
			{ModalComponent && (
				<div ref={modalRef}>
					<ModalComponent {...modal.props} close={modal.close} />
				</div>
			)}
		</section>
	);
}
