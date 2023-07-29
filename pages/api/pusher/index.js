import Pusher from "pusher";
import anon from "../../../public/faketests/anon.webp";

export const pusher = new Pusher({
    appId: "1403965",
    key: "77b841520182f4ded60c",
    secret: "1379fc2c4cd22ec23792",
    cluster: "eu",
    useTLS: true,
});

export default async function handler(req,res) {
    req.body = JSON.parse(req.body);

    //general case
    pusher.trigger(`${req.body.chatid}`,"new-msg",{fromSelf:req.body.messageBody.senderid==req.body.currUserid,msgText:req.body.messageBody.msgText,
        users:req.body.users,pic:`${req.body.messageBody.sender.profilePicture.data ? (req.body.messageBody.sender.profilePicture.data.metadata.imgopti ? req.body.messageBody.sender.profilePicture.data.metadata.imgopti : req.body.messageBody.sender.profilePicture.data.metadata.image) : anon}`,
        senderid:req.body.messageBody.senderid,dmId:req.body.messageBody.dmId,chatId:req.body.chatid});
        
    res.json({message:"pusher handler :)",got:req.body.chatid})
}