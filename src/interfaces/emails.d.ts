interface EmailsDocument extends Document {
  _id: string;
  email: string;
  firstName?: string | string[];
  lastName?: string | string[];
  phone?: string | string[];
}
