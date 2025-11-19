
import { Business, User, SubscriptionTier } from '../types';
import { createChatSession, searchBusinesses, loadMoreBusinesses } from './gemini';

// CONFIGURATION
// Set to true to use the real backend
const USE_REAL_BACKEND = true;
const BACKEND_URL = '';

// Helper to get current email for auth headers
const getStoredEmail = () => {
    try {
        const stored = localStorage.getItem('clientScoutUser');
        if (stored) return JSON.parse(stored).email;
    } catch (e) { return null; }
    return null;
};

/**
 * USER SERVICE
 */
export const UserService = {
    getUser: async (): Promise<User | null> => {
        if (USE_REAL_BACKEND) {
            const email = getStoredEmail();
            if (!email) return null;

            try {
                const res = await fetch(`${BACKEND_URL}/api/me`, {
                    headers: { 'x-user-email': email }
                });
                if (!res.ok) return null;
                return res.json();
            } catch (e) {
                console.error("Backend connection failed", e);
                return null;
            }
        } else {
            // Mock
            const stored = localStorage.getItem('clientScoutUser');
            return stored ? JSON.parse(stored) : null;
        }
    },

    register: async (userData: Omit<User, 'tier' | 'searchCount'>): Promise<User> => {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const user = await res.json();
            // Save locally to persist the "session" (email)
            localStorage.setItem('clientScoutUser', JSON.stringify(user));
            return user;
        } else {
            const newUser: User = {
                ...userData,
                tier: SubscriptionTier.FREE,
                searchCount: 1
            };
            localStorage.setItem('clientScoutUser', JSON.stringify(newUser));
            return newUser;
        }
    },

    upgradeUser: async (user: User): Promise<User> => {
        if (USE_REAL_BACKEND) {
            // Re-fetch from server to check Stripe status
            return (await UserService.getUser()) || user;
        } else {
            const updated = { ...user, tier: SubscriptionTier.PAID };
            localStorage.setItem('clientScoutUser', JSON.stringify(updated));
            return updated;
        }
    },

    incrementSearchCount: async (user: User): Promise<User> => {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${BACKEND_URL}/api/track-search`, {
                method: 'POST',
                headers: { 'x-user-email': user.email }
            });
            return res.json();
        } else {
            const updated = { ...user, searchCount: user.searchCount + 1 };
            localStorage.setItem('clientScoutUser', JSON.stringify(updated));
            return updated;
        }
    },

    logout: () => {
        localStorage.removeItem('clientScoutUser');
        localStorage.removeItem('clientScoutLists');
    }
};
