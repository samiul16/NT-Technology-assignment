/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("task:update", (data) => {
      socket.broadcast.emit("task:update", data);
    });
  });
}
