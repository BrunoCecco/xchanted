import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { fetcher } from '../../lib/fetch';
import { useRouter } from "next/router";
import anon from "../../public/faketests/anon.webp";

export default function DmCard({convoObj, id, isCurrConvo, currUser,unread}) {
    const router = useRouter();
    const [chatProperties,setChatProperties] = useState([]); 

    useEffect(() => {
        const setup = async() => {
            if (convoObj.users.length == 2) {
                //then this is a dm
                var talkingTo = convoObj.users.filter(id => id != currUser._id)[0];
                if (!talkingTo){
                    //talking to themselves
                    talkingTo = currUser._id.toString();
                }
                const response = await fetcher(`/api/users/${talkingTo}`);
                //console.log("profile pic", response.user?.profilePicture);
                setChatProperties([response.user?.username ? response.user.username : "Unknown", response.user?.profilePicture.data ? response.user.profilePicture : anon]);
    
            } else {
                //some other chat
                console.log("deal with group chats later");
            }
        }  

        setup();

    },[convoObj])

    return (
    <div className={`rounded-xl w-full flex items-center ml-2 mx-1 mb-[5px] cursor-pointer ${isCurrConvo ? "bg-gray-100" : ""}`}
    >
        {chatProperties[1] ? (
            <>
            <div className="rounded-xl justify-center items-center p-0">
                <Image 
                    src={chatProperties[1] && chatProperties[1]?.data?.metadata?.imgopti ? chatProperties[1].data?.metadata.imgopti : (chatProperties[1]?.data?.metadata.image ? chatProperties[1].data?.metadata.image : anon)}
                    height={80}
                    width={80}
                    alt={chatProperties[0]}
                    className="rounded-xl object-fill"
                    onError={(e)=>{e.target.onerror = null; e.target.src={anon}}}
                />
            </div>
            <div className={`flex flex-col items-start ml-2 w-full h-full`}>
                <p>{chatProperties[0]}</p>
                <div className="flex flex-row justify-around w-full">
                    <p className="text-xs line-clamp-1 w-full">{convoObj.latestMessage}</p>
                    {unread && (
                        <div className="bg-blue-500 rounded-full w-3 h-3 p-1"></div>
                    )}
                </div>
                {/* <p className="text-xs">{`Unread: ${unread}`}</p> */}
            </div>
            </>
        ):<></>}
    </div>
  )
}
