import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      maxlength: 25,
    },

    lastName: {
      type: String,
      maxlength: 25,
    },

    profileImageURL: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      maxlength: 322,
    },

    emailVerified: {
      type: Boolean,
      default: false,
      // required: true,
    },

    password: {
      type: String,
      maxlength: 66,
    },

    salt: {
      type: String,
    },

  },
  {
    timestamps: true, // we are manually handling timestamps
  }
);



const User = mongoose.model("User", userSchema);
export default User;