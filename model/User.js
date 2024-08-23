import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
