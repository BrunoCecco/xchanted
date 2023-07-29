import { useEffect, useState, useRef, useCallback } from "react";
import ModalHeader from "../modals/ModalHeader";
import ModalContent from "../modals/ModalContent";
import ModalService from "../modals/services/ModalService";
import AssetBrowseModal from "../modals/AssetBrowseModal";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";
import { BsFillPlusCircleFill } from "react-icons/bs";
import Modal from "./Modal";
import Icon from "../elements/Icon";
import Textarea from "../elements/Textarea";
import Input from "../elements/Input";
import { IoIosClose } from "react-icons/io";
import { MdCheck, MdSwapVert } from "react-icons/md";
import {
	SortableContainer,
	SortableElement,
	arrayMove,
} from "react-sortable-hoc";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../lib/user";

export default function TagsModal(props) {
	const { data, error, mutate } = useCurrentUser();
	const router = useRouter();
	const titleRef = useRef();
	const descRef = useRef();
	const [descValue, setDescValue] = useState(props.user?.bannerDescription);
	const [descEdited, setDescEdited] = useState(false);
	const [titleVal, setTitleVal] = useState(props.user?.bannerTitle);
	const [titleEdited, setTitleEdited] = useState(false);
	const [userTags, setUserTags] = useState(props.user?.tagged);
	const [editingTags, setEditingTags] = useToggleEditing();
	const [user, setUser] = useState(props.user);

	useEffect(() => {
		setUserTags(user?.tagged);
	}, [user?.tagged]);

	const open = (item) => {
		document
			.getElementsByTagName("html")[0]
			.setAttribute("style", "overflow-x: auto");
		router.push({
			pathname: "../asset/[id]",
			query: {
				id: item._id,
				username: JSON.stringify(user.username),
				ownerId: JSON.stringify(user._id),
			},
		});
	};

	const editDescription = useCallback(async () => {
		try {
			const formData = new FormData();
			formData.append("bannerDescription", descRef.current.value);
			formData.append("bannerTitle", titleRef.current.value);
			const res = await fetcher("/api/user", {
				method: "PATCH",
				body: formData,
			});
			mutate({ user: res.user }, false);
			toast.success("Banner updated");
			setDescEdited(false);
			setTitleEdited(false);
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	}, [mutate]);

	const addTags = () => {
		ModalService.open(AssetBrowseModal, {
			...props,
			heading: "Add tags to your banner!",
			modalSelectOne: false,
			selectingTags: true,
			onSave: updateTags,
		});
	};

	const updateTags = useCallback(
		async (newTags) => {
			try {
				const formData = new FormData();
				formData.append("tagged", JSON.stringify(newTags));
				const res = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				mutate({ user: res.user }, false);
				toast.success("TagsModal updated");
			} catch (err) {
				toast.error(err.message);
				console.error(err.message);
			}
		},
		[mutate]
	);

	const onTagSortEnd = ({ oldIndex, newIndex }) => {
		setUserTags(arrayMove(userTags, oldIndex, newIndex));
	};

	const SortableTagItem = SortableElement(({ item, sortIndex }) => (
		<>
			{item && (
				<div key={sortIndex} className="flex items-center w-full">
					<div className="flex items-center justify-start w-full shadow hover:shadow-lg duration-300 border-gray-200 transition-shadow rounded-2xl cursor-pointer gap-x-8">
						<div onClick={() => open(item)}>
							<div
								className="border-2 md:mx-auto md:w-[100px] md:h-[100px] rounded-2xl overflow-hidden bg-center bg-cover"
								style={{
									backgroundImage: `url(${item.metadata.image})`,
								}}
							></div>
						</div>
						<div className="basis-2/3 text-left line-clamp-2">
							{item.metadata?.name || item.name}
						</div>
					</div>
					{props.editing && !editingTags && (
						<Icon
							colour="red-500"
							onClick={() =>
								updateTags(
									userTags.filter((n) => n._id != item._id)
								)
							}
							size="4xl"
							icon={<IoIosClose />}
						/>
					)}
				</div>
			)}
		</>
	));

	const SortableTagList = SortableContainer(({ items }) => {
		return (
			<ul className="flex flex-wrap w-full gap-4 items-center justify-center mb-8">
				{items.map((item, index) => (
					<SortableTagItem
						key={`item-${index}`}
						index={index}
						sortIndex={index}
						item={item}
						disabled={!editingTags}
					/>
				))}
				{items.length === 0 && (
					<div className="text-center">
						<h1 className="text-xl">No tags to show here...</h1>
					</div>
				)}
			</ul>
		);
	});

	return (
		<Modal>
			<ModalHeader
				close={props.close}
				heading={
					!props.editing ? (
						<div className="text-2xl absolute left-[50%] translate-x-[-50%]">
							{titleVal || user.bannerTitle}
						</div>
					) : (
						<Input
							className="text-center text-2xl"
							placeholder="Title"
							value={titleVal}
							ref={titleRef}
							onChange={(e) => {
								setTitleVal(e.target.value);
								setTitleEdited(true);
							}}
							maxLength={30}
							onBlur={editDescription}
						/>
					)
				}
			></ModalHeader>
			<ModalContent>
				<div className="flex items-center justify-center h-full">
					<div className="flex flex-col basis-1/2 items-center h-full justify-start p-6 gap-4">
						{props.editing && (
							<div className="flex items-center justify-center gap-2 relative w-full">
								<h1 className="text-xl">Tagged NFTs</h1>
								<Icon
									colour="green-400"
									onClick={addTags}
									icon={<BsFillPlusCircleFill />}
								/>
								<Icon
									onClick={() => {
										if (editingTags) {
											updateTags(userTags);
										}
										setEditingTags();
									}}
									icon={
										editingTags ? (
											<MdCheck />
										) : (
											<MdSwapVert />
										)
									}
								/>
							</div>
						)}
						<div className="overflow-y-auto w-full mb-8">
							{userTags && (
								<SortableTagList
									items={userTags}
									onSortEnd={onTagSortEnd}
								/>
							)}
						</div>
						{!user.tagged && (
							<div className="text-center">No tagged NFTs</div>
						)}
					</div>
					<div className="flex flex-col gap-4 basis-1/2 items-center justify-start h-full w-full p-6">
						<h1 className="text-xl">Description</h1>
						{!props.editing ? (
							<div className="text-center">
								{descValue || user.bannerDescription}
							</div>
						) : (
							<Textarea
								rows={16}
								placeholder="Description..."
								value={descValue}
								ref={descRef}
								onChange={(e) => {
									setDescValue(e.target.value);
									setDescEdited(true);
								}}
								onBlur={editDescription}
							/>
						)}
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}

const useToggleEditing = (initialState = false) => {
	// Initialize the state
	const [selected, setSelected] = useState(initialState);

	// Define and memorize toggler function in case we pass down the component,
	// This function change the boolean value to its opposite value
	const toggle = useCallback(() => setSelected((selected) => !selected), []);

	return [selected, toggle];
};
