# SmartLogix: Web-Based Logistics, Inventory, and Asset Tracking System

## System Overview
**SmartLogix** is a centralized web-based logistics, inventory, and asset tracking platform designed to streamline and improve how organizations manage the borrowing, returning, reservation, maintenance, and accountability of organizational assets.

By replacing traditional paper logbooks, physical signatures, and fragmented spreadsheets, SmartLogix integrates digital logbooks, verified user authentication, QR code identification, resource reservation calendar, automated notifications, and real-time analytics into a single cohesive system.

### Authors
- Carag, Kyle Ian David D.
- Miguel, Mark Ephraim Jr. B.
- Oloyede, Pelumi B.

---

## Target Users & Roles
1. **Administrators**: Manage users, roles, permissions, system settings, and overall system monitoring.
2. **Logistics / Property Officers**: Manage assets, releases, returns, inventory catalogs, digital logbooks, and maintenance schedules.
3. **Requesters / Borrowers**: Search available assets, submit borrowing requests, make reservations, receive assets, and view transaction history.
4. **Approvers**: Review, approve, or reject asset borrowing and reservation requests.
5. **Driver / Delivery Personnel (Optional)**: View assigned trips/deliveries and participate in authorized handoff procedures.

---

## Architectural Style & Microservices Architecture

SmartLogix adopts a **Microservices Architecture** combining MVC principles and Layered Architecture to ensure high scalability, resilience, maintainability, and independent deployability across system components.

### Presentation Layer
- **React Web Application** (`src/frontend`): Responsive user interface for interactive dashboards, QR code scanning, request/reservation management, and analytics reporting.

### Microservices Backend (Node.js REST APIs)
- **`auth-service`** (`src/backend/auth-service`): Handles user authentication, SSO integration, role-based access control (RBAC), and digital transaction signatures/logbook verification.
- **`inventory-service`** (`src/backend/inventory-service`): Manages asset catalogs, QR code generation & scanning, asset status tracking (Available, Reserved, Borrowed, Returned, Maintenance), condition reports, and reservation calendars.
- **`vehicle-service`** (`src/backend/vehicle-service`): Manages vehicle fleet schedules, trip tracking, driver assignments, and maintenance logs.
- **`notification-service`** (`src/backend/notification-service`): Dispatches automated in-app alerts, email notifications, and SMS updates (e.g., return deadlines, approval status, overdue notices) via webhooks or message brokers.

### Database Layer
- **PostgreSQL**: Persistent relational storage for user profiles, inventory catalogs, transaction timelines, audit trails, and vehicle logs.

---

## Project Structure
```
smartlogix/
├── assets/         # Images, logos, dynamically generated QR code graphics
├── config/         # Configuration files (PostgreSQL DB credentials, API keys)
├── docs/           # System documentation, architecture diagrams, matrices
├── src/
│   ├── frontend/   # Presentation Layer (React frontend)
│   └── backend/    # Node.js Microservices Layer
│       ├── auth-service/         # Authentication & Logbook Service
│       ├── inventory-service/    # Inventory & Asset Service
│       ├── vehicle-service/      # Vehicle Management Service
│       └── notification-service/ # Automated Notification Service
├── tests/          # Workflow & integration test suites
└── README.md       # Central system documentation
```
