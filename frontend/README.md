# React Frontend Client - Campus Resell Portal

This is the user interface client for the Campus Resell & Lost-Found Portal, built using **Vite**, **React**, and **Tailwind CSS v4**.

---

## Technical Stack

- **Framework Builder**: Vite v8 + React v18
- **Styling**: Tailwind CSS v4 (integrated via `@tailwindcss/vite` plugin)
- **Routing**: React Router DOM (protected route layouts)
- **API client**: Axios (custom client instance with global authorization headers)
- **Real-Time Client**: StompJS + SockJS (subscribes to `/user/queue/messages` WebSocket topics)
- **Icons**: Lucide React

---

## Directory Structure

```text
frontend/
├── src/
│   ├── api.js                # Custom Axios instance with interceptors for JWT
│   ├── App.jsx               # Main React application shell and route definitions
│   ├── main.jsx              # Application mount entrypoint
│   ├── index.css             # Core CSS stylesheet importing Tailwind CSS
│   ├── components/           # Core Layout components
│   │   ├── Header.jsx        # Top logo, user info block, and desktop controls
│   │   ├── Sidebar.jsx       # Left navigation links for larger viewports
│   │   └── BottomNav.jsx     # Mobile-adapted bottom tab navigation
│   ├── context/              # Context Providers
│   │   └── AuthContext.jsx   # Global login/signup states & WS connection listeners
│   └── pages/                # App Page views
│       ├── Landing.jsx       # Public marketing page
│       ├── LoginRegister.jsx # Signup & Signin panel (with .edu.in validation)
│       ├── Dashboard.jsx     # Product marketplace listings with filters & query logging
│       ├── ProductDetails.jsx# Resell item view with recommendation shelves & flagging
│       ├── SellItem.jsx      # Upload form for selling products (with image uploads)
│       ├── Inbox.jsx         # Message board with real-time WebSocket chat threads
│       ├── Profile.jsx       # Profile editor and user's listing controls
│       ├── LostFound.jsx     # Lost & Found listings board (with Claimed toggles)
│       ├── UploadLostFound.ja# Report form for Lost/Found items (free-text locations)
│       └── AdminDashboard.j# Admin panel for flag moderation & analytics charts
├── vite.config.js            # Vite configuration defining proxy mapping port 8082
└── package.json              # Node.js dependencies and scripts
```

---

## Development Proxies

Vite is configured to forward requests to the Spring Boot backend server (running on port `8082`):
- `/api/**` -> Proxied to `http://localhost:8082`
- `/uploads/**` -> Proxied to `http://localhost:8082`
- `/ws/**` -> WebSockets proxied to `ws://localhost:8082`

This solves CORS challenges during local development.

---

## How to Run

Navigate to the `/frontend` directory:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Build for Production
To bundle and verify the build compilation:
```bash
npm run build
```
The static files will build into the `/dist` directory.
