# Spring Boot Backend - Campus Resell Portal

This is the backend API service for the Campus Resell & Lost-Found Portal, built using **Spring Boot 3.3.0** and **Java 21**.

---

## Technical Stack

- **Core Framework**: Spring Boot, Spring MVC (REST APIs)
- **Database Layer**: Spring Data JPA, Hibernate, H2 (In-memory development) / PostgreSQL (Production)
- **Security**: Spring Security 6, JWT (JSON Web Tokens), BCrypt Password Hashing
- **Real-Time Communication**: Spring WebSocket messaging with STOMP broker
- **File Uploads**: Cloudinary Java SDK with a local folder fallback
- **Scheduling**: Spring `@Scheduled` cron jobs (handles 7-day auto-deletion worker)

---

## Package Directory Structure

All java code resides in `src/main/java/com/campusresell/portal/`:

```text
com/campusresell/portal/
├── PortalApplication.java      # Application main entrypoint & Admin user seeder
├── config/                     # Web MVC configuration and WebSocket brokers
│   ├── WebConfig.java          # Static resources path mapping for local uploads
│   └── WebSocketConfig.java    # STOMP WebSocket configurations
├── controller/                 # REST Controller Endpoints
│   ├── AdminController.java    # Moderation & Analytics statistics
│   ├── AuthController.java     # Signup, login, profile updates
│   ├── ChatController.java     # WS Chat thread initialization and history fetch
│   ├── LostFoundController.java# Lost & Found listings CRUD
│   ├── NotificationController.j# Notification lists and read status toggles
│   └── ProductController.java  # Resell marketplace listings CRUD
├── dto/                        # Data Transfer Objects (Request/Response schemas)
├── model/                      # JPA Database Entities
│   ├── User.java, Product.java, Chat.java, Message.java, Notification.java,
│   ├── LostFoundItem.java, LostFoundImage.java, etc.
│   └── UserRole.java (USER, ADMIN)
├── repository/                 # Database Query Access Interfaces (JPA / JPQL)
├── security/                   # Spring Security & JWT Verification Filters
│   ├── CustomUserDetails.java  # Custom UserDetails mapper
│   ├── CustomUserDetailsService# Database authentication provider mapper
│   ├── JwtAuthenticationFilter # Request JWT interceptor filter
│   ├── JwtTokenProvider.java   # JWT parser and generator class
│   └── SecurityConfig.java     # CORS, CSRF, and Request Matchers configuration
└── service/                    # Core Business Logic services
    ├── AuthService.java        # User creation and authentication session manager
    ├── ChatService.java        # Messaging, user notification, and WebSocket broadcasts
    ├── FileStorageService.java # Cloudinary file uploads with local fallbacks
    ├── LostFoundService.java   # Lost & found management and auto-delete scheduled cron
    ├── MailService.java        # Fallback console OTP logger
    └── ProductService.java     # Marketplace listings queries and recommendations
```

---

## Core Configuration & Database Profiles

The application is configured in `src/main/resources/`:

- **`application.yml`**: Parsed configurations, JWT signing secret key, multipart upload size limits, and email server parameters.
- **`application-h2.yml`**: H2 In-Memory active settings (active when profile `h2` is selected).
- **CommandLine seeding**: On startup, `PortalApplication.java` verifies and seeds the default admin user `23eg112e52@anurag.edu.in` with password `pavan@9963`.

---

## How to Build & Run

### Compile and Verify code
To run Gradle checks and compile:
```bash
./gradlew compileJava
```

### Run Server locally (H2 Database)
```bash
./gradlew bootRun --args='--spring.profiles.active=h2'
```

### Run Server locally (PostgreSQL)
Ensure Postgres is running via Docker or natively, then run:
```bash
./gradlew bootRun
```
The server binds to port `8082`.
