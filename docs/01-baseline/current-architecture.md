# Foodify — Current Architecture (Baseline)

**Status:** Pre-optimization  
**Purpose:** Establish a factual baseline of the system before any load testing
or system design changes.

This document describes **how Foodify works today**, not how it *should* work.

---

## 1. Problem Overview

Foodify is a food ordering application that allows users to:
- browse restaurants
- view menus
- search food items
- place food orders
- track order status

The system currently targets **low traffic** and is in an early-stage setup.

---

## 2. High-Level Architecture

Foodify follows a **simple monolithic architecture**.

[ Client (Browser) ]
|
v
[ Frontend (React) ]
|
v
[ Backend API ]
|
v
[ Database ]


All requests are handled synchronously.

---

## 3. Tech Stack (As-Is)

### Frontend
- Framework: React
- Styling: Tailwind CSS
- Communication: REST APIs (HTTP)

### Backend
- Runtime: Node.js
- Framework: Express (as currently implemented)
- API Style: REST
- Authentication: Auth0, JWT 

### Database
- Database: MongoDB (current choice)
- ODM: Mongoose
- Single database instance

### Infrastructure
- Deployment: Render
- Single backend instance
- No load balancer
- No CDN
- No caching layer

---

## 4. Request Flow

Example: Fetch restaurants

1. Client sends HTTP request to backend
2. Backend processes request synchronously
3. Backend queries the database
4. Database returns results
5. Backend responds to client

There is **no async processing** or background job execution.

---

## 5. Key API Endpoints (Baseline)

| Endpoint | Method | Description |
|--------|--------|-------------|
| `/api/restaurants` | GET | List restaurants |
| `/api/restaurants/:id` | GET | Restaurant details |
| `/api/restaurants/:id/menu` | GET | Menu items |
| `/api/search` | GET | Search food or restaurants |
| `/api/orders` | POST | Create an order |
| `/api/orders/:id` | GET | Get order status |

> No endpoint-level performance metrics are collected yet.

---

## 6. Data Model (High-Level)

Core entities:
- Users
- Restaurants
- Menu Items
- Orders

Embedded entities:
- Menu Items (owned by Restaurants)
Relationships are managed directly by the backend application.

---

## 7. Current Characteristics

### What Exists
- Single service handling all responsibilities
- Direct database access per request
- Stateless backend
- Basic error handling

### What Does NOT Exist (Yet)
- No caching (in-memory or Redis)
- No rate limiting
- No background workers
- No message queue
- No retries or circuit breakers
- No performance monitoring

---

## 8. Operating Assumptions (Baseline)

- Low number of concurrent users
- No strict latency SLA
- Manual scaling if needed
- Single-region deployment

These assumptions will be **validated or broken** through load testing.

---

## 9. Scope Boundaries

This document intentionally:
- ❌ does NOT propose improvements
- ❌ does NOT predict bottlenecks
- ❌ does NOT include future architecture

Those will be added **only after real load is applied**.

---

## 10. Next Step

The next step is to:
1. Apply controlled load to the system
2. Measure latency, errors, and throughput
3. Document observed behavior

This baseline will be used as the reference point for all future changes.

