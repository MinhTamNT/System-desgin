import Conversation from "../../model/Conversation.js";

const createConversation = async (_, { receiverId }, context) => {
  if (!context?.uuid) {
    throw new Error("User not authenticated");
  }

  try {
    const existingConversation = await Conversation.findOne({
      members: { $all: [context.uuid, receiverId] },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = new Conversation({
      members: [context.uuid, receiverId],
    });

    await newConversation.save();
    return newConversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Error creating conversation");
  }
};

const getConversation = async (parent, args, context) => {
  if (!context?.uuid) {
    throw new Error("User not authenticated");
  }

  try {
    const conversations = await Conversation.find({
      members: { $in: context?.uuid },
    });
    return conversations;
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    throw new Error("Error retrieving conversations");
  }
};

export { createConversation, getConversation };
