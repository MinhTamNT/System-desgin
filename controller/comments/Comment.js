import { v4 as uuidv4 } from "uuid";
import { PubSub } from "graphql-subscriptions";
import { ExecuteStore } from "../../config/mysqlConfig.js";
const COMMENT_POSITION_UPDATED = "COMMENT_POSITION_UPDATED";
const pubsub = new PubSub();
const addComment = async (_, { content, x, y }, context) => {
  try {
    const idComment = uuidv4();
    const result = await ExecuteStore("AddComment", [
      idComment,
      content,
      y,
      y,
      context?.uuid,
    ]);
    const newComment = {
      id: idComment,
      content,
      x,
      y,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    pubsub.publish("COMMENT_ADDED", { commentAdded: newComment });
    return result;
  } catch (error) {
    console.log(error);
  }
};

const addReply = async (_, { content, commentId }, context) => {
  try {
    const idReply = uuidv4();
    const result = await ExecuteStore("AddReply", [
      idReply,
      content,
      commentId,
      context?.uuid,
    ]);
    const newReply = {
      id: replyId,
      content,
      userId,
      parentCommentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    pubsub.publish("REPLY_ADDED", { replyAdded: newReply });
    return result;
  } catch (error) {
    console.log(error);
  }
};
const addReaction = async (_, { commentId, type }, context) => {
  try {
    const idReaction = uuidv4();
    const result = await ExecuteStore("AddReaction", [
      idReaction,
      context?.uuid,
      commentId,
      type,
    ]);
    const newReaction = {
      id: reactionId,
      userId,
      commentId,
      reactionType,
      createdAt: new Date(),
    };
    pubsub.publish("REACTION_ADDED", { reactionAdded: newReaction });
    return result;
  } catch (error) {
    console.log(error);
  }
};

const loadComments = async (_, { projectId }) => {
  try {
    const result = await ExecuteStore("LoadComments", [projectId]);
    return result[0].map((row) => ({
      id: row.commentId,
      content: row.commentContent,
      x: row.positionX,
      y: row.positionY,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      replyCount: row.replyCount,
      reactionCount: row.reactionCount,
    }));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to load comments");
  }
};

const updateCommentPosition = async (_, { commentId, x, y }) => {
  try {
    const result = await ExecuteStore("UpdateCommentPosition", [
      commentId,
      x,
      y,
    ]);
    const updatedComment = {
      id: result[0][0].commentId,
      x: result[0][0].positionX,
      y: result[0][0].positionY,
    };

    // Phát sự kiện qua GraphQL Subscriptions
    pubsub.publish(COMMENT_POSITION_UPDATED, {
      commentPositionUpdated: updatedComment,
    });

    return updatedComment;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update comment position");
  }
};

export {
  addComment,
  addReply,
  addReaction,
  loadComments,
  updateCommentPosition,
};
