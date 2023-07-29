// import React, { useEffect, useState, useRef } from "react";
// import Image from "next/image";
// import { AiFillPlusCircle } from "react-icons/ai";
// import { fetcher } from "../../lib/fetch";
// import { v4 as uuidv4 } from "uuid";
// import anon from "../../public/faketests/anon.webp";

// const StartConvo = ({ friendName }) => {
//   const collectionArr = [...Array(3)];
//   return (
//     <div className="p-3 flex pb-[100px] pt-[30px] justify-center h-64 items-center border-b-2">
//       <div className=" w-full flex flex-col items-center mt-[1rem] p-2">
//         <div className="border-2 rounded-xl h-[125px] w-[125px] flex items-center justify-center text-center object-contain">
//           Profile image
//         </div>
//         <p>This is the start of your conversation with ${friendName}!</p>
//         <div className="flex">
//           <p>Same communities: </p>
//           <div className="flex flex-row px-3 items-center">
//             {collectionArr.map((dot, index) => (
//               <div
//                 key={index}
//                 className="bg-pink-500 h-[20px] w-[20px] mx-1 rounded-full object-contain flex items-center"
//               ></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Message = ({ msg, setMsg, sendChat }) => {
//   return (
//     <form
//       className="w-full shrink fixed bottom-5"
//       onSubmit={(e) => sendChat(e)}
//     >
//       <div className="flex items-center justify-between gap-2 w-[70vw]">
//         <div className="w-full">
//           <Input
//             type="text"
//             value={msg}
//             onChange={(e) => setMsg(e.target.value)}
//           />
//         </div>
//         <button type="submit" className="flex items-center">
//           <Icon icon={<AiFillPlusCircle />} />
//         </button>
//       </div>
//     </form>
//   );
// };

// export default function ChatView({ currUser, selectedChat, messages, sendMessage }) {
//   const [msg, setMsg] = useState("");
//   const scrollRef = useRef();

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
//   }, [messages]);

//   const handleSendMsg = async (msg) => {
//     try {
//       await fetcher("/api/chats/addMsg", {
//         method: "POST",
//         body: JSON.stringify({
//           chatId: selectedChat,
//           from: currUser._id,
//           msgText: msg,
//           senderPfp: `${currUser.profilePicture.data ? (currUser.profilePicture.data.metadata.imgopti ? currUser.profilePicture.data.metadata.imgopti : currUser.profilePicture.data.metadata.image) : anon}` ,
//         }),
//       });

//       sendMessage({
//         sender: currUser,
//         senderid: currUser._id,
//         msgText: msg,
//         chatId: selectedChat,
//       })

//     } catch (err) {
//       console.error(err.message);
//     }
//   };

//   const sendChat = (event) => {
//     event.preventDefault();
//     if (msg.length > 0) {
//       handleSendMsg(msg);
//       setMsg("");
//     }
//   };

//   return (
//     <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
//       <div className="p-3 overflow-y-auto border-r-2 w-full">
//         <Message msg={msg} setMsg={setMsg} sendChat={sendChat} />
//         {messages ? (
//           messages.map((msg) => (
//             <>
//             {!msg.msgText ? <></> : (
//             <div ref={scrollRef} key={uuidv4()}>
//               <div
//                 className={`flex flex-row justify-start items-center ${
//                   msg.senderid == currUser._id ? "flex-row-reverse" : ""
//                 }`}
//               >
//                 <div className="bg-pink-50 rounded-xl h-10 w-10 mx-5 flex justify-center items-center">
//                   <Image 
//                     src={msg.sender ? (msg.sender?.profilePicture ? (msg.sender.profilePicture.metadata.imgopti ? msg.sender.profilePicture.metadata.imgopti : msg.sender.profilePicture.metadata.image) : anon) :msg.pic}
//                     width={50}
//                     height={50}
//                     className="rounded-xl"
//                   />
//                 </div>
//                 <div
//                   className={`${
//                     msg.senderid == currUser._id ? "bg-primary" : "bg-gray-200"
//                   } rounded-2xl my-5 max-w-[500px] relative`}
//                 >
//                   <p
//                     className={`px-[10px] py-[10px] text-sm ${
//                       msg.senderid == currUser._id ? "text-white" : "text-black"
//                     } justify-start`}
//                   >
//                     {msg.msgText}
//                   </p>
//                   <p
//                     className={`text-xs ${
//                       msg.senderid == currUser._id ? "text-primary" : "text-gray-500"
//                     } absolute -top-5`}
//                   >
//                     {msg.senderid == currUser._id ? "You" : (msg.sender?.username ? msg.sender?.username : "")}
//                   </p>
//                 </div>
//               </div>
//             </div>)}
//             </>
//           ))
//         ) : (
//           <StartConvo friendName={selectedChat} />
//         )}
//       </div>
//     </div>
//   );
// }
