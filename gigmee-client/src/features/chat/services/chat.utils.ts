import { AnyAction } from '@reduxjs/toolkit';
import { cloneDeep, filter, findIndex, remove } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { updateNotification } from 'src/shared/header/reducers/notification.reducer';
import { lowerCase } from 'src/shared/utils/utils.service';
import { socket } from 'src/sockets/socket.service';

import { IMessageDocument } from '../interfaces/chat.interface';

/**
 * Listens for the 'message received' event on the socket and updates the chat messages state.
 *
 * @param conversationId - The ID of the conversation to which the messages belong.
 * @param chatMessagesData - The current array of chat messages.
 * @param chatMessages - The array to be updated with new chat messages.
 * @param setChatMessagesData - The state setter function to update the chat messages data.
 *
 * @remarks
 * This function uses a deep clone of the chatMessagesData to ensure immutability.
 * It filters out duplicate messages based on their unique `_id` property before updating the state.
 */
export const chatMessageReceived = (
  conversationId: string,
  chatMessagesData: IMessageDocument[],
  chatMessages: IMessageDocument[],
  setChatMessagesData: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket.on('message received', (data: IMessageDocument) => {
    chatMessages = cloneDeep(chatMessagesData);
    if (data.conversationId === conversationId) {
      chatMessages.push(data);
      const uniq = chatMessages.filter((item: IMessageDocument, index: number, list: IMessageDocument[]) => {
        const itemIndex = list.findIndex((listItem: IMessageDocument) => listItem._id === item._id);
        return itemIndex === index;
      });
      setChatMessagesData(uniq);
    }
  });
};

/**
 * Handles the 'message received' event from the socket and updates the chat list accordingly.
 *
 * @param username - The username of the current user.
 * @param chatList - The current list of chat messages.
 * @param conversationListRef - A reference to the conversation list.
 * @param dispatch - The dispatch function to update the state.
 * @param setChatList - The function to update the chat list state.
 *
 * @remarks
 * This function listens for the 'message received' event from the socket. When a message is received,
 * it checks if the message is relevant to the current user (either as a sender or receiver). If so,
 * it updates the conversation list and chat list accordingly. It also updates the notification state
 * if there are unread messages for the current user.
 */
export const chatListMessageReceived = (
  username: string,
  chatList: IMessageDocument[],
  conversationListRef: IMessageDocument[],
  dispatch: Dispatch<AnyAction>,
  setChatList: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket.on('message received', (data: IMessageDocument) => {
    conversationListRef = cloneDeep(chatList);
    if (
      lowerCase(`${data.receiverUsername}`) === lowerCase(`${username}`) ||
      lowerCase(`${data.senderUsername}`) === lowerCase(`${username}`)
    ) {
      const messageIndex = findIndex(chatList, ['conversationId', data.conversationId]);
      if (messageIndex > -1) {
        remove(conversationListRef, (chat: IMessageDocument) => chat.conversationId === data.conversationId);
      } else {
        remove(conversationListRef, (chat: IMessageDocument) => chat.receiverUsername === data.receiverUsername);
      }
      conversationListRef = [data, ...conversationListRef];
      if (lowerCase(`${data.receiverUsername}`) === lowerCase(`${username}`)) {
        const list: IMessageDocument[] = filter(
          conversationListRef,
          (item: IMessageDocument) => !item.isRead && item.receiverUsername === username
        );
        dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
      }
      setChatList(conversationListRef);
    }
  });
};

/**
 * Listens for the 'message updated' event on the socket and updates the chat list accordingly.
 * 
 * @param username - The username of the current user.
 * @param chatList - The current list of chat messages.
 * @param conversationListRef - A reference to the conversation list.
 * @param dispatch - The dispatch function to update the state.
 * @param setChatList - The function to set the updated chat list.
 * 
 * The function performs the following actions:
 * - Clones the current chat list.
 * - Checks if the updated message is relevant to the current user (either as sender or receiver).
 * - Updates the message in the conversation list if it exists.
 * - If the current user is the receiver, it filters unread messages and updates the notification state.
 * - Sets the updated chat list.
 */
export const chatListMessageUpdated = (
  username: string,
  chatList: IMessageDocument[],
  conversationListRef: IMessageDocument[],
  dispatch: Dispatch<AnyAction>,
  setChatList: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket.on('message updated', (data: IMessageDocument) => {
    conversationListRef = cloneDeep(chatList);
    if (
      lowerCase(`${data.receiverUsername}`) === lowerCase(`${username}`) ||
      lowerCase(`${data.senderUsername}`) === lowerCase(`${username}`)
    ) {
      const messageIndex = findIndex(chatList, ['conversationId', data.conversationId]);
      if (messageIndex > -1) {
        conversationListRef.splice(messageIndex, 1, data);
      }
      if (lowerCase(`${data.receiverUsername}`) === lowerCase(`${username}`)) {
        const list: IMessageDocument[] = filter(
          conversationListRef,
          (item: IMessageDocument) => !item.isRead && item.receiverUsername === username
        );
        dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
      }
      setChatList(conversationListRef);
    }
  });
};