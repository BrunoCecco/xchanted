import React, { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "../../lib/user";
import Conversations from "../../components/layout/conversations";
import ChatView from "../../components/layout/chatview";
import { useRouter } from "next/router";
import nc from "next-connect";
import { database, auths } from "../../api-lib/middlewares";
import { fetcher } from "../../lib/fetch";
import Pusher from "pusher-js";
import { id } from "ethers/lib/utils";
import toast from "react-hot-toast";


export default function Chat({ chatid }) {
    const router = useRouter();
    const { data, error } = useCurrentUser();
    const [messageSpecific,setMessageSpecific] = useState([]);
    const [allConvos,setAllConvos] = useState([]);
    const [users,setUsers] = useState([]);
    const [startFromId,setStartFromId] = useState("");
    const [numBucket,setNumBucket] = useState(0);
    const [chatidUse,setChatidUse] = useState(chatid);
    const [endOfConvo, setEndOfConvo] = useState(false);

    const pusher = new Pusher("77b841520182f4ded60c",{
        cluster: "eu",
    });

    useEffect(() => {
        if (!data && !error) return; // useCurrentUser might still be loading
        if (!data.user) {
        router.replace("/sign-in");
        }
    }, [router, data, error]);
    // if (!data?.user) return null
        
    useEffect(() => {
        
        const setup = async() => {

            if (data?.user){
                //start from number of unreads
                try{
                    const fromUnread = await fetcher("/api/chats/getMessagesFromUnread",{
                        method: "POST",
                        body: JSON.stringify({
                            chatId:chatid,
                            timeUserLastRead:data?.user.lastReads?.chatid ? data?.user.lastReads.chatid : Date.now(),
                        })
                    });
                    setStartFromId(data?.user.lastReads?.chatid);
                    if (fromUnread.length > 0){
                        //has unreads
                        setMessageSpecific(fromUnread);
                        setNumBucket(fromUnread.length/10); //10 is size of each bucket
                    } else {
                        //get most recent
                        getMessages(0, true);
                    }
                    
                } catch (err) {
                    console.log(err);
                }
    
                // get the latest messages and users in chat
                getLatestConversations();
            }
        }
        
        setup();
    },[data,router]);

    const getMessages = async(bucketNum,limit) => {
        if (data?.user){
            try {
                const messagesNew = await fetcher("/api/chats/getAllMsg", {
                    method: "POST",
                    body: JSON.stringify({
                        chatid: chatid,
                        bucketNum: bucketNum,
                        from:data?.user._id.toString(),
                        limit:limit,
                    }),
                });
                if (messagesNew != undefined) {
                    setMessageSpecific(messagesNew.concat(messageSpecific));
                } else {
                    setEndOfConvo(true);
                }
            } catch (err) {
                console.log("Could not fetch all messages");
            }
        }
    }

    const getLatestConversations = async() => {
        try {
            const latestMessages = await fetcher("/api/chats/getLatestConversations",{
                method: "POST",
                body: JSON.stringify({
                    chatIds:data?.user.chatHist,
                    user:data?.user,
                })
            });

            var nonEmptyConvos = []
            for (var i = 0; i < latestMessages.length; i++) { 
                if (latestMessages[i].chatid == chatidUse) { // get users in chat
                    setUsers(latestMessages[i].users);
                }

                if (latestMessages[i].latestMessage != "") {
                    nonEmptyConvos.push(latestMessages[i]); // only get non empty convos
                }
            }
            setAllConvos(nonEmptyConvos);
            return latestMessages;
        } catch (err) {
            console.log("Failed to get latest messages");
        }
    }

    const messageExists = (msg) => {
        var getId = function(e){
            return e.dmId;
        }
        var ids = messageSpecific.map(getId);
        return ids.indexOf(msg.dmId) !== -1;
    }

    useEffect(() => {
        const pusherSetup = async() => {
            if (data?.user){
                pusher.subscribe(`${chatidUse}`);
                pusher.bind("new-msg",function (data){
                    if (data.chatId==chatidUse){
                        if (!messageExists(data)){
                            setMessageSpecific(messages=>[...messages,data]); // needs reviewing
                        } 
                    }
                    getLatestConversations();
                    updateLastRead(data.chatId,data.dmId);
                });
            
            } else {
                return;
            }
        }
        pusherSetup();

        return () => {
            pusher.unbind('new-msg');
            if (pusher.connection.state == "connected") {
                pusher.disconnect(); // still need to fix pusher bug (too many connections for no reason?)
            }

        }
        
    },[data,router,error]);



    const sendMessage = async(messageBody) => {
        if (data?.user){
            await fetcher("/api/pusher",{
                method: "POST",
                body: JSON.stringify({
                    messageBody: messageBody,
                    chatHist: data?.user.chatHist,
                    chatid: chatidUse,
                    currUserid: data?.user._id,
                    users: users,
                })
            })

        }
        
    }

    const updateLastRead = async(chatChangedId,dmId) => {
        if (data?.user){
            try{
                await fetcher("/api/chats/updateLastRead",{
                    method: "POST",
                    body: JSON.stringify({
                        userid: data?.user._id,
                        chatid: chatChangedId.toString(),
                        dmId: dmId,
                    })
                })
            } catch (err){
                console.log(err);
            }
        }
    }

    const handleChatChange = async (wantChatid) => {
        setMessageSpecific([]);
        setChatidUse(wantChatid);
        await router.replace(`${wantChatid.toString()}`);
    }

    const seeEarlierMessages = () => {
        getMessages(numBucket+1, true);
        setNumBucket(numBucket + 1);
    }

    return (
        <div key={router.asPath} className="overflow-hidden h-screen w-screen border-box grid grid-cols-5">
            <div className="md:col-span-1">
                <Conversations
                currUser={data?.user}
                currConvo={chatid}
                allConvos={allConvos}
                setAllConvos={setAllConvos}
                handleChatChange={handleChatChange}
                />
            </div>
            <div className="md:col-span-3">
                <ChatView currUser={data?.user} users={users} selectedChat={chatidUse} messages={messageSpecific} sendMessage={sendMessage} startFromId={startFromId} seeEarlierMessages={seeEarlierMessages} endOfConvo={endOfConvo}/>
            </div>
            <div className="md:col-span-1"></div>
        </div>
    );
}

export async function getServerSideProps(context) {
  await nc()
    .use(database, ...auths)
    .run(context.req, context.res);

  const chatid = context.params.chatid;

  return { props: { chatid } };
}
