
/**
 * CLIENTSCOUT AI - BACKEND SERVER
 * 
 * REQUIRED ENV VARS:
 * - PORT (default 3000)
 * - GEMINI_API_KEY
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - DATABASE_URL (postgres://user:pass@host:5432/dbname)
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for most cloud DBs
});

app.use(cors());

// --- STRIPE WEBHOOK ---
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userEmail = session.customer_email || session.customer_details?.email;

        if (userEmail) {
            console.log(`Upgrading user: ${userEmail}`);
            try {
                await pool.query(
                    "UPDATE users SET tier = 'PAID' WHERE email = $1",
                    [userEmail]
                );
            } catch (dbErr) {
                console.error("DB Error upgrading user:", dbErr);
            }
        }
    }

    res.send();
});

app.use(express.json());

// --- GEMINI PROXY ---
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    const userEmail = req.headers['x-user-email'];

    // Optional: Verify user tier in DB before searching to enforce server-side limits

    try {
        const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        // In a real deployment, you would move the specific chat/model logic here
        // For now, we assume the frontend is calling this to get data securely
        // Note: To fully secure the key, the 'searchBusinesses' logic from frontend
        // should be moved into this handler entirely.

        // For this prototype, we are just acknowledging the connection.
        // In production, move 'searchBusinesses' logic here.
        res.json({ message: "Search proxy active. Implementation requires moving logic from frontend." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- USER ROUTES ---

// Register / Create User
app.post('/api/register', async (req, res) => {
    const { name, companyName, email, phone, website } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (name, company_name, email, phone, website, tier, search_count)
             VALUES ($1, $2, $3, $4, $5, 'FREE', 1)
             ON CONFLICT (email) DO UPDATE 
             SET name = $1, company_name = $2, phone = $4, website = $5
             RETURNING *`,
            [name, companyName, email, phone, website]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Get Current User
app.get('/api/me', async (req, res) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ error: "No email provided" });

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Transform snake_case DB columns to camelCase for frontend
        const u = result.rows[0];
        const user = {
            name: u.name,
            companyName: u.company_name,
            email: u.email,
            phone: u.phone,
            website: u.website,
            tier: u.tier,
            searchCount: u.search_count
        };
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Increment Search Count
app.post('/api/track-search', async (req, res) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ error: "No email" });

    try {
        const result = await pool.query(
            "UPDATE users SET search_count = search_count + 1 WHERE email = $1 RETURNING *",
            [email]
        );
        const u = result.rows[0];
        // Return formatted user
        res.json({
            name: u.name,
            companyName: u.company_name,
            email: u.email,
            phone: u.phone,
            website: u.website,
            tier: u.tier,
            searchCount: u.search_count
        });
    } catch (err) {
        res.status(500).json({ error: "DB error" });
    }
});

// --- SERVE FRONTEND (Production) ---
const path = require('path');
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`ClientScout Backend running on port ${port}`);
});
