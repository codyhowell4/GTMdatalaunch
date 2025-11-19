export interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  rating: string;
  googleMapsUrl: string;
}

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface SearchState {
  status: SearchStatus;
  results: Business[];
  error: string | null;
}

export enum SubscriptionTier {
  GUEST = 'GUEST',
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface User {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  tier: SubscriptionTier;
  searchCount: number;
}

export interface SavedList {
  id: string;
  date: string;
  query: string;
  itemCount: number;
  results: Business[];
}