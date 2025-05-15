import SockJS from "sockjs-client";
import { Stomp, Client } from "@stomp/stompjs";

// const stompClient = new Client({
//   webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
//   reconnectDelay: 5000,
// });

export function activateStompClient() {
  const socket = new SockJS("http://localhost:8080/ws");
  const stompClient = Stomp.over(socket);

  stompClient.onConnect = () => {
    console.log("STOMP connected");
  };

  return stompClient;
}
