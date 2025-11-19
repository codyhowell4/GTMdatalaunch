
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultsTable } from './components/ResultsTable';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './components/Dashboard';
import { Business, SearchStatus, User, SubscriptionTier, SavedList } from './types';
import { createChatSession, searchBusinesses, loadMoreBusinesses } from './services/gemini';
import { UserService } from './services/api';
import { deduplicateBusinesses, downloadCSV } from './utils/helpers';
import type { ChatSession } from '@google/generative-ai';
import { AlertCircle, Plus, Loader2, SearchX } from 'lucide-react';

// CONFIG: Replace with your actual Stripe Payment Link
const STRIPE_PAYMENT_LINK = '' as string;
// CONFIG: Replace with your actual Stripe Customer Portal Link
const STRIPE_PORTAL_LINK = 'https://billing.stripe.com/p/login/...' as string;

function App() {
    // --- User & Auth State ---
    const [user, setUser] = useState<User | null>(null);
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);

    // Modals
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [currentView, setCurrentView] = useState<'search' | 'dashboard'>('search');

    // --- Search State ---
    const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [results, setResults] = useState<Business[]>([]);
    const [currentQuery, setCurrentQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [guestSearchCount, setGuestSearchCount] = useState(0);
    const chatSessionRef = useRef<ChatSession | null>(null);

    // --- Init ---
    useEffect(() => {
        // Load User from Service (Local or Backend)
        UserService.getUser().then(u => {
            if (u) setUser(u);
        });

        const storedLists = localStorage.getItem('clientScoutLists');
        const storedGuestCount = localStorage.getItem('guestSearchCount');

        if (storedLists) setSavedLists(JSON.parse(storedLists));
        if (storedGuestCount) setGuestSearchCount(parseInt(storedGuestCount));

        // Check for Stripe Success Return
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
            UserService.getUser().then(async (existingUser) => {
                if (existingUser) {
                    const upgraded = await UserService.upgradeUser(existingUser);
                    setUser(upgraded);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setCurrentView('dashboard');
                }
            });
        }
    }, []);

    // Persist Lists & Guest Count
    useEffect(() => {
        localStorage.setItem('clientScoutLists', JSON.stringify(savedLists));
    }, [savedLists]);

    useEffect(() => {
        localStorage.setItem('guestSearchCount', guestSearchCount.toString());
    }, [guestSearchCount]);


    // --- Handlers ---

    const handleSearch = async (query: string) => {
        // 1. Check Limits
        const isGuest = !user;
        const isFree = user?.tier === SubscriptionTier.FREE;

        if (isGuest && guestSearchCount >= 1) {
            setShowAuthModal(true);
            return;
        }

        if (isFree && user.searchCount >= 1) {
            setShowPricingModal(true);
            return;
        }

        // 2. Proceed with Search
        setStatus(SearchStatus.LOADING);
        setError(null);
        setResults([]);
        setCurrentQuery(query);
        setCurrentView('search');

        try {
            chatSessionRef.current = createChatSession();
        } catch (e: any) {
            setStatus(SearchStatus.ERROR);
            setError(e.message);
            return;
        }

        try {
            if (!chatSessionRef.current) return;
            const data = await searchBusinesses(chatSessionRef.current, query);
            setResults(data);
            setStatus(SearchStatus.SUCCESS);

            // Increment Counts
            if (isGuest) setGuestSearchCount(prev => prev + 1);
            if (user) {
                const updated = await UserService.incrementSearchCount(user);
                setUser(updated);
            }

        } catch (err: any) {
            setStatus(SearchStatus.ERROR);
            setError(err.message || "An unexpected error occurred while scouting clients.");
        }
    };

    const handleLoadMore = async () => {
        if (!chatSessionRef.current) return;
        setLoadingMore(true);
        try {
            const newData = await loadMoreBusinesses(chatSessionRef.current);
            if (newData.length > 0) {
                setResults(prev => deduplicateBusinesses(prev, newData));
            }
        } catch (err: any) {
            console.error("Failed to load more:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    // --- Gate Handlers ---

    const handleExportRequest = () => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            saveAndDownload(results);
        }
    };

    const saveAndDownload = (data: Business[]) => {
        const newList: SavedList = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            query: currentQuery,
            itemCount: data.length,
            results: data
        };
        setSavedLists(prev => [newList, ...prev]);
        downloadCSV(data, `leads-${currentQuery.replace(/\s+/g, '-').slice(0, 20)}.csv`);
    };

    const handleRegister = async (userData: Omit<User, 'tier' | 'searchCount'>) => {
        const newUser = await UserService.register(userData);
        setUser(newUser);
        setShowAuthModal(false);
        if (results.length > 0) saveAndDownload(results);
    };

    const handleLogin = (email: string) => {
        // Simulation of login
        const stored = localStorage.getItem('clientScoutUser');
        if (stored) {
            const u = JSON.parse(stored);
            if (u.email.toLowerCase() === email.toLowerCase()) {
                setUser(u);
                setShowLoginModal(false);
                return;
            }
        }
        // If no user found in simulation
        alert("In this demo version, user data is stored in your browser. No previous account found for this browser.");
    };

    const handleUpgrade = () => {
        if (STRIPE_PAYMENT_LINK && !STRIPE_PAYMENT_LINK.startsWith('http')) {
            alert("Please configure your Stripe Link in App.tsx");
            return;
        }

        if (STRIPE_PAYMENT_LINK) {
            window.location.href = STRIPE_PAYMENT_LINK;
        } else {
            // Demo Mode
            if (user) {
                UserService.upgradeUser(user).then(u => setUser(u));
                setShowPricingModal(false);
            }
        }
    };

    const handleBilling = () => {
        if (STRIPE_PORTAL_LINK && STRIPE_PORTAL_LINK.startsWith('http')) {
            window.location.href = STRIPE_PORTAL_LINK;
        } else {
            alert("Configure STRIPE_PORTAL_LINK in App.tsx to allow users to manage billing.");
        }
    };

    const handleLogout = () => {
        UserService.logout();
        setUser(null);
        setSavedLists([]);
        setResults([]);
        setGuestSearchCount(0);
        localStorage.removeItem('guestSearchCount'); // Optional: reset guest limit on logout for demo
        setCurrentView('search');
    };

    // --- Render ---

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Configure Banner (Demo Only) */}
            {!STRIPE_PAYMENT_LINK && (
                <div className="bg-indigo-600 text-white text-xs text-center py-1 px-4">
                    <strong>Developer Mode:</strong> Payments are simulated. Add your <code>STRIPE_PAYMENT_LINK</code> in <code>App.tsx</code> to go live.
                </div>
            )}

            <Header
                user={user}
                onLogout={handleLogout}
                onShowDashboard={() => setCurrentView('dashboard')}
                onShowSearch={() => setCurrentView('search')}
                onUpgrade={() => setShowPricingModal(true)}
                onLogin={() => setShowLoginModal(true)}
                onBilling={handleBilling}
                currentView={currentView}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {currentView === 'search' ? (
                    <>
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Find Your Ideal Clients
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Scrape real-time business data from Google Maps using natural language.
                            </p>
                        </div>

                        <SearchBar onSearch={handleSearch} isLoading={status === SearchStatus.LOADING} />

                        {/* Status Messages */}
                        {status === SearchStatus.ERROR && error && (
                            <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start gap-3 animate-fade-in">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {status === SearchStatus.SUCCESS && results.length === 0 && !error && (
                            <div className="max-w-3xl mx-auto mb-8 p-8 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center text-center animate-fade-in shadow-sm">
                                <div className="bg-amber-100 p-3 rounded-full mb-4">
                                    <SearchX className="h-8 w-8 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-amber-900">No Results Found</h3>
                                <p className="text-amber-800 mt-2 max-w-md">
                                    We couldn't find any businesses matching your request. Try broadening your search terms or location.
                                </p>
                            </div>
                        )}

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="space-y-6">
                                <ResultsTable results={results} onExport={handleExportRequest} />

                                <div className="flex justify-center pb-8">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Finding more...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                Load More Results
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Dashboard savedLists={savedLists} />
                )}

            </main>

            {/* Modals */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onRegister={handleRegister}
            />

            <PricingModal
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                onUpgrade={handleUpgrade}
                isDemoMode={!STRIPE_PAYMENT_LINK}
            />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
            />

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} ClientScout AI. Data provided by Google Maps Platform via Gemini.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
