import { v4 as uuidv4 } from "uuid";
import { ExecuteStore } from "../../config/mysqlConfig.js";
import { liveblocks } from "../../server.mjs";
const addPageToProject = async (_, { projectId, name, content }) => {
  try {
    const pageId = uuidv4();

    // Validate metadata keys and values
    const metadata = {
      projectId: projectId,
      pageId: pageId,
      pageName: name,
    };

    Object.keys(metadata).forEach((key) => {
      if (key.length > 40) {
        throw new Error(`Metadata key "${key}" exceeds 40 characters.`);
      }
      const value = metadata[key];
      if (typeof value === "string" && value.length > 256) {
        throw new Error(
          `Metadata value for key "${key}" exceeds 256 characters.`
        );
      }
    });

    await ExecuteStore("AddPageToProject", [pageId, name, content, projectId]);

    const roomId = `project_${projectId}_page_${pageId}`;
    const room = await liveblocks.createRoom(roomId, {
      defaultAccesses: ["room:write"],
    });
    return {
      id: pageId,
      name,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error adding page to project:", error);
    throw new Error("Failed to add page to project");
  }
};

const getRoomsByProject = async (_, { projectId }) => {
  try {
    const rooms = await liveblocks.getRooms({
      query: {
        metadata: {
          projectId: projectId,
        },
      },
    });

    return rooms.data.map((room) => ({
      id: room.id,
      pageId: room.metadata.pageId,
      pageName: room.metadata.pageName,
      createdAt: room.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching rooms for project:", error);
    throw new Error("Failed to fetch rooms for project");
  }
};

export { addPageToProject, getRoomsByProject };
