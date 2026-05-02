import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAuthCode extends Document {
  code: string;
  userId: Types.ObjectId;
  clientId: string;
  redirectUri: string;
  expiresAt: Date;
  createdAt: Date;
}

const authCodeSchema = new Schema<IAuthCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    clientId: {
      type: String,
      required: true,
      index: true,
    },

    redirectUri: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index (auto delete)
    },
  },
  {
    timestamps: true, // adds createdAt
  },
);

const AuthCode = mongoose.model<IAuthCode>("AuthCode", authCodeSchema);
export default AuthCode;
