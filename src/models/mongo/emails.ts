import { MongoDocument } from '@/interfaces/models';
import { model, Schema } from 'mongoose';

const MongoSchema: Schema<MongoDocument> = new Schema({
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
export const MongoModel = model<MongoDocument>('emails', MongoSchema);
