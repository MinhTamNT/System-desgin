import Conversation from "../../model/Conversation.js";
import Message from "../../model/Message.js";
import { pubsub } from "../../resolvers/resolvers.js";

const createMessage = async (_, { message, conversationId }, context) => {
  try {
    const createMessage = new Message({
      conversationId: conversationId,
      sender: context?.uuid,
      text: message,
    });
    await createMessage.save();
    await Conversation.findByIdAndUpdate(
      {
        _id: conversationId,
      },
      {
        $inc: { messageCount: 1 },
      }
    );
    pubsub.publish("MESSAGE_CREATED", {
      messageCreated: createMessage,
    });
    return message;
  } catch (error) {
    console.log(error);
  }
};

const getMessageConversationId = async (_, { conversationId }) => {
  try {
    const message = await Message.find({ conversationId: conversationId });
    return message;
  } catch (error) {
    console.log(error);
  }
};

export { createMessage, getMessageConversationId };
