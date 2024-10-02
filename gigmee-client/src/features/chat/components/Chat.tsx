import { FC, ReactElement, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { IMessageDocument } from "../interfaces/chat.interface";
import { useGetUserMessagesQuery } from "../services/chat.service";
import { chatMessageReceived } from "../services/chat.utils";
import ChatWindow from "./ChatWindow/ChatWindow";
import ChatList from "./ChatList/ChatList";

const Chat: FC = (): ReactElement => {
  const { conversationId } = useParams<string>();
  const chatMessages = useRef<IMessageDocument[]>([]);
  const [skip, setSkip] = useState<boolean>(false);
  const [chatMessagesData, setChatMessagesData] = useState<IMessageDocument[]>(
    [],
  );
  const { data, isSuccess, isLoading, isError } = useGetUserMessagesQuery(
    `${conversationId}`,
    { skip },
  );

  useEffect(() => {
    if (isSuccess) {
      setChatMessagesData(data?.messages as IMessageDocument[]);
    }
  }, [isSuccess, data?.messages]);

  useEffect(() => {
    chatMessageReceived(
      `${conversationId}`,
      chatMessagesData,
      chatMessages.current,
      setChatMessagesData,
    );
  }, [chatMessagesData, conversationId]);

  const [showChatWindow, setShowChatWindow] = useState<boolean>(false);


  const handleBackToChatList = () => {
    setShowChatWindow(false);
  };
  const handleUserClick = () => {
    setShowChatWindow(true);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowChatWindow(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="border-grey mx-2 my-5 w-full flex max-h-[90%] flex-wrap border lg:container lg:mx-auto">
      <div
        className={`lg:border-grey relative w-full overflow-hidden lg:w-1/3 lg:border-r ${
          showChatWindow ? "hidden md:flex" : "block"
        }`}
      >
        <ChatList onUserClick={handleUserClick} />
      </div>

      <div
        className={`relative w-full overflow-hidden md:w-2/3 lg:flex ${
          showChatWindow ? "flex" : "hidden md:flex"
        }`}
      >
        {chatMessagesData.length > 0 ? (
          <ChatWindow
            onBackToChatList={handleBackToChatList}
            setSkip={setSkip}
            chatMessages={chatMessagesData}
            isLoading={isLoading}
            isError={isError}
          />
        ) : (
          <div className="flex w-full items-center justify-center">
            Select a user to chat with.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
