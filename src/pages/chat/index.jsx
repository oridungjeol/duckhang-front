import { useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp, Client } from "@stomp/stompjs";

// import stompClient from "../../utils/clientStompConnector";
import { activateStompClient } from "../../utils/clientStompConnector";

export default function Chat() {

  const socket = new SockJS("http://localhost:8080/ws");
  let stompClient = Stomp.over(socket);

  stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    const subscription = stompClient.subscribe('/topic/chat', function(message) {
        console.log(message.body);
        const data = JSON.parse(message.body);
        console.log(data);
    });
    console.log("subscription: " + subscription);
    // 연결 완료 후 join 메시지(옵션)를 보낼 수 있음
    stompClient.send("/app/chat", {}, JSON.stringify({
        type: 'JOIN',
        roomId: 555,
        sender: "me"
    }));
  });

  // const roomId = 555;

  // useEffect(() => {
  //   activateStompClient((client) => {
  //     client.subscribe(`/topic/chat.app`, (chat) => {
  //       const parsed = JSON.parse(chat.body);
  //       const { content, roomId } = parsed;
  //       console.log(content, roomId);
  //     })
  //   });
  // }, []);

  return (
    <div>
      <button>
        test
      </button>
    </div>
  );
}