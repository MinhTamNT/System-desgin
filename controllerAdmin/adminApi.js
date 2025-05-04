import { ExecuteStore, pool } from "../config/mysqlConfig.js";

const getAllUser = async () => {
  try {
    const [res] = await ExecuteStore("User_GetAllUser")
    return res;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } 
};

const deleteUserById = async (idUser) => {
  try {
    const [res] = await ExecuteStore("USER_DeleteUserByID" , [idUser])
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  } 
};

export { getAllUser, deleteUserById };
