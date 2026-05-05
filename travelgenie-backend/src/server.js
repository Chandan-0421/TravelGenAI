// File: src/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recommendationRoutes from './routes/recommendation.routes.js'; // <-- NEW IMPORT
import { supabase } from './config/supabase.js'; // 🔥 Supabase import add kiya 🔥

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', message: 'TravelGenieAi Backend is running smoothly.' });
});

// APIs Routes <-- NEW ROUTE MOUNTED HERE
app.use('/api', recommendationRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server fired up and running on http://localhost:${PORT}`);
});

// 🔥 FETCH SAVED TRIP BY ID (Shareable Link Route) 🔥
app.get('/api/trip/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        
        // Hum format same rakh rahe hain taaki frontend ko dikkat na ho
        res.json({
            success: true,
            data: {
                itinerary: data.generated_itinerary,
                tripId: data.id,
                destination: data.destination,
                origin: data.origin,
                timing: data.timing,
                guests: data.guests,
                budget_limit: data.budget_limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


app.get('/api/supabase-config', (req, res) => {
    res.json({
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
    });
});

// 🔥 SECURE IMAGE FETCH ROUTE (UPDATED FOR BETTER RELEVANCY) 🔥
app.get('/api/images', async (req, res) => {
    try {
        const query = req.query.dest;
        
        // 🔥 MAIN CHANGE YAHAN HAI 🔥
        // 1. '+nature+travel' hata diya taaki sirf exact location search ho.
        // 2. 'order_by=relevant' add kar diya taaki sabse famous photos pehle aayein.
        const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${query}&client_id=${process.env.UNSPLASH_API_KEY}&per_page=3&orientation=landscape&order_by=relevant`);
        const data = await response.json();
        
        if (data.results && data.results.length >= 3) {
            res.json({
                success: true,
                images: [
                    data.results[0].urls.regular, 
                    data.results[1].urls.regular, 
                    data.results[2].urls.regular
                ]
            });
        } else {
            res.json({ success: false }); // Fallback ke liye
        }
    } catch (error) {
        console.error("Image fetch error:", error);
        res.status(500).json({ success: false });
    }
});