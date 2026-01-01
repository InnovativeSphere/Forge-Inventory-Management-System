# Inventory Management System (IMS)

A full‑stack Inventory Management System built with **Next.js**, **Redux Toolkit**, and a RESTful backend. The project focuses on real‑world data flow: products, stock, sales, suppliers, and users are tightly connected, reactive, and driven by API state rather than static or mock data.

This repository represents an end‑to‑end implementation, from schema design to frontend state orchestration and deployment.

---

## Tech Stack

### Frontend

* **Next.js** (App Router)
* **TypeScript**
* **Redux Toolkit** (Slices + Async Thunks)
* **Axios** (API layer)
* **Tailwind CSS** (UI styling)

### Backend (Assumed / Integrated)

* **Node.js + Express**
* **MongoDB + Mongoose**
* **JWT Authentication**

### Deployment

* **Vercel** (Frontend)
* **GitHub** (Version Control)

---

## Core Concepts

This project is intentionally designed around **data dependency and reactivity**, not isolated pages.

Key ideas:

* No hard‑coded UI data
* Redux slices are the single source of truth
* Components react to API state changes
* Stock updates propagate automatically after sales

---

## Data Models & Dependencies

The system revolves around a few core schemas that depend on each other.

### Product

Represents an item that can be stocked and sold.

**Key fields:**

* `_id`
* `name`
* `sku`
* `price`
* `category`
* `supplier`
* `currentStock`

**Dependencies:**

* Referenced by **StockHistory**
* Referenced by **Sales**

---

### Supplier

Represents the source of products.

**Key fields:**

* `_id`
* `name`
* `contactInfo`

**Dependencies:**

* Referenced by **Product**

---

### Sale

Represents a completed transaction.

**Key fields:**

* `_id`
* `product`
* `quantitySold`
* `totalPrice`
* `createdAt`

**Dependencies:**

* References **Product**
* Triggers **StockHistory** creation
* Updates `currentStock` on Product

---

### StockHistory

Tracks every stock mutation (increase or decrease).

**Key fields:**

* `_id`
* `product`
* `change`
* `reason` (sale, restock, adjustment)
* `createdAt`

**Dependencies:**

* References **Product**
* Created automatically after **Sales** or restocks

---

## Redux Architecture

Each domain has its own slice:

* `productSlice`
* `supplierSlice`
* `saleSlice`
* `stockHistorySlice`
* `authSlice`

### Async Thunks

All API communication happens through `createAsyncThunk`.

Examples:

* `fetchAllProducts`
* `createSale`
* `fetchAllStockHistory`

Key characteristics:

* Centralized error handling
* Token‑aware API calls
* Sorted and filtered server responses
* No UI‑side data manipulation hacks

---

## Reactivity & Data Flow

### Sale → Stock → UI

1. User creates a sale
2. Backend:

   * Creates Sale record
   * Updates Product stock
   * Creates StockHistory entry
3. Frontend:

   * `createSale` thunk resolves
   * StockHistory thunk refetches
   * Dashboard updates automatically

No manual refresh. No fake data.

---

## Dashboard Logic

The dashboard intentionally shows **latest activity**, not static slices.

* Recent sales sorted by `createdAt`
* Stock history limited to latest entries
* Redux state drives rendering

Sorting and limiting is handled in thunks to keep components clean.

---

## Authentication

* JWT‑based authentication
* Token stored client‑side
* Thunks optionally consume token
* Protected API routes

---

## Project Structure

```
/app
/components
/redux
  /slices
  /store.ts
/api
/utils
```

Clear separation between:

* UI
* State
* API logic

---

## Build & Deployment

### Local Build

```bash
npm install
npm run build
```

### Deployment (Vercel)

* Push to GitHub
* Import repo into Vercel
* Set environment variables
* Automatic CI/CD on push

---

## What Makes This Project Solid

* Real data relationships
* Predictable state management
* Scalable slice architecture
* No UI‑only logic shortcuts
* Production‑ready deployment flow

---

## Why This Architecture

This Inventory Management System was deliberately designed around **clear separation of concerns**, **predictable data flow**, and **scalability without premature complexity**. Every architectural choice was made to solve a real problem encountered during development, not to chase trends.

### 1. Clear Domain Separation

Each core business concept is modeled explicitly:

* **Product**: Source of truth for stock quantities and pricing
* **Sale**: Represents revenue-generating events
* **StockHistory**: Immutable audit log of all inventory changes
* **User**: Actor responsible for actions
* **Supplier / Category**: Contextual organization layers

This prevents logic leakage. Sales do not "mutate" products directly; they *trigger* controlled stock updates which are then logged. That distinction is critical for traceability and debugging.

### 2. Immutable Stock History (Audit-First Design)

Stock changes are never inferred. Every adjustment, restock, sale, or reversal creates a **StockHistory record**.

Benefits:

* Full audit trail
* Easy rollback analysis
* Accurate historical reporting
* No silent data corruption

This mirrors real-world inventory systems where **history matters more than current state**.

### 3. Redux as the Single Source of UI Truth

Redux slices mirror backend domains one-to-one:

* `productSlice`
* `salesSlice`
* `stockHistorySlice`
* `userSlice`

Async thunks handle **all side effects**, ensuring:

* Predictable state updates
* UI reacts to data, not assumptions
* No hidden API calls inside components

Components stay dumb. Slices stay authoritative. Life stays manageable.

### 4. Event-Driven Mental Model (Without Overengineering)

While not using message queues or event buses, the system follows an **event-driven mindset**:

* A Sale is an event
* That event causes a Stock decrement
* That decrement creates a StockHistory record

This keeps the system extensible. Adding notifications, analytics, or webhooks later won’t require rewriting core logic.

### 5. API-First, Frontend-Agnostic Backend

The backend exposes clean REST endpoints with no frontend assumptions. The frontend consumes data exactly as an external client would.

Benefits:

* Future mobile or admin apps can reuse the API
* Frontend refactors won’t break backend logic
* Easier testing and debugging

### 6. Next.js for Real-World Tradeoffs

Next.js was chosen not for hype, but for balance:

* Fast development
* API routes colocated with frontend
* Easy deployment on Vercel
* Production-ready build pipeline

This keeps infrastructure friction low while still allowing growth.

### 7. Built to Be Finished, Not Abandoned

This architecture favors **completion over perfection**:

* No unnecessary abstractions
* No premature microservices
* No fragile magic

Everything here can scale, but nothing here blocks progress.

---

## Future Improvements

* Role-based access control (RBAC)
* Transaction-safe stock operations
* Server-side pagination for large datasets
* Automated tests (unit + integration)
* Webhook or notification system for low stock alerts
