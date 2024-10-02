import { IConversationDocument } from '@ensp1re/gigme-shared';
import { model, Model, Schema } from 'mongoose';


const conversationSchema: Schema = new Schema({
    conversationId: {type: String, required: true, unique: true, index: true},
    senderUsername: {type: String, required: true, index: true},
    receiverUsername: {type: String, required: true, index: true},
});

const conversationModel: Model<IConversationDocument> = model<IConversationDocument>('conversationSchema', conversationSchema);

export { conversationModel};