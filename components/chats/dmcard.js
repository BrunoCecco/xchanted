// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { fetcher } from "../../lib/fetch";
// import { useRouter } from "next/router";
// import NftImage from "../../components/nft/NftImage";

// export default function DmCard({
//   convoObj,
//   id,
//   badges,
//   status,
//   isCurrConvo,
//   currUser,
// }) {
//   const router = useRouter();
//   const [chatProperties, setChatProperties] = useState([]);
//   const [profilePic, setProfilePic] = useState(null);
//   const [name, setName] = useState("");

//   useEffect(() => {
//     console.log("convo obj", convoObj);
//     const fetchChatProperties = async () => {
//       if (convoObj.users.length == 2) {
//         //then this is a dm
//         console.log(convoObj.users);
//         console.log(
//           "user talking to",
//           convoObj.users.filter((id) => id != currUser._id)[0]
//         );
//         const response = await fetcher(
//           `/api/users/${
//             convoObj.users.filter((id) => id != currUser._id)[0]
//               ? convoObj.users.filter((id) => id != currUser._id)[0]
//               : currUser._id
//           }`
//         );
//         setProfilePic(response.user?.profilePicture?.data?.metadata);
//         setName(response.user?.username);
//       } else {
//         //some other chat
//         setName(convoObj.name);
//         setProfilePic(convoObj.image);
//       }
//     };
//     fetchChatProperties();
//   }, [convoObj]);

//   return (
//     <div
//       className={`rounded-xl w-full flex items-center justify-center gap-1 p-2 cursor-pointer ${
//         isCurrConvo ? "bg-gray-300" : ""
//       }`}
//       onClick={() => {
//         console.log("id of chat:", id);
//         router.push(`/chats/${id}`);
//       }}
//     >
//       <div className="basis-1/4 h-10 w-10 rounded-xl">
//         <NftImage
//           metadata={profilePic}
//           classname="w-full h-full bg-center bg-cover rounded-md"
//         />
//       </div>
//       <div className={`basis-3/4 flex flex-col items-start w-full`}>
//         <p>{name}</p>
//         <div className="flex flex-row justify-around w-full">
//           <p className="text-xs line-clamp-1 w-full">
//             {convoObj.latestMessage}
//           </p>
//           <div className="bg-blue-500 rounded-full w-2 h-2"></div>
//         </div>
//       </div>
//     </div>
//   );
// }
