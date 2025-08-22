import { io, Socket } from "socket.io-client";

export type ChatSocket = Socket<
  any,
  any
>;

export function connectChat(baseUrl: string): ChatSocket {
  // Server mounts Socket.IO under path "/ws" and uses namespace "/chat"
  const socket: ChatSocket = io(`${baseUrl}/chat`, {
    transports: ["websocket"],
    path: "/ws",
    forceNew: true,
  });
  return socket;
}

export async function joinChatSession(socket: ChatSocket, sessionId: number) {
  socket.emit("join", { room: `chat_session:${sessionId}` });
}
