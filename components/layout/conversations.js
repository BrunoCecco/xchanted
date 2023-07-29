import React, { useEffect, useState } from 'react'
import DmCard from './dmcard'

const ChatSidebar = ({ convos, currConvo, currUser, handleChatChange }) => {
    
    return (
        <div>
            {convos?.map((convo,i) => (
                <div key={convo.chatid} onClick={convo.chatid != currConvo ? () => handleChatChange(convo.chatid) : undefined }>
                    <DmCard 
                        convoObj={convo}
                        id={convo.chatid}
                        isCurrConvo={convo.chatid == currConvo}
                        currUser={currUser}
                        unread={convo.chatid==currConvo ? false : convo.unread.length > 0 ? true : false}
                    />
                </div> 
            ))}
        </div>
    );
  };


export default function Conversations({ currUser, currConvo, allConvos, setAllConvos, handleChatChange }) {

    const [showConvos, setShowConvos] = useState(allConvos);

    function searchConvos(searchVal) {
		let searched = allConvos.filter((convo) => {
            let convoName = convo.name;
            //if no convo name
            if (convoName==""){
                convoName = "Unknown";
            }
            //if private message, then name are their usernames separated by commas
            if (convo.users.length == 2){
                const nameArr = convoName.split(",");
                const talkingTo = nameArr.filter((name)=>name.toLowerCase() != currUser.username.toLowerCase())[0]
                if (!talkingTo){
                    talkingTo = currUser.username;
                }
                convoName = talkingTo.toLowerCase();
            }

			if (
				searchVal.trim() == "" ||
				convoName.indexOf(searchVal.toLowerCase()) != -1
			) {
				return convo;
			} else {
				return;
			}
		});
		setShowConvos(searched);
	}

    useEffect(() => {
        searchConvos(""); // show all conversations (no search made yet)
      },[allConvos])


    return (
        <div className="overflow-y-auto overflow-x-hidden h-screen flex-col px-5 border-r-2 items-center">
            <div className="flex items-center w-full my-[10px]">
                <input onChange={(e) => searchConvos(e.target.value)} className="rounded-2xl" type="search" placeholder="Search conversations"/>
            </div>
            <div className="opacity-40 font-extrabold mt-[20px] mb-[20px] ml-2">
                DIRECT MESSAGES
            </div>
            <ChatSidebar convos={ showConvos } currConvo={ currConvo } currUser={ currUser } handleChatChange= { handleChatChange }/>
            
        </div>
    )
}
