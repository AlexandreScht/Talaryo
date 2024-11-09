import { Document } from 'mongoose';
import type Stripe from 'stripe';

export interface UserSchema {
  id?: number;
  email: string;
  role: role;
  firstName?: string;
  lastName?: string;
  password?: string;
  validate: boolean;
  society?: string;
  accessToken?: string;
  twoFactorType?: twoFactorType;
  accessCode?: string;
  stripeCustomer?: string | Stripe.Customer | Stripe.DeletedCustomer;
  subscribe_status: 'active' | 'pending' | 'disable' | 'waiting';
  subscribe_start?: Date;
  subscribe_end?: Date;
  passwordReset?: string;
}

export interface Favoris {
  id?: number;
  userId?: number;
  link?: string;
  pdf?: string;
  resume: string;
  img: string;
  email?: string | boolean;
  fullName: string;
  currentJob?: string;
  currentCompany?: string;
  locked?: boolean;
  deleted?: boolean;
  favFolderId: number;
}

export interface searches {
  id?: number;
  userId?: number;
  searchFolderId?: number;
  searchQueries: string;
  name: string;
  locked?: boolean;
  deleted?: boolean;
  society?: string;
  isCv?: boolean;
}

export interface searchFolders {
  id?: number;
  userId?: number;
  name: string;
}

export interface favFolders {
  id?: number;
  userId?: number;
  name: string;
}
export interface scores {
  id?: number;
  year: number;
  userId: number;
  month: number;
  day: number;
  searches?: number;
  profils?: number;
  cv: number;
  mails?: number;
}
export interface event {
  id: number;
  userId: number;
  eventName: string;
  value?: string;
  send?: boolean;
  text?: string;
  eventId: string;
  date: string;
}

interface MongoDocument extends Document {
  _id: string;
  email: string;
  firstName?: string | string[];
  lastName?: string | string[];
  phone?: string | string[];
}
