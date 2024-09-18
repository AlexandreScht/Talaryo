import { model, Schema } from 'mongoose';

const EmailSchema: Schema<EmailsDocument> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: [String],
    default: null,
    required: false,
  },
  lastName: {
    type: [String],
    default: null,
    required: false,
  },
  phone: {
    type: [String],
    default: null,
    required: false,
  },
});

// Export the UserModel
export const UserModel = model<EmailsDocument>('emails', EmailSchema);
