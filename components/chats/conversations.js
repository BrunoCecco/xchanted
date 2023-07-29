// import React, { useEffect, useState } from "react";
// import DmCard from "./dmcard";
// import azukiFake from "../../public/faketests/azuki_fake.webp";
// import { useRouter } from "next/router";
// import { fetcher } from "../../lib/fetch";
// import Searchbar from "../elements/Searchbar";

// const fakeDMs = [
//   {
//     id: 1,
//     username: "manknowsdawae",
//     profileImg: azukiFake,
//     message:
//       "Yeh man take ur time sdfhsidfsefsdfhsiduf sdifhosiefoesf sdfishefsi ef",
//     badges: [],
//   },
//   {
//     id: 2,
//     username: "Yuena",
//     profileImg: azukiFake,
//     message: "i want cake mannnnnnnnnnnn",
//     badges: [],
//   },
// ];

// export default function Conversations({ currUser, currConvo, allConvos }) {
//   let badges = [];

//   useEffect(() => {
//     console.log("Testing what's sent through", currUser, currConvo, allConvos);
//   });

//   return (
//     <div className="overflow-y-auto overflow-x-hidden h-screen flex-col px-5 border-r-2 items-center">
//       <div className="flex items-center w-full my-[10px]">
//         <Searchbar type="search" placeholder="Search conversations" />
//       </div>
//       <div className="opacity-40 font-extrabold mt-[20px] mb-[20px] ml-2">
//         DIRECT MESSAGES
//       </div>
//       <div className="flex flex-col gap-2 w-full items-center justify-center">
//         {allConvos?.map((convo, i) => (
//           <div key={convo._id}>
//             <DmCard
//               convoObj={convo}
//               id={convo._id}
//               badges={badges}
//               status="online"
//               isCurrConvo={convo._id == currConvo}
//               currUser={currUser}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
