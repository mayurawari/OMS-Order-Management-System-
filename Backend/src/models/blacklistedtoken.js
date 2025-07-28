import { model, Schema } from "mongoose";

const blacklistedTokenSchema = new Schema({
  exptoken: { type: String, required: true },
});

const BlacklistedToken = model("BlacklistedToken", blacklistedTokenSchema);

export default BlacklistedToken;