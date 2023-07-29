import { Server } from "socket.io";

const SocketHandler = (req,res) => {
    if (res.socket.server.io) {
        console.log("Socket already running!")
    } else {
        console.log("Socket is initializing")
        const io = new Server(res.socket.server)
        res.socket.server.io = io

        io.on("connect", (socket) => {
            console.log("socket id:",socket.id);
            const { roomId } = socket.handshake.query;
            socket.join(roomId);

              // Listen for new messages
            socket.on("new-msg", (data) => {
                io.in(roomId).emit("new-msg", data);
            });

            // Leave the room if the user closes the socket
            socket.on("disconnect", () => {
                socket.leave(roomId);
  });
        })
    }
    res.end()
}

export default SocketHandler 