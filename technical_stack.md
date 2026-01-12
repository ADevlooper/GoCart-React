# Technical Stack & Dependencies

This document provides a comprehensive overview of the technologies and dependencies used in the **Voice Genie / BakeYourByte** project.

## 🏗️ Backend Architecture

The backend is built using a modern **Node.js** environment, focusing on performance, scalability, and ease of maintenance.

### Core Technologies
*   **Node.js**: The runtime environment that executes JavaScript code outside a web browser, allowing for scalable network applications.
*   **Express.js**: A minimal and flexible Node.js web application framework used to build the RESTful API endpoints, handle routing, and manage middleware.
    *   *Usage*: Defining API routes (e.g., `/api/products`), handling HTTP requests/responses.

### Database & Data Management
*   **PostgreSQL**: A powerful, open-source object-relational database system.
    *   *Usage*: Primary data store for users, products, orders, etc.
*   **Drizzle ORM**: A lightweight TypeScript/JavaScript ORM (Object Relational Mapper) used to interact with the database.
    *   *Usage*: Defining database schemas (`db/schema.js`) and performing type-safe queries (inserts, selects, updates) without writing raw SQL.
*   **pg**: Non-blocking PostgreSQL client for Node.js.
    *   *Usage*: Underlies Drizzle ORM to establish the actual connection pool to the PostgreSQL database.
*   **Supabase (Client)**: *(If applicable based on `package.json`)* A backend-as-a-service platform.
    *   *Usage*: Likely providing the hosted PostgreSQL database or used for specific features like storage/auth if integrated.

### Security
*   **Bcryptjs / Bcrypt**: Libraries for hashing passwords.
    *   *Usage*: Securely hashing user passwords before storing them in the database and verifying them during login.
*   **JsonWebToken (JWT)**: A standard for securely transmitting information between parties as a JSON object.
    *   *Usage*: creating "access tokens" for user authentication. Validates that a user is logged in for protected routes.
*   **Cors**: Middleware to enable Cross-Origin Resource Sharing.
    *   *Usage*: Allows the Frontend (running on a different port) to communicate safely with the Backend API.

### File Handling & Utilities
*   **Multer**: Middleware for handling `multipart/form-data`.
    *   *Usage*: Handling file uploads, specifically for uploading product images.
*   **Sharp**: High-performance image processing library.
    *   *Usage*: Resizing, formatting, and optimizing uploaded images (e.g., creating thumbnails and previews) before storage.
*   **Dotenv**: Zero-dependency module that loads environment variables.
    *   *Usage*: Loading sensitive configuration (API keys, DB credentials) from a `.env` file.

---

## 💻 Frontend Architecture

The frontend is a dynamic Single Page Application (SPA) built to ensure a responsive and interactive user experience.

### Core Framework & Build Tool
*   **React (v19)**: The library for building the user interface.
    *   *Usage*: Component-based UI development (Pages, Navbars, Product Cards).
*   **Vite**: A build tool that aims to provide a faster and leaner development experience for modern web projects.
    *   *Usage*: Serves the application during development with Hot Module Replacement (HMR) and bundles the app for production.

### State Management & Routing
*   **Redux Toolkit / React-Redux**: Standard way to write Redux logic.
    *   *Usage*: Managing global application state (User session, Cart items, Theme application) cleanly and efficiently.
*   **React Router DOM**: Declarative routing for React web applications.
    *   *Usage*: Handling navigation between pages (e.g., `/services`, `/cart`, `/admin/products`) without reloading the page.

### Styling & UI
*   **Tailwind CSS**: A utility-first CSS framework.
    *   *Usage*: Styling the application rapidly using utility classes (e.g., `flex`, `p-4`, `text-red-500`) directly in the markup.
*   **Lucide React**: Examples of open-source icons.
    *   *Usage*: Providing consistent and lightweight SVG icons (Accessiblity icons, Menu icons, Action buttons like Edit/Delete).

### Utilities
*   **Axios**: Promise-based HTTP client.
    *   *Usage*: Making API requests to the backend (fetching products, logging in users).
*   **JSPDF & HTML2Canvas**: Libraries for PDF generation.
    *   *Usage*: Generating downloadable PDF documents, such as Invoices or Booking Confirmations, directly from the browser DOM.

---

## 🛠️ Development Tools
*   **Nodemon**: A utility that monitors for any changes in your source and automatically restarts your server.
    *   *Usage*: Improving backend development speed by removing the need to manually restart the server after changes.
*   **ESLint**: A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
    *   *Usage*: Enforcing code quality and consistency.
