import Groq from "groq-sdk";
import dotenv from "dotenv";
import { supabase } from '../config/supabase.js'; // 🔥 Supabase import add kiya 🔥

dotenv.config();

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

    const totalGuests = (guests.adult || 0) + (guests.child || 0);
    
    const digitMatches = budget_limit.match(/\d+(?:,\d+)*/g);
    const numericBudget = digitMatches ? parseInt(digitMatches[digitMatches.length - 1].replace(/,/g, ""), 10) : 15000;

    const transportStrategy = numericBudget >= 20000 
      ? "Budget is high (₹20,000+). You CAN and SHOULD suggest Flights for faster travel, along with premium cabs." 
      : "Budget is tight (< ₹20,000). STRICTLY AVOID flights. Suggest Train + Bus combos or sleeper buses to save money.";

    const impossibleLogic = `CRITICAL IMPOSSIBLE BUDGET CHECK: If the budget of ₹${numericBudget} is practically IMPOSSIBLE for a multi-day trip from ${origin} to ${destination} (e.g., ₹500 is not even enough for basic transport), you MUST set Status to "Impossible Budget". In the Optimizer Suggestions, clearly state this is impossible and provide a REALISTIC MINIMUM BUDGET needed.`;

    const prompt = `You are TravelGenieAi, an enthusiastic and highly knowledgeable local tourist guide.

Traveler Details:
- 📍 Origin: ${origin}
- 🗺️ Destination: ${destination}
- 📅 Dates: ${timing}
- 👥 Guests: ${totalGuests} (Adults: ${guests.adult}, Children: ${guests.child})
- 💰 Budget Limit: ${budget_limit} (Max Limit: ₹${numericBudget})
- 🎭 Vibe/Theme: ${theme}

CRITICAL INSTRUCTIONS:
1. THEME CUSTOMIZATION: Tailor activities strictly around the selected vibe/theme: "${theme}". 
2. ${transportStrategy}
3. ${impossibleLogic}
4. GENERATE ALL DAYS: Create a detailed itinerary for ALL DAYS. Do NOT stop at Day 1.
5. Do NOT use tables. Write in a clean travel blog style using bullet points.
6. 🔥 BOLD LOCATIONS RULE: You MUST wrap EVERY specific location, monument, cafe, restaurant, street, and landmark in **double asterisks** to make it bold!

Format EXACTLY like this, in this exact order:

## 🌟 Top Things To See & Do
* **[Category e.g., Heritage/Beach]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description explaining its history, what to do there, and why it is famous. Make it exciting!]
* **[Category e.g., Adventure/Nature]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description explaining its history, what to do there, and why it is famous. Make it exciting!]
* **[Category e.g., Culture/Shopping]:** **[Place Name]** | [Write a highly detailed 3-4 sentence description explaining its history, what to do there, and why it is famous. Make it exciting!]

## 🗓️ Best Time To Visit
* **Peak Season:** [Months] | [Write 2-3 highly detailed sentences explaining the exact weather conditions, the vibe of the city, and why tourists flock here during this time. Do NOT write just a few words.]
* **Off-Season:** [Months] | [Write 2-3 highly detailed sentences explaining what to expect, such as heavy rains, extreme cold, or budget-friendly opportunities, and what kind of traveler it suits.]
* **Top Festival:** [Festival Name] | [Write 1-2 detailed sentences about the festival, when it happens, and how it transforms the destination.]

## 🛤️ Journey Strategy (${origin} to ${destination})
* **Cheapest & Best Route:** [Provide the exact travel route]
* **Recommended Transport:** [Flight / Train / Bus / Mixed]
* **Estimated Travel Cost:** ₹[Approx. cost to reach the destination] (Details: Transport Name ₹...)
* **Budget Feasibility:** [State if the budget is comfortable, tight, or impossible]

## Day 1: [Exciting Title for the Day]
* **🌅 Morning:** [Write 3 to 4 LONG sentences. MUST contain **bold** locations.]
* **☀️ Afternoon:** [Write 3 to 4 LONG sentences. MUST contain **bold** locations.]
* **🌙 Evening:** [Write 3 to 4 LONG sentences. MUST contain **bold** locations.]
* **💡 Local Secret:** [Write a hidden gem...]

## Day 2: [Exciting Title for the Day]
[Repeat the exact same structure for Day 2. Repeat for ALL remaining days.]

## 🏨 Recommended Stays
* **Budget:** **[Hotel/Hostel Name]** | ₹[Price] | [Amenities] | [Description]
* **Mid-Range:** **[Hotel Name]** | ₹[Price] | [Amenities] | [Description]
* **Luxury:** **[Hotel Name]** | ₹[Price] | [Amenities] | [Description]

## 🎒 Packing Essentials
* **[Item]:** [Why it is needed]

## 💰 Smart Budget Tracker
* **Your Limit:** ₹${numericBudget}
* **Estimated Cost:** ₹[Put Calculated Cost Here]
* **Status:** [Write EXACTLY "Under Budget", "Over Budget", or "Impossible Budget"]

## 📊 Day-wise Budget Distribution
* **Day 1:** ₹[DayTotal] (Transport: ₹[Cost], Food: ₹[Cost], Stay: ₹[Cost], Activities: ₹[Cost])
* **Day 2:** ₹[DayTotal] (Transport: ₹[Cost], Food: ₹[Cost], Stay: ₹[Cost], Activities: ₹[Cost])
[Repeat for ALL days of the itinerary]

## 🛠️ Smart Optimizer Suggestions
[If Status is "Impossible Budget", state the minimum realistic budget needed. If "Over Budget", list 3 bullet points on how to save money. If "Under Budget", write: * Great! You are on track.]

Respond in ${language}.`;

    console.log(`🤖 Generating itinerary using Groq API with Multi-Model Fallback...`);
    
    // 🔥 TEEN POWERFUL GROQ MODELS ARRAY MEIN DAAL DIYE 🔥
    // 🔥 TEEN NAYE AUR SABSE POWERFUL ACTIVE GROQ MODELS 🔥
    const modelsToTry = [
        "llama-3.3-70b-versatile", 
        "llama-3.1-8b-instant", 
        "gemma2-9b-it"
    ];
    let responseContent = null;
    let successfulModel = "";

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
    
   // 🔥 SUPABASE ME DATA INSERT KARNE KA LOGIC 🔥
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