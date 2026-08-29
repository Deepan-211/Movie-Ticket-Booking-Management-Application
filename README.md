# MovieShow - Movie Ticket Booking Management

MovieShow is a full-stack web application designed to manage movie ticket booking requests. It mimics an enterprise-grade case management workflow (similar to Pega) where every ticket booking request is treated as a case that transitions through a structured lifecycle.

## Technology Stack
- **Backend**: Node.js, Express, Prisma (SQLite)
- **Frontend**: React, Tailwind CSS, Vite

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## User Stories & Implementation Mapping

This section explicitly maps each requested User Story to its implementation in the codebase.

### **US-001: Submit Movie Ticket Request**
- **Implementation:** Customer view in `App.tsx` (`<form onSubmit={handleBookSubmit}>`).
- **Route:** `POST /api/bookings` in `server.ts`.
- **Pega Concept:** "Create Case" step where initial data is collected.

### **US-002: Check Show Availability**
- **Implementation:** Handled synchronously inside the `POST /api/bookings` controller logic in `server.ts`. If `show.seatsAvailable < numTickets`, a 400 error is thrown.
- **Pega Concept:** Server-side validation rule / Decision shape advancing to "Availability Check" stage.

### **US-003: Calculate Booking Cost**
- **Implementation:** Frontend displays live calculation (`{numTickets * selectedShow.pricePerSeat}`). Backend derives it securely before saving (`const totalCost = show.pricePerSeat * numTickets`).
- **Pega Concept:** Declare Expression / Calculated field for data integrity.

### **US-004: Confirm Booking Request**
- **Implementation:** "Confirm & Send to Staff" screen triggers `handleConfirmBooking` in `App.tsx`.
- **Route:** `PUT /api/bookings/:id/confirm`.
- **Pega Concept:** User Assignment / Checkbox step advancing the flow.

### **US-005: Maintain Movie and Show Data**
- **Implementation:** "Catalog" toggle in the Staff Dashboard (`staffView === 'catalog'`). Provides full CRUD forms for adding/deleting Movies and Shows.
- **Routes:** `POST/PUT/DELETE /api/movies` and `/api/shows` in `server.ts`.
- **Pega Concept:** Data Types / Data Pages management portal.

### **US-006: Review Booking Details**
- **Implementation:** Staff Dashboard table (`staffView === 'cases'`) rendering all booking request records with relevant SLA badges.
- **Pega Concept:** Workbasket / Case Manager Dashboard.

### **US-007: Process Ticket Booking**
- **Implementation:** "Approve" and "Reject" buttons. Reject triggers a JS `prompt()` for a `rejectionReason`.
- **Route:** `PUT /api/bookings/:id/status`. Approval decrements `seatsAvailable`. Rejection sets status to "Rejected" and saves the reason.
- **Pega Concept:** Flow Action (Approve/Reject) routing logic.

### **US-008: Notify Booking Confirmation**
- **Implementation:** Dummy Nodemailer setup `sendEmail()` triggers inside the status update endpoint when case reaches "Resolved" or "Rejected".
- **Pega Concept:** Correspondence (Email notification) triggered by case resolution.

### **US-009: Define Booking SLA**
- **Implementation:** Logic in `App.tsx` comparing `booking.createdAt` to `new Date()`. Renders "Goal Missed" (Yellow) if >24 hrs, or "Deadline Missed" (Red) if >48 hrs.
- **Pega Concept:** SLA Rule associated with the case/stage, modifying urgency and setting visual flags.

### **US-010: Route Booking Request by Show Type**
- **Implementation:** On creation, `assignedQueue` is automatically derived based on `show.movie.showType`. The Staff Dashboard has a `<select>` filter for the Work Queue.
- **Pega Concept:** Work Queue Routing / Router based on when-conditions (Premium vs Standard).

---

## The Case Lifecycle (Pega Mapping)
1. **Initial Stage**: Customer selects tickets and enters details.
2. **Availability Check**: System validates ticket count against available seats.
3. **Approval**: Case waits in the Work Queue for Staff action.
4. **Booking Execution**: On Approval, seats are reserved/deducted in the DB.
5. **Resolved/Rejected**: Final resolution stage where Correspondence (email) fires.
