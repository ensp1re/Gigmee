import { conversationModel } from '@chat/models/conversation.schema';
import { MessageModel } from '@chat/models/message.schema';
import { publishDirectMessage } from '@chat/queues/chat.producer';
import { chatChannel, socketIoChatObject } from '@chat/server';
import { IConversationDocument, IMessageDetails, IMessageDocument } from '@ensp1re/gigme-shared';
import { lowerCase } from 'lodash';

const createConversation = async (conversationId: string, senderUsername: string, receiverUsername: string): Promise<void> => {
  await conversationModel.create({
    conversationId,
    senderUsername,
    receiverUsername
  });
};

const addMessage = async (data: IMessageDocument): Promise<IMessageDocument> => {
  try {
    console.log('Data:', data);
    const message: IMessageDocument = (await MessageModel.create(data)) as IMessageDocument;
    if (data.hasOffer) {
      const emailMessageDetails: IMessageDetails = {
        sender: data.senderUsername,
        amount: `${data.offer?.price}`,
        buyerUsername: lowerCase(`${data.receiverUsername}`),
        sellerUsername: lowerCase(`${data.senderUsername}`),
        title: data.offer?.gigTitle,
        description: data.offer?.description,
        deliveryDays: `${data.offer?.deliveryInDays}`,
        template: 'offer'
      };
      // send email
      await publishDirectMessage(
        chatChannel,
        'gigme-order-notification',
        'order-email',
        JSON.stringify(emailMessageDetails),
        'Order email sent to notification service.'
      );
    }
    socketIoChatObject.emit('message received', message);
    return message;
  } catch (error) {
    console.error('Error occurred:', error);
    return [] as IMessageDocument;
  }
};

const getConversation = async (sender: string, receiver: string): Promise<IConversationDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };
  const conversation: IConversationDocument[] = await conversationModel.aggregate([{ $match: query }]);
  return conversation;
};

const getUserConversationList = async (username: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [{ senderUsername: username }, { receiverUsername: username }]
  };

  const messages: IMessageDocument[] = await MessageModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$conversationId',
        // get last message that was sent from the conversation
        result: { $top: { output: '$$ROOT', sortBy: { createdAt: -1 } } }
      }
    },
    {
      // get elements from message result object and return it
      $project: {
        _id: '$result._id',
        conversationId: '$result.conversationId',
        sellerId: '$result.sellerId',
        buyerId: '$result.buyerId',
        receiverUsername: '$result.receiverUsername',
        receiverPicture: '$result.receiverPicture',
        senderUsername: '$result.senderUsername',
        senderPicture: '$result.senderPicture',
        body: '$result.body',
        file: '$result.file',
        gigId: '$result.gigId',
        isRead: '$result.isRead',
        hasOffer: '$result.hasOffer',
        createdAt: '$result.createdAt'
      }
    }
  ]);
  return messages;
};

const getMessages = async (sender: string, receiver: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };
  // get messages from the oldest to the latest if it is 1
  const messages: IMessageDocument[] = await MessageModel.aggregate([{ $match: query }, { $sort: { createdAt: 1 } }]);
  return messages;
};

const getUserMessages = async (messageConversationId: string): Promise<IMessageDocument[]> => {
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    { $match: { conversationId: messageConversationId } },
    { $sort: { createdAt: 1 } }
  ]);
  return messages;
};

const updateOffer = async (messageId: string, type: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        [`offer.${type}`]: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  return message;
};

const markMessageAsRead = async (messageId: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        isRead: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  socketIoChatObject.emit('message updated', message);
  return message;
};

const markManyMessagesAsRead = async (receiver: string, sender: string, messageId: string): Promise<IMessageDocument> => {
  (await MessageModel.updateMany(
    { senderUsername: sender, receiverUsername: receiver, isRead: false },
    {
      $set: {
        isRead: true
      }
    }
  )) as IMessageDocument;
  const message: IMessageDocument = (await MessageModel.findOne({ _id: messageId }).exec()) as IMessageDocument;
  socketIoChatObject.emit('message updated', message);
  return message;
};

export {
  createConversation,
  addMessage,
  getConversation,
  getUserConversationList,
  getMessages,
  getUserMessages,
  updateOffer,
  markMessageAsRead,
  markManyMessagesAsRead
};
