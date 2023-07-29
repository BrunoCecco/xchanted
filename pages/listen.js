import { useEffect } from "react";
import { io } from "socket.io-client";
let socket;

const Home = () => {
  useEffect(() => socketInitializer(), []);

  const socketInitializer = async () => {
    await fetch("/api/updates/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("msg", (m) => {
      console.log(m);
    });
  };

  return null;
};

export default Home;
