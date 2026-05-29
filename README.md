# 🌍 TravelGenieAi
### AI-Powered Tourist Recommendation & Itinerary Platform

## 📖 Overview

**TravelGenieAi** is a full-stack, AI-powered travel recommendation platform that generates personalized, budget-optimized travel itineraries using Large Language Model (LLM) intelligence. Users simply input their origin, destination, travel dates, group size, and budget — and the system computes a complete, context-aware travel plan in seconds.

> *"Tell our LLM where you want to go, when, and your budget. We'll handle the rest."*

---

## ✨ Features

- 🤖 **LLM-Powered Engine** — Intelligent itinerary generation using Large Language Models and custom AI agents
- 🗺️ **Smart Destination Discovery** — Curated suggestions for 1000+ destinations across India and beyond
- 💰 **Budget-Aware Planning** — Four budget tiers (Budget / Standard / Premium / Luxury) with 100% cost optimization
- 👥 **Group-Size Intelligence** — Supports Adults, Children, and Infants with age-aware recommendations
- 📅 **Flexible Date Inputs** — Fixed date selection or flexible month-based travel preferences
- 📍 **Geolocation Origin Detection** — Auto-detects current location or allows manual metro-city selection
- 🔐 **Secure Auth System** — Full user Login / Sign Up flow with protected sessions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS |
| **AI / Intelligence** | Large Language Models, Custom AI Agent Orchestration |
| **Backend** | Node.js, Express.js |
| **Auth & Sessions** | JWT, Passport.js |
| **Database** | MongoDB (MVC Architecture) |
| **Deployment** | Vercel |
| **Image Optimization** | Structured compression pipeline |

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
MongoDB instance (local or Atlas)
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/travelgenie-ai.git
cd travelgenie-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
LLM_API_KEY=your_llm_api_key
SESSION_SECRET=your_session_secret
```

### Run Locally

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to view the app.

---

## 🗂️ Project Structure

```
travelgenie-ai/
├── controllers/          # Route handler logic (MVC)
├── models/               # MongoDB schema definitions
├── routes/               # Express route declarations
├── views/                # Frontend HTML templates
│   ├── index.html        # Main landing page
│   └── about.html        # About AI page
├── public/               # Static assets (CSS, JS, media)
│   └── test2.mp4         # Demo video
├── middleware/            # Auth & session middleware
├── .env.example          # Environment variable template
├── package.json
└── README.md
```

---

## 🧠 How the AI Works

1. **User Input Collection** — Origin, destination, dates, group composition, and budget tier are captured via the smart search UI.
2. **Context Construction** — All parameters are assembled into a structured prompt payload.
3. **LLM Processing** — The payload is dispatched to the LLM engine, which reasons over budget limits, geographical coordinates, travel duration, and group needs.
4. **Itinerary Generation** — A fully personalized, day-by-day travel plan is returned, covering transport, stay, and activity recommendations optimized within the specified budget.

---

## 🌐 Supported Destinations (Sample)

| Destination | Type |
|---|---|
| 🏔️ Manali, Himachal Pradesh | Mountain / Adventure |
| 🛶 Rishikesh, Uttarakhand | River Rafting & Camping |
| 🏖️ Goa, India | Beach & Leisure |
| 🏙️ Mumbai, Maharashtra | Metro / City Break |
| 🌆 Delhi, India | Heritage & Culture |

*1000+ curated destinations supported.*

---
## 🔒 Security

- All user sessions managed via **JWT tokens** with expiry
- Passwords handled through **Passport.js** secure authentication strategies
- Environment secrets isolated via **`.env`** — never committed to version control
- Input validation enforced on all API endpoints

---

## 🛣️ Roadmap

- [ ] Collaborative trip planning (multi-user sessions)
- [ ] Offline itinerary export (PDF download)
- [ ] Real-time weather integration per destination

---
