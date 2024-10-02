import { filter, find } from "lodash";
import {
  ChangeEvent,
  FC,
  FormEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaArrowLeft, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { IBuyerDocument } from "src/features/buyer/interfaces/buyer.interface";
import Button from "src/shared/button/Button";
import { updateNotification } from "src/shared/header/reducers/notification.reducer";
import TextInput from "src/shared/inputs/TextInput";
import {
  checkFile,
  fileType,
  readAsBase64,
} from "src/shared/utils/image-utils.service";
import { TimeAgo } from "src/shared/utils/timeago.utils";
import {
  firstLetterUppercase,
  showErrorToast,
} from "src/shared/utils/utils.service";
import { socket, socketService } from "src/sockets/socket.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { v4 as uuidv4 } from "uuid";

import useChatScrollToBottom from "../../hooks/useChatScrollToBottom";
import {
  IChatWindowProps,
  IMessageDocument,
} from "../../interfaces/chat.interface";
import { useSaveChatMessageMutation } from "../../services/chat.service";
import { useGetGigByIdQuery } from "src/features/gigs/service/gigs.service";
import { useGetBuyerByUsernameQuery } from "src/features/buyer/service/buyer.service";
import ChatImagePreview from "./ChatImagePreview";
import ChatOffer from "./ChatOffer";
import ChatFile from "./ChatFile";
import OfferModal from "src/shared/modals/OfferModal";

const MESSAGE_STATUS = {
  EMPTY: "",
  IS_LOADING: false,
  LOADING: true,
};
const NOT_EXISTING_ID = "649db27404c0c7b7d4b112ec";

const ChatWindow: FC<IChatWindowProps> = ({
  chatMessages,
  isLoading,
  onBackToChatList,
  setSkip,
}): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useChatScrollToBottom([]);
  const { username } = useParams<string>();
  const receiverUsername = useRef<string>(MESSAGE_STATUS.EMPTY);
  const receiverRef = useRef<IBuyerDocument>();
  const singleMessageRef = useRef<IMessageDocument>();
  const [showImagePreview, setShowImagePreview] = useState<boolean>(
    MESSAGE_STATUS.IS_LOADING,
  );
  const [displayCustomOffer, setDisplayCustomOffer] = useState<boolean>(
    MESSAGE_STATUS.IS_LOADING,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(
    MESSAGE_STATUS.IS_LOADING,
  );
  const [message, setMessage] = useState<string>(MESSAGE_STATUS.EMPTY);
  const dispatch = useAppDispatch();
  const { data: buyerData, isSuccess: isBuyerSuccess } =
    useGetBuyerByUsernameQuery(`${firstLetterUppercase(`${username}`)}`);
  const { data } = useGetGigByIdQuery(
    singleMessageRef.current
      ? `${singleMessageRef.current?.gigId}`
      : NOT_EXISTING_ID,
  );
  const [saveChatMessage] = useSaveChatMessageMutation();

  if (isBuyerSuccess) {
    receiverRef.current = buyerData.user as IBuyerDocument;
  }

  if (chatMessages.length) {
    singleMessageRef.current = chatMessages[chatMessages.length - 1];
  }

  const handleFileChange = (event: ChangeEvent): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      if (!checkFile(file)) {
        setSelectedFile(file);
        setShowImagePreview(MESSAGE_STATUS.LOADING);
      }
    }
  };

  const setChatMessage = (event: ChangeEvent): void => {
    setMessage((event.target as HTMLInputElement).value);
  };

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (setSkip) {
      setSkip(true);
    }

    if (!message && !selectedFile) {
      return;
    }
    try {
      setIsUploadingFile(MESSAGE_STATUS.LOADING);
      const messageBody: IMessageDocument = {
        conversationId: singleMessageRef?.current?.conversationId,
        hasConversationId: true,
        body: message,
        gigId: singleMessageRef?.current?.gigId,
        sellerId: singleMessageRef?.current?.sellerId,
        buyerId: singleMessageRef?.current?.buyerId,
        senderUsername: `${authUser?.username}`,
        senderPicture: `${authUser?.profilePicture}`,
        receiverUsername: receiverRef?.current?.username,
        receiverPicture: receiverRef?.current?.profilePicture,
        isRead: false,
        hasOffer: false,
      };
      if (selectedFile) {
        const dataImage: string | ArrayBuffer | null =
          await readAsBase64(selectedFile);
        messageBody.file = dataImage as string;
        messageBody.body = messageBody.body ? messageBody.body : "1 file sent";
        messageBody.fileType = fileType(selectedFile);
        messageBody.fileName = selectedFile.name;
        messageBody.fileSize = `${selectedFile.size}`;
      }
      console.log(messageBody);
      await saveChatMessage(messageBody).unwrap();
      setSelectedFile(null);
      setShowImagePreview(MESSAGE_STATUS.IS_LOADING);
      setMessage(MESSAGE_STATUS.EMPTY);
      setIsUploadingFile(MESSAGE_STATUS.IS_LOADING);
    } catch (error) {
      setMessage(MESSAGE_STATUS.EMPTY);
      setIsUploadingFile(MESSAGE_STATUS.IS_LOADING);
      showErrorToast("Error sending message.");
    }
  };

  useEffect(() => {
    const list: IMessageDocument[] = filter(
      chatMessages,
      (item: IMessageDocument) =>
        !item.isRead && item.receiverUsername === username,
    );
    dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
  }, [chatMessages, dispatch, username]);

  useEffect(() => {
    socketService.setupSocketConnection();
    socket.emit("getLoggedInUsers", "");
    socket.on("online", (data: string[]) => {
      receiverUsername.current = find(
        data,
        (name: string) => name === receiverRef?.current?.username,
      ) as string;
    });
  }, []);

  return (
    <>
      {!isLoading && displayCustomOffer && (
        <OfferModal
          header="Create Custom Offer"
          gigTitle={data && data?.gig?.title ? data?.gig?.title : ""}
          singleMessage={singleMessageRef?.current}
          receiver={receiverRef?.current}
          authUser={authUser}
          cancelBtnHandler={() =>
            setDisplayCustomOffer(MESSAGE_STATUS.IS_LOADING)
          }
        />
      )}
      {!isLoading && (
        <div className="flex min-h-full w-full flex-col">
          <div className="border-grey flex w-full flex-col border-b px-5 py-0.5 ">
            <div className="w-full flex flex-row gap-2 items-center">
              <Button
                className="relative top-[1px] rounded bg-white px-3 py-2 text-center text-sm font-bold text-green-500 focus:outline-none md:hidden"
                disabled={false}
                label={<FaArrowLeft className="self-center" />}
                onClick={onBackToChatList}
              />

              {receiverUsername.current === receiverRef?.current?.username ? (
                <>
                  <div className="text-lg font-semibold">
                    {firstLetterUppercase(`${username}`)}
                  </div>
                  <div className="flex gap-1 pb-1 text-xs font-normal">
                    Online
                    <span className="flex h-2.5 w-2.5 self-center rounded-full border-2 border-white bg-green-400"></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-2.5 text-lg font-semibold">
                    {firstLetterUppercase(`${username}`)}
                  </div>
                  <span className="py-2.5s text-xs font-normal"></span>
                </>
              )}
            </div>
          </div>
          <div className="relative h-[100%]">
            <div
              className="absolute flex h-[98%] w-screen grow flex-col overflow-scroll"
              ref={scrollRef}
            >
              {chatMessages.map((message: IMessageDocument) => (
                <div key={uuidv4()} className="mb-4">
                  <div className="flex w-full cursor-pointer items-center space-x-4 px-5 py-2 hover:bg-[#f5fbff]">
                    <div className="flex self-start">
                      <img
                        className="h-10 w-10 object-cover rounded-full"
                        src={message.senderPicture}
                        alt=""
                      />
                    </div>
                    <div className="w-full text-sm dark:text-white">
                      <div className="flex gap-x-2 pb-1 font-bold text-[#777d74]">
                        <span>{message.senderUsername}</span>
                        <span className="mt-1 self-center text-xs font-normal">
                          {TimeAgo.dayMonthYear(`${message.createdAt}`)}
                        </span>
                      </div>
                      <div className="flex flex-col text-[#777d74]">
                        <span>{message.body}</span>
                        {message.hasOffer && (
                          <ChatOffer
                            message={message}
                            seller={seller}
                            gig={data?.gig}
                          />
                        )}
                        {message.file && <ChatFile message={message} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex flex-col">
            {showImagePreview && (
              <ChatImagePreview
                image={URL.createObjectURL(selectedFile as File)}
                file={selectedFile as File}
                isLoading={isUploadingFile}
                message={message}
                handleChange={setChatMessage}
                onSubmit={sendMessage}
                onRemoveImage={() => {
                  setSelectedFile(null);
                  setShowImagePreview(MESSAGE_STATUS.IS_LOADING);
                }}
              />
            )}
            {!showImagePreview && (
              <div className="bottom-0 left-0 right-0 z-0  ">
                <div className="flex cursor-pointer flex-row justify-between">
                  <div className="flex w-full justify-center items-center">
                    {!showImagePreview && (
                      <span className="px-4">
                        <FaPaperclip
                          className="self-center"
                          onClick={() => fileRef?.current?.click()}
                        />
                      </span>
                    )}

                    {!showImagePreview &&
                      singleMessageRef.current &&
                      singleMessageRef.current.sellerId === seller?._id && (
                        <Button
                          className=" whitespace-nowrap px-4 text-center rounded h-full bg-green-500  text-sm mb-0 pb-0 font-bold text-white hover:bg-green-400 focus:outline-none"
                          disabled={false}
                          label="Add Offer"
                          onClick={() =>
                            setDisplayCustomOffer(MESSAGE_STATUS.LOADING)
                          }
                        />
                      )}
                    <form onSubmit={sendMessage} className="flex w-full">
                      <TextInput
                        type="text"
                        name="message"
                        value={message}
                        className="border-grey px-4 w-full rounded border py-3 text-sm font-normal text-gray-600 focus:outline-none"
                        placeholder="Enter your message..."
                        onChange={(event: ChangeEvent) =>
                          setMessage((event.target as HTMLInputElement).value)
                        }
                      />
                    </form>

                    <TextInput
                      name="chatFile"
                      ref={fileRef}
                      type="file"
                      style={{ display: "none" }}
                      onClick={() => {
                        if (fileRef.current) {
                          fileRef.current.value = "";
                        }
                      }}
                      onChange={handleFileChange}
                    />

                    <Button
                      className="rounded h-full bg-green-500  text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none px-8"
                      disabled={false}
                      label={<FaPaperPlane className="self-center" />}
                      onClick={sendMessage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
