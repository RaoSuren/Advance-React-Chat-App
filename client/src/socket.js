import io from "socket.io-client";

let socket;

const connectSocket = (user_id) => {
  socket = io("https://", {
    query: `user_id=${user_id}`,
  });
};

export { socket, connetSocket };
