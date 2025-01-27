import { ExecuteStore, pool } from "../../config/mysqlConfig.js";
import User from "../../model/User.js";
import { CHECK_USER_EXISTS, SEARCH_USER_NAME } from "../../Query/user.js";
const checkUserExists = async (name) => {
  const [rows] = await pool.query(CHECK_USER_EXISTS, [name]);
  return rows.length > 0;
};

const addNewUser = async (
  args, 
  { idUser, name, profilePicture, email, tokenUser, expireAt },
  context
) => {
  try {
    const existingUser = await User.findOne({ uuid: idUser });
    if (!existingUser) {
      const newUser = new User({
        name,
        profilePicture,
        uuid: context?.uuid,
      });
      await newUser.save();
    }
    // console.log("Received tokenUser:", context);
    const result = await ExecuteStore("UserProfile_AddUser", [
      context?.uuid,
      profilePicture,
      context?.token,
      expireAt,
      name,
      email,
    ]);

    if (result) {
      console.log(result[0][0].retCode);
    }
    return [
      {
        idUser: result[1][0].idUser,
        profilePicture: result[1][3].profilePicture,
        email: result[1][4].email,
      },
      {
        retCode: result[0][0].retCode,
        retMessage: retMessresult[0][1].retMessage,
      },
    ];
  } catch (error) {
    return [
      {
        retCode: -1,
        retMessage: "Error adding user: " + error.message,
      },
    ];
  }
};

const SearchUserByName = async (_, { searchText }) => {
  let connect;
  try {
    connect = await pool.getConnection();
    await connect.beginTransaction();
    const [resut] = await connect.query(SEARCH_USER_NAME, [`%${searchText}%`]);
    return resut;
  } catch (error) {
    console.error("Error searching user:", error);
    throw error;
  } finally {
    if (connect) connect.release();
  }
};

export { addNewUser, SearchUserByName };
