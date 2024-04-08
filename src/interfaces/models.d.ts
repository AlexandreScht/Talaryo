export type role = 'admin' | 'business' | 'pro' | 'free';
import type Stripe from 'stripe';
export interface User {
  id?: number;
  email: string;
  role: role;
  firstName?: string;
  lastName?: string;
  password?: string;
  validate: boolean;
  society?: string;
  accessToken?: string;
  refreshToken?: string;
  stripeCustomer?: string | Stripe.Customer | Stripe.DeletedCustomer;
  subscribe_status: 'active' | 'pending' | 'disable' | 'waiting';
  subscribe_start?: Date;
  subscribe_end?: Date;
  passwordReset?: boolean;
}

export interface Favoris {
  id?: number;
  userId?: number;
  link: string;
  desc: string;
  img: string;
  fullName: string;
  currentJob?: string;
  currentCompany?: string;
  disabled: boolean;
  favFolderId: number;
}

export interface searches {
  id?: number;
  userId?: number;
  searchFolderId?: number;
  searchQueries: string;
  name: string;
  society?: string;
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
}
export interface event {
  index: number;
  userId: number;
  eventName: string;
  value: string;
}
