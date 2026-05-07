import Groq from "groq-sdk";
import dotenv from "dotenv";
import { supabase } from '../config/supabase.js'; 
import { Redis } from '@upstash/redis';

dotenv.config();

// 1. Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 🔥 Initialize Groq API 🔥
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const validateTravelData = (data) => {
  const { origin, destination, timing, guests, budget_limit } = data;
  if (!origin || !destination || !timing || !guests || !budget_limit) {
    throw new Error("Missing required travel data fields.");
  }
};

export const getTravelItinerary = async (travelData) => {
  try {
    validateTravelData(travelData);

    const {
      origin,
      destination,
      timing,
      guests,
      budget_limit,
      theme = "General",
      language = "English",
      user_id = null
    } = travelData;

    // 🔥 CACHE KEY GENERATOR 🔥
    const cacheKey = `trip:${origin}-${destination}-${timing}-${budget_limit}-${language}`
        .replace(/\s+/g, '') // saare space hata dega
        .toLowerCase();

    let responseContent = null;
    let successfulModel = "";

    // 🔥 STEP 1: CHECK REDIS CACHE 🔥
    console.log(`🔍 Checking Redis Cache for: ${cacheKey}...`);
    const cachedItinerary = await redis.get(cacheKey);

    if (cachedItinerary) {
        console.log(`🚀 CACHE HIT! Examiner shocked! Returning trip in 1 second!`);
        responseContent = cachedItinerary; 
    } else {
        console.log(`🐌 CACHE MISS! Trip first time search ho rahi hai. Calling Groq AI...`);

        // 👇 YAHAN SE TERA EXACT PURANA LOGIC START HOTA HAI 👇
        const totalGuests = (guests.adult || 0) + (guests.child || 0);

        let numericBudget = 15000;
        if (budget_limit.toLowerCase().includes("any")) {
            numericBudget = 500000; // 'Any Budget' matlab full Luxury (5 Lakh)
        } else {
            const digitMatches = budget_limit.match(/\d+(?:,\d+)*/g);
            numericBudget = digitMatches ? parseInt(digitMatches[digitMatches.length - 1].replace(/,/g, ""), 10) : 15000;
        }

        // 🔥 FIX 2: INTERNATIONAL TRAVEL = COMPULSORY FLIGHTS 🔥
        const transportStrategy = numericBudget >= 40000 || budget_limit.toLowerCase().includes("any")
          ? "Budget is high/luxury. You MUST explicitly suggest FLIGHTS for faster travel, along with premium cabs." 
          : "Budget is tight. Suggest Train + Bus combos, BUT if the destination is an INTERNATIONAL country (e.g., Thailand, Dubai, Europe) or requires crossing oceans, you MUST suggest FLIGHTS because trains/buses are impossible or impractical.";

        const impossibleLogic = `CRITICAL IMPOSSIBLE BUDGET CHECK: If the budget of ₹${numericBudget} is practically IMPOSSIBLE for a multi-day trip from ${origin} to ${destination} (e.g., international flights alone cost more than the limit , ₹500 is not even enough for basic transport), you MUST set Status to "Impossible Budget" and state the realistic amount needed. . In the Optimizer Suggestions, clearly state this is impossible and provide a REALISTIC MINIMUM BUDGET needed.`;

        const prompt = `You are TravelGenieAi, an enthusiastic and highly knowledgeable local tourist guide.

Traveler Details:
- 📍 Origin: ${origin}
- 🗺️ Destination: ${destination}
- 📅 Dates: ${timing}
- 👥 Guests: ${totalGuests} (Adults: ${guests.adult}, Children: ${guests.child})
- 💰 Budget Limit: ${budget_limit} (Max Limit: ₹${numericBudget})
- 🎭 Vibe/Theme: ${theme}
- 🗣️ Output Language: ${language}

CRITICAL INSTRUCTIONS:
1. THEME CUSTOMIZATION: Tailor activities strictly around the selected vibe/theme: "${theme}". 
2. ${transportStrategy}
3. ${impossibleLogic}
4. 🔥 DOOR-TO-DOOR JOURNEY RULE (CRITICAL): Your itinerary MUST be a complete door-to-door experience. 
   - For "Day 1", the "🌅 Morning" section MUST start with the traveler departing from their home in ${origin}, traveling to the EXACT specific transit hub, the journey to ${destination}, and checking into the hotel.
   - For the VERY LAST DAY, the "🌙 Evening" section MUST explicitly guide the traveler to check out, head to the EXACT station/airport, and travel safely back home to ${origin}.
5. 🔥 EXACT TRANSIT HUBS RULE (CRITICAL): Never just use the city name for departures or arrivals (e.g., do not just say "Nagpur" or "Bihar"). You MUST specify the EXACT main railway station, main bus terminal, or airport name for both ${origin} and ${destination} (e.g., "Nagpur Junction Railway Station", "Patna Junction", "Chhatrapati Shivaji Maharaj Terminus", etc.).
6. 🔥 LANGUAGE & HEADINGS RULE (CRITICAL): You MUST write all the descriptions, tips, and paragraph content in ${language}. HOWEVER, you MUST keep ALL main headings, subheadings, and labels STRICTLY IN ENGLISH (e.g., "## 🌟 Top Things To See & Do", "## Day 1:", "## 💰 Smart Budget Tracker", "Transport:", "Stay:", "Activities:"). If you translate the structural words/headings, the frontend system will CRASH!
7. 🔥 EXTREME DETAIL RULE: DO NOT give short 1-line answers. Even when writing in ${language}, you MUST write long, highly detailed, and enthusiastic paragraphs (at least 3-4 sentences per bullet point).
8. 🔥 CRITICAL MATH RULE: You are a strict calculator. To calculate the "Estimated Cost", you MUST ADD the "ROUND TRIP Journey Cost" AND ALL "Day-wise Budget" expenses. You MUST compare this TOTAL SUM against the limit of ₹${numericBudget}.
9. 🔥 BOLD LOCATIONS RULE: You MUST wrap EVERY specific location, monument, cafe, restaurant, street, and landmark in **double asterisks** to make it bold!

Format EXACTLY like this, in this exact order:

## 🌟 Top Things To See & Do
* **[Category e.g., Heritage/Beach]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description in ${language} explaining its history, what to do there, and why it is famous. Make it exciting!]
* **[Category e.g., Adventure/Nature]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description in ${language} explaining its history, what to do there, and why it is famous.]
* **[Category e.g., Culture/Shopping]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description in ${language} explaining its history, what to do there, and why it is famous.]

## 🗓️ Best Time To Visit
* **Peak Season:** [Months] | [Write 2-3 highly detailed sentences in ${language} explaining the exact weather conditions and why tourists flock here.]
* **Off-Season:** [Months] | [Write 2-3 highly detailed sentences in ${language} explaining what to expect and what kind of traveler it suits.]
* **Top Festival:** [Festival Name] | [Write 1-2 detailed sentences in ${language} about the festival.]

## 🛤️ Journey Strategy (${origin} to ${destination} & Return)
* **Cheapest & Best Route:** [Provide the exact travel route in ${language}, explicitly naming the EXACT stations/airports involved]
* **Recommended Transport:** [Flight / Train / Bus / Mixed]
* **Estimated Travel Cost:** ₹[Approx. ROUND TRIP cost for ALL guests combined] (Details: Onward Journey (e.g., Train ₹X + Bus ₹Y) + Return Journey (e.g., Train ₹X + Bus ₹Y) = Total ₹Z. Keep labels in English!)
* **Budget Feasibility:** [State in ${language} if the budget is comfortable, tight, or impossible]

## Day 1: [Exciting Title for the Day in ${language}]
* **🌅 Morning:** [Start with leaving home in ${origin} and heading to the specific named station/airport. Write 3 to 4 LONG sentences in ${language}. MUST contain **bold** locations.]
* **☀️ Afternoon:** [Write 3 to 4 LONG sentences in ${language}. MUST contain **bold** locations.]
* **🌙 Evening:** [Write 3 to 4 LONG sentences in ${language}. MUST contain **bold** locations.]
* **💡 Local Secret:** [Write a hidden gem in ${language}...]

## Day 2: [Exciting Title for the Day in ${language}]
[Repeat the exact same structure for Day 2. Repeat for ALL remaining days. For the LAST DAY, ensure the Evening section explicitly covers checking out, heading to the exact named station/airport, and the return journey back to ${origin} in ${language}.]

## 🏨 Recommended Stays
* **Budget:** **[Hotel/Hostel Name]** | ₹[Price] | [Amenities] | [Description in ${language}]
* **Mid-Range:** **[Hotel Name]** | ₹[Price] | [Amenities] | [Description in ${language}]
* **Luxury:** **[Hotel Name]** | ₹[Price] | [Amenities] | [Description in ${language}]

## 🎒 Packing Essentials
* **[Item]:** [Why it is needed in ${language}]

## 💰 Smart Budget Tracker
* **Your Limit:** ₹${numericBudget}
* **Estimated Cost:** ₹[Put Calculated Cost Here]
* **Status:** [Write EXACTLY "Under Budget", "Over Budget", or "Impossible Budget" in English]

## 📊 Day-wise Budget Distribution
* **Day 1:** ₹[DayTotal] (Transport: ₹[Cost], Food: ₹[Cost], Stay: ₹[Cost], Activities: ₹[Cost])
* **Day 2:** ₹[DayTotal] (Transport: ₹[Cost], Food: ₹[Cost], Stay: ₹[Cost], Activities: ₹[Cost])
[Repeat for ALL days. Keep words like "Transport", "Food", "Stay", "Activities" STRICTLY in English!]

## 🛠️ Smart Optimizer Suggestions
[If Status is "Impossible Budget", state the minimum realistic budget needed in ${language}. If "Over Budget", list 3 bullet points in ${language} on how to save money. If "Under Budget", write: * Great! You are on track.]

Respond keeping structure in English but content in ${language}.`;

        console.log(`🤖 Generating itinerary using Groq API with Multi-Model Fallback...`);
        // 🔥 TEEN POWERFUL GROQ MODELS ARRAY MEIN DAAL DIYE 🔥
        const modelsToTry = [
            "llama-3.3-70b-versatile", 
            "llama-3.1-8b-instant", 
            "gemma2-9b-it"
        ];
        
        // Loop chalega har model par jab tak success na mil jaye
        for (const modelName of modelsToTry) {
            try {
                console.log(`⏳ Trying model: ${modelName}...`);
                const result = await groq.chat.completions.create({
                  messages: [
                    {
                      role: "system",
                      content: "You strictly follow formatting rules. Use bullet points."
                    },
                    {
                      role: "user",
                      content: prompt
                    }
                  ],
                  model: modelName, 
                });
                
                responseContent = result.choices[0]?.message?.content;
                
                if (responseContent) {
                    successfulModel = modelName;
                    break; // ✅ Agar response mil gaya, toh aage ke models try mat karo (loop tod do)
                }
           } catch (modelError) {
                // 🔥 AB HUMEIN TERMINAL MEIN ASLI ERROR DIKHEGA 🔥
                console.warn(`⚠️ Model ${modelName} failed. Reason: ${modelError.message}`);
            }
        }

        if (!responseContent) throw new Error("All Groq API models failed to generate a response. Please try again.");
        
        console.log(`✅ Response generated successfully using: Groq (${successfulModel})`);

        // 🔥 STEP 2: SAVE TO REDIS CACHE 🔥
        await redis.set(cacheKey, responseContent, { ex: 604800 });
        console.log(`💾 Saved new trip to Redis Cache successfully!`);
    }

    // 🔥 SUPABASE ME DATA INSERT KARNE KA LOGIC (ALWAYS RUNS) 🔥
    let savedTripId = null;
    try {
        console.log(`📡 Saving trip to Supabase Database...`);
        const { data, error } = await supabase
            .from('trips')
            .insert([
                {
                    origin: travelData.origin,
                    destination: travelData.destination,
                    timing: travelData.timing,
                    guests: travelData.guests,
                    budget_limit: travelData.budget_limit,
                    generated_itinerary: responseContent,
                    user_id: travelData.user_id
                }
            ])
            .select();

        if (error) {
            console.error("❌ Supabase Insert Error:", error);
        } else {
            savedTripId = data[0].id;
            console.log("✅ Trip Saved to Supabase successfully! ID:", savedTripId);
        }
    } catch (dbError) {
        console.error("❌ Database Catch Error:", dbError);
    }
    
    // Ab hum Text ke sath Supabase ki ID bhi bhej rahe hain!
    return { itinerary: responseContent, tripId: savedTripId };

  } catch (error) {
    console.error("❌ Groq Service Error:", error);
    throw new Error(error.message || "Failed to generate itinerary");
  }
};