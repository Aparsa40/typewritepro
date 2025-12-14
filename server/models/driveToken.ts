import mongoose from 'mongoose';

const DriveTokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  accessTokenEncrypted: { type: String },
  refreshTokenEncrypted: { type: String },
  expiresAt: { type: Number },
  scope: { type: String },
  tokenType: { type: String },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

export const DriveToken = (mongoose.models.DriveToken as mongoose.Model<any>) || mongoose.model('DriveToken', DriveTokenSchema);
export default DriveToken;
