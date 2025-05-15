import { useEffect, useCallback } from "react";
import stompClient from"../../utils/clientStompConnector";
import { activateStompClient } from "../../utils/clientStompConnector";

export default function Chat() {

  const roomId = 555;

  useEffect(() => {
    activateStompClient((client) => {
      client.subscribe(`/topic/chat.app`, (chat) => {
        const parsed = JSON.parse(chat.body);
        const { content, roomId } = parsed;
        console.log(content, roomId);
      })
    });
  }, []);

  return (
    <div>
      <button onClick={() => {
        console.log("click")
        activateStompClient((client) => {
          client.publish({
            destination: "/topic/chat.app",
            body: JSON.stringify({
              content: "test content",
              roomId: roomId,
            }),
          });


        });
      }}>
        test
      </button>
    </div>
  );
}