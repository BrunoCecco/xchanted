import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import plusFilled from "../../public/plus-filled.svg";
import { fetcher } from "../../lib/fetch";
import { v4 as uuidv4 } from "uuid";
import anon from "../../public/faketests/anon.webp";
import sendButton from "../../public/sendButton.svg";
import InfiniteScroll from "react-infinite-scroll-component";

const StartConvo = ({ friendName,friendProfilePic }) => {
  const collectionArr = [...Array(3)];

  return (
    <div className="p-3 flex pb-[100px] pt-[30px] justify-center h-64 items-center border-b-2">
      <div className=" w-full flex flex-col items-center mt-[1rem] p-2">
        <div className="h-[125px] w-[125px] flex items-center justify-center text-center object-contain">
          <Image
            src={friendProfilePic}
            height={125}
            width={125}
            alt={"Profile Picture of " + friendName}
            className={"border-2 rounded-xl"}
          />
        </div>
        <p>This is the start of your conversation with {friendName}!</p>
        { /* 
        <div className="flex">
          <p>Same communities: </p>
          <div className="flex flex-row px-3 items-center">
            {collectionArr.map((dot, index) => (
              <div
                key={index}
                className="bg-pink-500 h-[20px] w-[20px] mx-1 rounded-full object-contain flex items-center"
              ></div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

const Message = ({ msg, setMsg, handleKeyPress }) => {
  return (
    <form
      className="w-[350px] md:w-[850px] shrink fixed bottom-5"
    >
      <div className="md:w-full shrink border-2 md:ml-[5px] h-[44px] py-[15px] rounded-xl flex justify-center items-center p-3">
        <input
          className="w-full border-0 outline-0 mr-2 bg-transparent border-none ring-0 outline-none mt-[3px] resize-none h-90 p-2"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <div className="flex items-center">
          <Image
            height={25}
            width={25}
            src={plusFilled}
            className="w-[25px] opacity-60 cursor-pointer"
          />

          <Image
            height={25}
            width={25}
            src={sendButton}
            className="w-[25px] opacity-60 cursor-pointer"
            onClick={(e) => sendChat(e)}
          />
        </div>
      </div>
    </form>
  );
};

export default function ChatView({ currUser, users, selectedChat, messages, sendMessage, startFromId, seeEarlierMessages, endOfConvo }) {
  const [msg, setMsg] = useState("");
  const scrollRef = useRef();
  const scrollUnreadRef = useRef();
  const [friend,setFriend] = useState(null);

  useEffect(() => {
    if (currUser && users) {
      const getTalkingTo = async(userid) => {
        try{
            console.log(currUser, users, messages);
            return await fetcher(`/api/users/${userid}`);
        } catch (err) { 
            console.log("no such user exists");
            console.log(err);
        }
      }
      //might be talking to themselves
      if (users.length == 2 && messages.length > 0){
        //dm
        const params = users.filter((u) => u != currUser._id.toString()[0]) ? users.filter((u) => u!=currUser._id.toString())[0] : currUser._id.toString()
        getTalkingTo(params).then((talkingTo) => {setFriend(talkingTo?.user)});
      }
    }

  },[currUser, users])



  useEffect(() => {
    if (startFromId){
      scrollUnreadRef.current?.scrollIntoView({ behaviour: "smooth" });
    }
  },[startFromId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    let dmId = Date.now();
    try {

      sendMessage({
        sender: currUser,
        senderid: currUser._id,
        msgText: msg,
        chatId: selectedChat,
        dmId:dmId,
      })


      await fetcher("/api/chats/addMsg", {
        method: "POST",
        body: JSON.stringify({
          chatId: selectedChat,
          from: currUser._id,
          msgText: msg,
          senderPfp: `${currUser.profilePicture.data ? (currUser.profilePicture.data.metadata.imgopti ? currUser.profilePicture.data.metadata.imgopti : currUser.profilePicture.data.metadata.image) : ""}` ,
          dmId: dmId,
        }),
      });


    } catch (err) {
      console.error(err.message);
    }
  };

  const sendChat = () => {
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  const handleKeyPress = (event) => { // detect Enter vs Shift-Enter
    if (event.key === "Enter") {
      if (event.shiftKey) {
        console.log("shift enter pressed");
      } else {
        console.log("enter pressed");
        sendChat();
      }
      event.preventDefault();
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
      <div className="p-3 overflow-y-auto">
        <Message msg={msg} setMsg={setMsg} handleKeyPress={handleKeyPress} />
        {messages.length == 0 && currUser == friend ? (
          friend && (
            <StartConvo
              friendName={friend.username}
              friendProfilePic={
                friend.profilePicture.data
                  ? friend.profilePicture.data.metadata.imgopti
                    ? friend.profilePicture.data.metadata.imgopti
                    : friend.profilePicture.data.metadata.image
                  : anon
              }
            />
          )
        ) : (
          <InfiniteScroll
            inverse
            dataLength={messages.length}
            next={() => seeEarlierMessages()}
            hasMore={!endOfConvo}
            loader={
              <div className="w-full p-4 text-center text-base">Loading messages...</div>
            } 
          >
          {/* 
            endMessage={
              <div className="w-full p-4 text-center text-base">
                You have reached the start of your conversation.
              </div>
            }

            end message shows at the bottom of chat instead of top...
            */}
            {messages.map((msg, index) => (
              <>
                {!msg.msgText ? (
                  <></>
                ) : (
                  <div
                    key={msg.chatid}
                    ref={msg.dmId == startFromId ? scrollUnreadRef : scrollRef}
                  >
                    <div
                      key={msg.chatid}
                      className={`flex flex-row justify-start items-center ${
                        msg.senderid === currUser._id.toString()
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div className="bg-pink-50 rounded-xl h-10 w-10 mx-5 flex justify-center items-center">
                        <Image
                          src={
                            msg.pic != "" && msg.pic != "[object Object]"
                              ? msg.pic
                              : anon
                          }
                          width={50}
                          height={50}
                          className="rounded-xl"
                        />
                      </div>
                      <div
                        className={`${
                          msg.senderid == currUser._id
                            ? "bg-primary"
                            : "bg-gray-200"
                        } rounded-2xl my-5 max-w-[500px] relative`}
                      >
                        <p
                          className={`px-[10px] py-[10px] text-sm ${
                            msg.senderid == currUser._id
                              ? "text-white"
                              : "text-black"
                          } justify-start`}
                        >
                          {msg.msgText}
                        </p>
                        <p
                          className={`text-xs ${
                            msg.senderid == currUser._id
                              ? "text-primary"
                              : "text-gray-500"
                          } absolute -top-5`}
                        >
                          {msg.senderid == currUser._id
                            ? "You"
                            : msg.sender?.username
                            ? msg.sender?.username
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
  
}