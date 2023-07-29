import Icon from "../elements/Icon";
import Button from "../elements/Button";
import { IoIosClose } from "react-icons/io";

export default function ModalHeader(props) {
	return (
		<div className="flex flex-col gap-4 bg-white z-50 rounded-2xl w-full p-6">
			<div className="w-full flex items-center justify-between">
				<div className="text-2xl font-poppins">{props.heading}</div>
				<div className="flex items-center justify-center rounded-full border border-gray-300">
					<Icon
						onClick={props.close}
						icon={<IoIosClose />}
						size="4xl"
					/>
				</div>
			</div>
			{props.children}
		</div>
	);
}
