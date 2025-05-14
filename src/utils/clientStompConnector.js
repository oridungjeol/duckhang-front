import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const stompClient = new Client({
  webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
  reconnectDelay: 5000,
});

let onConnectCallback = null;

stompClient.onConnect = () => {
  console.log("STOMP connected");

  if (onConnectCallback) {
    onConnectCallback(stompClient);
  }
};

export function activateStompClient(onConnect) {
  onConnectCallback = onConnect;
  stompClient.activate();
}

export default stompClient;
