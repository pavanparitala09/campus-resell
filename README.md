# Campus Resell & Lost-Found Portal

A secure, campus-centric marketplace and lost-and-found application designed for college students. Students can list items for sale, report lost/found belongings with free-text location tagging, start real-time STOMP WebSocket chats with other students, receive notifications, and verify their campus identity.

---

## Project Highlights

- **Trusted Environment**: Registration is strictly limited to verified college emails ending in `.edu.in`.
- **Resell Marketplace**: Add, edit, browse, search, filter, and sort product listings within the student community.
- **Lost & Found System**: Report lost or found items with image uploads and free-text location tags. Listings automatically expire and auto-delete 7 days after being marked as "Claimed".
- **Real-Time WebSocket Chat**: In-app private chats powered by Spring WebSocket STOMP broker. Includes offline notification triggers and unread badge sync.
- **Dual Storage Engine**: Automatically uploads images to **Cloudinary** for scalable web delivery, falling back to local file storage if no Cloudinary URL is configured.
- **Auto-Seeded Admin User**: On startup, an admin profile is pre-configured with:
  - **Email**: `23eg112e52@anurag.edu.in`
  - **Password**: `pavan@9963`

---

## Directory Structure

```text
campus-resell-portal/
├── backend/                  # Spring Boot 3.3.0 REST API (Java 21)
│   ├── src/main/java/        # Java Source Code
│   ├── src/main/resources/   # Application configs & H2/Postgres configurations
│   └── build.gradle          # Gradle dependencies build file
├── frontend/                 # Vite + React Client
│   ├── src/                  # React components, context, and pages
│   ├── vite.config.js        # Vite build configurations with backend proxies
│   └── package.json          # Node dependencies and execution scripts
├── docker-compose.yml        # PostgreSQL & pgAdmin local setup
└── .env                      # Global environment configurations
```

---

## Configuration (`.env`)

Create a `.env` file in the root directory. Here is the configuration template:

```env
# Database Configurations (used if PostgreSQL profile active)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_resell
DB_USER=postgres
DB_PASSWORD=postgres

# Security Configurations
JWT_SECRET=campusResellSecretKeyMustBeVeryLongToMeetHmacShaRequirements32BytesLength
JWT_EXPIRATION=86400000

# Server Port
PORT=8082

# Mail Server Configurations (Optional, prints OTP to console if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloud Storage Configurations (Optional, falls back to local storage if unset)
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# App Modes
APP_DEV_MODE=true
```

---

## Setup & Running the Application

### 1. Prerequisite: Local Database (Optional)
If you wish to use PostgreSQL, launch it using Docker:
```bash
docker compose up -d
```
*(If Docker/Postgres is not running, you can boot the backend with the H2 In-Memory profile as shown below for zero-setup execution).*

### 2. Running the Spring Boot Backend
Navigate to the `/backend` directory:
- **Run with H2 In-Memory Database (Default/Recommended for local testing)**:
  ```powershell
  .\gradlew.bat bootRun --args='--spring.profiles.active=h2'
  ```
- **Run with PostgreSQL Database**:
  ```powershell
  .\gradlew.bat bootRun
  ```

The server will start on port `8082` (by default).

### 3. Running the Frontend React Application
Navigate to the `/frontend` directory:
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. All requests to `/api/*`, `/uploads/*`, and `/ws/*` will be proxied to the backend automatically.
