import { useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function Chat() {

  const socket = new SockJS("http://localhost:8080/ws");
  let stompClient = Stomp.over(socket);

  stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/chat', function(message) {
        const data = JSON.parse(message.body);
        console.log(data);
    });

    stompClient.send("/app/chat", {}, JSON.stringify({
        type: 'JOIN',
        content: "testing",
        room_id: 555
    }));
  });

  return (
    <div>
      <button>
        test
      </button>
    </div>
  );
}