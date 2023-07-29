import styles from "../../styles/Modal.module.css";

export default function Modal(props) {
	return (
		<div className={props.className ? props.className : styles.modal}>
			{props.children}
		</div>
	);
}
