import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    phoneCode: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
  },
  { versionKey: false, timestamps: true },
);
const User = mongoose.model("user", userSchema);
//-------
export default User;
