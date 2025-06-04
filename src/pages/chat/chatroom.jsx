import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { getChattingData, uploadImage } from "./hook";
import "./chatroom.css";

// Import new components
import TextMessage from "../../components/chat/TextMessage";
import ImageMessage from "../../components/chat/ImageMessage";
import PaymentMessage from "../../components/chat/PaymentMessage";
import RefundMessage from "../../components/chat/RefundMessage";
import CompletePaymentMessage from "../../components/chat/CompletePaymentMessage";
import CompleteRefundMessage from "../../components/chat/CompleteRefundMessage";
import ChatInput from "../../components/chat/ChatInput";
import ChatHeader from "../../components/chat/ChatHeader";
import BottomNav from "../../components/BottomNav";

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};
  const uuid = localStorage.getItem("uuid");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [openPaymentDetail, setOpenPaymentDetail] = useState({});
  const [openRefundDetail, setOpenRefundDetail] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [boardData, setBoardData] = useState({});
  const messageRefs = useRef({});

  const stompClientRef = useRef(null);
  const isConnected = useRef(false);
  const scrollRef = useRef();
  const pageRef = useRef(0);

  console.log("board to chatroom data is ", data);

  useEffect(() => {
    if (!location.state || !location.state.room_id) {
      console.error("채팅방 정보가 없습니다.");
      navigate("/chat"); // 채팅 목록으로 리다이렉트
      return;
    }
  }, [location.state, navigate]);

  /**
   * 글 작성자 정보 가져오기
   */
  const fetchAuthorInfo = async () => {
    try {
      const response = await fetch(
        `http://localhost/api/board/${data.type}/${data.board_id}`,
        {
          credentials: "include",
        }
      );
      const boardData = await response.json();
      setBoardData(boardData);

      const isAuthorCheck = boardData.author_uuid === uuid;

      setIsAuthor(isAuthorCheck);

      if (data.type === "RENTAL") {
        try {
          const paymentResponse = await fetch(
            `http://localhost/api/payment/${data.board_id}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (paymentResponse.status === 404) {
            setIsBuyer(false);
            return;
          }

          if (!paymentResponse.ok) {
            setIsBuyer(false);
            return;
          }

          const paymentData = await paymentResponse.json();

          if (paymentData && paymentData.orderId) {
            setIsBuyer(true);
          } else {
            setIsBuyer(false);
          }
        } catch (error) {
          setIsBuyer(false);
        }
      } else {
        setIsBuyer(false);
      }

      setIsAuthor(isAuthorCheck);
    } catch (error) {
      console.error("글 작성자 정보 가져오기 실패:", error);
    }
  };

  /**
   * 이전 메시지 데이터 로드
   * stomp 연결
   */
  useEffect(() => {
    if (isConnected.current || !data.room_id) return;

    fetchAuthorInfo();

    const socket = new SockJS("http://localhost:8080/ws");

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        uuid: uuid,
      },
      onConnect: () => {
        console.log("Connected!");
        isConnected.current = true;

        client.subscribe(`/topic/chat/${data.room_id}`, (message) => {
          const newMessage = JSON.parse(message.body);

          if (newMessage.type === "PAY") {
            try {
              const paymentData = JSON.parse(newMessage.content);
            } catch (error) {
              console.error("Payment data parsing error:", error);
            }
          }

          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) =>
                msg.type === newMessage.type &&
                msg.author_uuid === newMessage.author_uuid &&
                msg.created_at === newMessage.created_at &&
                msg.content === newMessage.content
            );

            if (isDuplicate) {
              console.log("Duplicate message detected, skipping:", newMessage);
              return prev;
            }

            console.log("New message received:", newMessage);
            const updatedMessages = [...prev, newMessage];
            updatedMessages.sort(
              (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            return updatedMessages;
          });
        });
      },
      onDisconnect: () => {
        console.log("Disconnected");
        isConnected.current = false;
      },
    });

    stompClientRef.current = client;
    client.activate();

    loadMessageData();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [data.room_id, uuid]);

  /**
   * 맨 처음 메시지를 보낼 때 스크롤 맨 밑으로 고정
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * 스크롤 관련 로직
   */
  useEffect(() => {
    if (location.state?.scrollToMessage) {
      const { createdAt, authorUuid } = location.state.scrollToMessage;
      const targetMessage = messages.find(
        (msg) => msg.created_at === createdAt && msg.author_uuid === authorUuid
      );

      if (targetMessage) {
        // 메시지가 이미 로드된 경우 바로 스크롤
        const messageIndex = messages.findIndex(
          (msg) =>
            msg.created_at === createdAt && msg.author_uuid === authorUuid
        );
        if (messageIndex !== -1) {
          const messageWrapper = scrollRef.current?.children[messageIndex + 1]; // +1 for the load more button
          if (messageWrapper) {
            messageWrapper.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            // Optionally highlight the message
            const messageElement = messageWrapper.querySelector(".message");
            if (messageElement) {
              messageElement.classList.add("highlighted-message");
              setTimeout(() => {
                messageElement.classList.remove("highlighted-message");
              }, 2000);
            }
          }
        } else {
          console.warn(
            "Message found in messages array but corresponding DOM element not found.",
            targetMessage
          );
        }
      } else {
        // 메시지가 아직 로드되지 않은 경우 (예: 과거 메시지) 추가 로딩 필요
        // TODO: Implement logic to load older messages until the target message is found
        console.log(
          "Target message not found in current view. Need to load older messages."
        );
      }
      // Clear the state after attempting to scroll
      // navigate(location.pathname, { replace: true }); // This might remove other useful state
    }
  }, [messages, location.state]); // Depend on messages and location.state

  /**
   * 이전 채팅 기록 50개를 호출
   */
  const loadMessageData = async () => {
    const message_list = await getChattingData(data, pageRef);
    // 불러온 메시지를 created_at 기준으로 오름차순 정렬
    message_list.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    setMessages(message_list);
  };

  /**
   * 더 과거의 채팅 기록 50개를 추가 호출
   */
  const loadMoreMessageData = async () => {
    try {
      pageRef.current += 1;
      const more_message_list = await getChattingData(data, pageRef);
      // 새로 불러온 메시지를 기존 메시지 앞에 추가하고 전체를 다시 정렬
      const combinedMessages = [...more_message_list, ...messages];
      combinedMessages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(combinedMessages);
    } catch (error) {
      console.error("과거 채팅 기록 불러오기 중 오류 발생:", error);
    }
  };

  /**
   * 엔터로 메시지 전송
   * @param {*} e
   */
  const activeEnter = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  /**
   * TODO 텍스트 / 이미지 분기점, 텍스트 메시지 핸들러는 새로 하나 만들 것
   * 텍스트 메시지 핸들러
   * @returns
   */
  const handleSend = () => {
    const client = stompClientRef.current;
    if (client?.connected) {
      if (input.trim() === "") return;

      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "TEXT",
          author_uuid: uuid,
          content: input,
          created_at: created_at,
          room_id: data.room_id,
        }),
      });

      setInput("");
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 이미지 메시지 핸들러
   */
  const handleImage = async () => {
    const formData = new FormData();
    formData.append("image", image);

    console.log(image);

    const image_url = await uploadImage(formData);
    console.log(image_url);

    const client = stompClientRef.current;
    if (client?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "IMAGE",
          author_uuid: uuid,
          content: image_url,
          created_at: created_at,
          room_id: data.room_id,
        }),
      });
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 결제 메시지 핸들러
   */
  const handlePay = async () => {
    try {
      // 게시글 정보 가져오기
      const response = await fetch(
        `http://localhost/api/board/${data.type}/${data.board_id}`,
        {
          credentials: "include",
        }
      );
      const boardData = await response.json();

      // 렌탈 게시글인 경우 deposit 값 확인
      const deposit = data.type === "RENTAL" ? boardData.deposit || 0 : 0;

      const paymentInfo = {
        price: boardData.price,
        deposit: deposit,
        totalAmount:
          data.type === "RENTAL" ? boardData.price + deposit : boardData.price,
        actualPrice: boardData.price, // 실제 결제금액 (보증금 제외)
        boardId: data.board_id,
        type: data.type,
      };

      const client = stompClientRef.current;
      if (client?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;

        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const message = {
          type: "PAY",
          author_uuid: uuid,
          content: JSON.stringify(paymentInfo),
          created_at: created_at,
          room_id: data.room_id,
        };

        client.publish({
          destination: `/app/chat/${data.room_id}`,
          body: JSON.stringify(message),
        });
      } else {
        console.log("연결이 되지 않았습니다.");
      }
    } catch (error) {
      console.error("결제 정보 가져오기 실패:", error);
    }
  };

  /**
   * 지도 메시지 핸들러
   */
  const handleMap = () => {
    const client = stompClientRef.current;
    if (client?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "MAP",
          author_uuid: uuid,
          content: "",
          created_at: created_at,
          room_id: data.room_id,
        }),
      });
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 보증금 반환 요청 메시지 핸들러
   */
  const handleRefund = async (refundMessage) => {
    try {
      if (!refundMessage || !refundMessage.content) {
        alert("보증금 반환 요청 정보를 찾을 수 없습니다.");
        return;
      }

      let refundMessageData;
      try {
        refundMessageData = JSON.parse(refundMessage.content);
        console.log("Refund Message Data:", refundMessageData);
        if (!refundMessageData || typeof refundMessageData !== "object") {
          throw new Error("보증금 반환 요청 데이터 형식이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("Refund message parsing error:", error);
        alert(
          "보증금 반환 요청 정보를 처리하는데 실패했습니다. 다시 시도해주세요."
        );
        return;
      }

      // 게시글 정보 가져오기
      const boardResponse = await fetch(
        `http://localhost/api/board/${data.type}/${data.board_id}`,
        {
          credentials: "include",
        }
      );

      if (!boardResponse.ok) {
        throw new Error("게시글 정보를 가져오는데 실패했습니다.");
      }

      const boardData = await boardResponse.json();
      console.log("Board Data:", boardData);

      const paymentResponse = await fetch(
        `http://localhost/api/payment/${data.board_id}`,
        {
          credentials: "include",
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("결제 정보를 가져오는데 실패했습니다.");
      }

      const paymentData = await paymentResponse.json();
      console.log("Payment Data:", paymentData);

      if (!paymentData || !paymentData.orderId) {
        alert("결제 정보를 찾을 수 없습니다.");
        return;
      }

      const refundInfo = {
        orderId: paymentData.orderId,
        room_id: data.room_id,
        room_name: data.name,
        board_id: data.board_id,
        type: data.type,
        deposit: boardData.deposit || 0,
      };

      console.log("Refund Info:", refundInfo);

      // 필수 정보 확인
      const requiredFields = [
        "orderId",
        "room_id",
        "room_name",
        "board_id",
        "type",
      ];
      const missingFields = requiredFields.filter(
        (field) => !refundInfo[field]
      );

      if (missingFields.length > 0) {
        alert(
          `보증금 반환 요청에 필요한 정보가 누락되었습니다: ${missingFields.join(
            ", "
          )}`
        );
        return;
      }

      setRefundData(refundInfo);
      setShowRefundModal(true);
    } catch (error) {
      console.error("Refund handling error:", error);
      alert(
        error.message || "보증금 반환 요청 정보를 가져오는데 실패했습니다."
      );
    }
  };

  const addImage = (e) => {
    setImage(e.target.files[0]);
  };

  const isPaymentApprovedInChat = (() => {
    if (!Array.isArray(messages)) return false;
    return messages.some((msg) => {
      if (!msg || !msg.type) return false;
      if (msg.type === "COMPLETE_PAYMENT") {
        try {
          const paymentData = JSON.parse(msg.content);
          return !!paymentData && !!paymentData.approvedAt;
        } catch (error) {
          console.error(
            "Error parsing payment data for refund button check:",
            error
          );
          return false;
        }
      }
      return false;
    });
  })();

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundData(null);
  };

  // closeRefundModal 함수를 전역으로 노출
  useEffect(() => {
    window.closeRefundModal = closeRefundModal;

    const handleMessage = (event) => {
      if (event.origin === window.location.origin) {
        if (
          typeof event.data === "object" &&
          event.data !== null &&
          event.data.type === "closeRefundModal"
        ) {
          closeRefundModal();

          // 보증금 반환 완료 STOMP 메시지 전송
          const refundCompleteInfo = event.data.refundInfo;
          if (refundCompleteInfo) {
            const client = stompClientRef.current;
            if (client?.connected) {
              const now = new Date();
              const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
              const kstDate = new Date(kstOffset);
              const kstData_review = new Date(kstDate.getTime() + 1000);

              const created_at = kstDate.toISOString().slice(0, 19);
              const created_review = kstData_review.toISOString().slice(0, 19);

              const refundMessage = {
                message: "보증금 반환이 완료되었습니다.",
                orderId: refundCompleteInfo.orderId,
                totalAmount:
                  refundCompleteInfo.totalAmount ||
                  refundCompleteInfo.deposit ||
                  0,
                method: "간편결제",
                approvedAt: refundCompleteInfo.approvedAt || created_at,
              };

              client.publish({
                destination: `/app/chat/${data.room_id}`,
                body: JSON.stringify({
                  type: "COMPLETE_REFUNDED",
                  author_uuid: uuid,
                  content: JSON.stringify(refundMessage),
                  created_at: created_at,
                  room_id: data.room_id,
                }),
              });

              client.publish({
                destination: `/app/chat/${data.room_id}`,
                body: JSON.stringify({
                  type: "REVIEW",
                  author_uuid: "",
                  content: "", 
                  created_at: created_review,
                  room_id: data.room_id,
                }),
              });
            } else {
              console.error(
                "STOMP client not connected, cannot send COMPLETE_REFUNDED message."
              );
            }
          } else {
            console.error(
              "Refund info not found in message data, cannot send COMPLETE_REFUNDED."
            );
          }
        } else if (
          typeof event.data === "string" &&
          event.data === "closeRefundModal"
        ) {
          // 레거시 메시지 처리 로직 제거
          console.log(
            "Legacy close refund modal message received with matching origin, closing modal."
          );
          closeRefundModal();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      delete window.closeRefundModal;
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const togglePaymentDetail = (idx) => {
    setOpenPaymentDetail((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleRefundDetail = (idx) => {
    setOpenRefundDetail((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  /**
   * 보증금 반환 요청 핸들러
   */
  const handleRefundRequest = async () => {
    try {
      // 게시글 정보 가져오기
      const response = await fetch(
        `http://localhost/api/board/${data.type}/${data.board_id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("게시글 정보를 가져오는데 실패했습니다.");
      }

      const boardData = await response.json();

      // 환불 요청 메시지 전송
      const client = stompClientRef.current;
      if (client?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const refundMessage = {
          type: "REFUND",
          author_uuid: uuid,
          content: JSON.stringify({
            price: boardData.price,
            deposit: boardData.deposit,
            totalAmount: boardData.price + boardData.deposit,
            actualPrice: boardData.price,
            boardId: data.board_id,
            type: data.type,
          }),
          created_at: created_at,
          room_id: data.room_id,
        };

        client.publish({
          destination: `/app/chat/${data.room_id}`,
          body: JSON.stringify(refundMessage),
        });
      }
    } catch (error) {
      alert(error.message || "보증금 반환 요청을 처리하는데 실패했습니다.");
    }
  };

  const handlePurchaseConfirm = () => {
    navigate("/test-refund", {
      state: {
        board_id: data.board_id,
        room_id: data.room_id,
        room_name: data.name,
        orderId: data.orderId,
      },
    });
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setIsSearching(false);
      return;
    }

    const results = messages
      .map((msg, index) => ({ ...msg, index }))
      .filter((msg) => {
        if (msg.type === "TEXT") {
          return msg.content
            .toLowerCase()
            .includes(searchKeyword.toLowerCase());
        }
        return false;
      });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    setIsSearching(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const scrollToMessage = (messageToScroll) => {
    // Find the current index of the message in the messages array
    const currentIndex = messages.findIndex(
      (msg) =>
        msg.content === messageToScroll.content &&
        msg.author_uuid === messageToScroll.author_uuid &&
        msg.created_at === messageToScroll.created_at
      // Add other unique properties if available and necessary
    );

    if (currentIndex === -1) {
      console.warn(
        "Target message not found in current messages list.",
        messageToScroll
      );
      return;
    }

    const messageWrappers = document.querySelectorAll(".message-wrapper");
    if (messageWrappers[currentIndex]) {
      // 이전 강조 효과 제거 (애니메이션 클래스 제거)
      document
        .querySelectorAll(".message.highlighted-message")
        .forEach((el) => {
          el.classList.remove("highlighted-message");
        });
      document.querySelectorAll(".message-wrapper.highlight").forEach((el) => {
        el.classList.remove("highlight");
      });

      const messageElement =
        messageWrappers[currentIndex].querySelector(".message");
      if (messageElement) {
        // 해당 메시지 내용 요소에 볼드 스타일 클래스 추가
        messageElement.classList.add("bolded-message");
        messageWrappers[currentIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // 2초 후 볼드 스타일 클래스 제거
        setTimeout(() => {
          messageElement.classList.remove("bolded-message");
        }, 2000);

        // 메시지 자체 배경색 강조 제거 (이전 로직에서 추가되었을 수 있음)
        messageWrappers[currentIndex].style.backgroundColor = "";
      }
    } else {
      console.warn("Message wrapper not found for index:", currentIndex);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length === 0) return;
    // 다음 (더 최신) 결과로 이동 -> currentSearchIndex 증가
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToMessage(searchResults[nextIndex]);
  };

  const handlePrevResult = () => {
    if (searchResults.length === 0) return;
    // 이전 (더 오래된) 결과로 이동 -> currentSearchIndex 감소
    // 인덱스가 음수가 되지 않도록 처리
    const prevIndex =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    scrollToMessage(searchResults[prevIndex]);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setIsSearching(false);
    // 남아있는 강조 효과 제거 (애니메이션 및 볼드 클래스 제거)
    document.querySelectorAll(".message.highlighted-message").forEach((el) => {
      el.classList.remove("highlighted-message");
    });
    document.querySelectorAll(".message-wrapper.highlight").forEach((el) => {
      el.classList.remove("highlight");
    });
    document.querySelectorAll(".message.bolded-message").forEach((el) => {
      // bolded-message 클래스 제거 추가
      el.classList.remove("bolded-message");
    });
    document.querySelectorAll(".message-wrapper").forEach((el) => {
      el.style.backgroundColor = "";
    });
  };

  /**
   * 타입별 메시지 UI 렌더링
   * @param {*} msg
   * @param {*} index
   * @returns
   */
  const renderMessage = (msg, index) => {
    const isMine = msg.author_uuid === uuid;
    const messageId = `message-${index}`;

    switch (msg.type) {
      case "SYSTEM":
        return (
          <div
            key={index}
            className="system-message"
            ref={(el) => (messageRefs.current[messageId] = el)}
          >
            {msg.content}
          </div>
        );

      case "WARNNING":
        return (
          <div ref={(el) => (messageRefs.current[messageId] = el)}>
            {!isMine && (
              <div key={index} className="system-message">
                {msg.content === "EXTERNAL" && (
                  <div key={index} className="warnning-message">
                    거래를 외부에서 유도하면 사기 가능성이 있어요. 주의해
                    주세요.
                  </div>
                )}
                {msg.content === "DEPOSIT" && (
                  <div key={index} className="warnning-message">
                    안전을 위해 서비스 내 결제 기능을 이용하는 것을 권장해요.
                    <br />
                    선입금 요구에 주의하세요.
                  </div>
                )}
                {msg.content === "PERSONAL_INFO" && (
                  <div key={index} className="warnning-message">
                    개인정보를 요구하면 사기일 가능성이 높아요. 주의해주세요.
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "REVIEW":
        return (
          !isAuthor && (
            <div className="review-wrapper">
              <button
                className="review-button"
                onClick={() => {
                  if (!data.orderId) {
                    alert("결제 정보를 찾을 수 없습니다. 결제가 완료되었는지 확인해주세요.");
                    return;
                  }

                  console.log("리뷰 작성 페이지로 전달할 데이터:", {
                    author_uuid: boardData.author_uuid,
                    orderId: data.orderId,
                    room_id: data.room_id
                  });

                  navigate("/review", {
                    state: { 
                      author_uuid: boardData.author_uuid,
                      orderId: data.orderId,
                      room_id: data.room_id
                    },
                  });
                }}
              >
                리뷰를 남겨주세요!
              </button>
            </div>
          )
        );

      case "TEXT":
        const renderContent = (content, keyword) => {
          if (!keyword || !content || typeof content !== "string")
            return content;
          const parts = content.split(new RegExp(`(${keyword})`, "gi"));
          return parts.map((part, i) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
              <span key={i} className="highlighted-keyword">
                {part}
              </span>
            ) : (
              part
            )
          );
        };
        return (
          <TextMessage
            key={index}
            msg={{ ...msg, content: renderContent(msg.content, searchKeyword) }}
            isMine={isMine}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "IMAGE":
        return (
          <ImageMessage
            key={index}
            msg={msg}
            isMine={isMine}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "PAY":
        return (
          <PaymentMessage
            key={index}
            msg={msg}
            isMine={isMine}
            data={data}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "REFUND":
        return (
          <RefundMessage
            key={index}
            msg={msg}
            isMine={isMine}
            data={data}
            onRefund={handleRefund}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "COMPLETE_PAYMENT":
        return (
          <CompletePaymentMessage
            key={index}
            msg={msg}
            isMine={isMine}
            openPaymentDetail={openPaymentDetail[index]}
            togglePaymentDetail={() => togglePaymentDetail(index)}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "COMPLETE_REFUNDED":
        return (
          <CompleteRefundMessage
            key={index}
            msg={msg}
            openRefundDetail={openRefundDetail[index]}
            toggleRefundDetail={() => toggleRefundDetail(index)}
            ref={(el) => (messageRefs.current[messageId] = el)}
          />
        );

      case "MAP":
        return (
          <div
            className="map-wrapper"
            ref={(el) => (messageRefs.current[messageId] = el)}
          >
            <div className="map">
              <div className="map-content">
                <div className="map-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 13.5C13.6569 13.5 15 12.1569 15 10.5C15 8.84315 13.6569 7.5 12 7.5C10.3431 7.5 9 8.84315 9 10.5C9 12.1569 10.3431 13.5 12 13.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22C16 18 20 14.4183 20 10.5C20 6.58172 16.4183 3 12 3C7.58172 3 4 6.58172 4 10.5C4 14.4183 8 18 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="map-text">
                  <h3>실시간 위치 공유</h3>
                  <p>상대방의 현재 위치를 확인해보세요</p>
                </div>
              </div>
              <div className="map-preview">
                <div className="map-preview-placeholder"></div>
              </div>
              <button
                className="map-button"
                onClick={() => {
                  navigate("/map", {
                    state: { uuid: uuid, room_id: data.room_id },
                  });
                }}
              >
                <span>지도에서 보기</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <div className="detail-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1, { state: location.state })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="home-btn" onClick={() => navigate("/board/deal")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
      </div>

      <span>
        <ChatHeader
          data={data}
          isAuthor={isAuthor}
          isPaymentApprovedInChat={isPaymentApprovedInChat}
          handleMap={handleMap}
          handlePay={handlePay}
          handleRefundRequest={handleRefundRequest}
          onSearchClick={() => setShowSearch(!showSearch)}
        />
      </span>
      {showSearch && (
        <div className="search-box">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="채팅 내용 검색..."
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            검색
          </button>
          {isSearching && searchResults.length > 0 && (
            <>
              <button onClick={handlePrevResult} className="search-nav-button">
                ↑
              </button>
              <button onClick={handleNextResult} className="search-nav-button">
                ↓
              </button>
              <span className="search-count">
                {/* 작성일자가 오래된 순서대로 카운트 표시 (첫 번째 결과가 1/총 개수) */}
                {`${currentSearchIndex + 1}/${searchResults.length}`}
              </span>
              <button onClick={clearSearch} className="clear-search-button">
                ✕
              </button>
            </>
          )}
        </div>
      )}
      <div className="chat-box" ref={scrollRef}>
        <button className="load-more-btn" onClick={loadMoreMessageData}>
          이전 대화 더보기
        </button>
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleImage={handleImage}
        addImage={addImage}
      />
      <BottomNav />

      {showRefundModal && refundData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>환불 처리</h2>
              <button className="modal-close" onClick={closeRefundModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={`/test-refund?data=${encodeURIComponent(
                  JSON.stringify(refundData)
                )}`}
                title="환불 처리"
                className="refund-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
