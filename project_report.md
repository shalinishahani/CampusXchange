# CampusXchange — Full Project Report

> **A student marketplace built for Indian college campuses.**  
> This report explains what the project is, what we built, how we built it, and all the tools we used — written so that anyone can understand it.

---

## 1. What Is CampusXchange?

**CampusXchange** is a web application that allows college students to **buy and sell second-hand items** within their campus community.

**The problem it solves:**  
College students frequently have items they no longer need — textbooks from last semester, old laptops, cycles, lab equipment, or hostel supplies — but there was no trusted, student-specific place to sell them. CampusXchange is that place.

**How it works in plain English:**
1. A student registers with their email.
2. They can post items they want to sell (with photos, price, and condition).
3. Other students can browse all listings, filter by category, and find what they need.
4. Interested buyers contact the seller directly via email using their college email address.
5. The transaction happens in person on campus.

---

## 2. Technology Stack (What We Used and Why)

Think of a web app like a building. The **frontend** is what you see (the walls, doors, furniture). The **backend** is what keeps it standing (the foundation, electricity, plumbing). The **database** is where all your data is stored (like a filing cabinet).

### Frontend (What the user sees)

| Technology | What It Is | Why We Used It |
|---|---|---|
| **React 19** | A JavaScript library for building UIs | Industry standard for building interactive web pages |
| **TypeScript** | JavaScript with strict type checking | Catches bugs before the code even runs |
| **TailwindCSS v4** | A utility-first CSS framework | Makes styling fast and consistent |
| **shadcn/ui** | A set of pre-built, accessible UI components | Gives us buttons, cards, modals, and forms that look great |
| **Radix UI** | Accessible headless component primitives | Powers the dropdowns, dialogs, and tabs under shadcn/ui |
| **Lucide React** | Icon library | Provides clean, consistent icons throughout the app |
| **Sonner** | Toast notification library | Gives the user feedback like "Listing posted!" or "Error saving." |

### Routing and Data (How pages connect and data is fetched)

| Technology | What It Is | Why We Used It |
|---|---|---|
| **TanStack Router** | File-based routing for React | Handles navigation between pages with full TypeScript type safety |
| **TanStack Start** | Full-stack React framework | Allows Server-Side Rendering (SSR) for better SEO and performance |
| **TanStack Query** | Server state management | Fetches and caches data from Supabase efficiently |
| **Nitro** | Server runtime | Runs the server-side part of the app (used for Cloudflare deployment) |
| **Vite** | Development and build tool | Makes development very fast with instant hot-reloads |

### Backend & Database

| Technology | What It Is | Why We Used It |
|---|---|---|
| **Supabase** | An open-source Firebase alternative | Provides our database, authentication, storage, and APIs all in one place |
| **PostgreSQL** | The relational database behind Supabase | Stores all users, products, wishlists, notifications, and reports |

---

## 3. Database Structure (What Data We Store)

The application stores data in several **tables** in a Supabase PostgreSQL database. Here is what each table does:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE TABLES                          │
├─────────────┬───────────────────────────────────────────────────┤
│ profiles    │ Stores information about each registered user.    │
│             │ Fields: name, college, email, phone, bio,         │
│             │ department, year, profile picture.                │
├─────────────┼───────────────────────────────────────────────────┤
│ products    │ Every item listed for sale.                       │
│             │ Fields: title, description, price, category,      │
│             │ condition, images, status (available/sold),       │
│             │ seller_id (who posted it).                        │
├─────────────┼───────────────────────────────────────────────────┤
│ wishlists   │ Items a user has saved/hearted.                   │
│             │ Fields: user_id, product_id.                      │
├─────────────┼───────────────────────────────────────────────────┤
│ notifications│ In-app alerts for users.                         │
│             │ Fields: title, message, link, is_read, user_id.   │
├─────────────┼───────────────────────────────────────────────────┤
│ reports     │ Flagged/reported listings for admin review.       │
│             │ Fields: product_id, reporter_id, reason.          │
├─────────────┼───────────────────────────────────────────────────┤
│ user_roles  │ Defines whether a user is "admin" or "user".      │
└─────────────┴───────────────────────────────────────────────────┘
```

> **Note:** The `messages` table (originally used for in-app chat) was identified and removed during our Phase 2 cleanup in favour of direct email contact between students.

---

## 4. Project Folder Structure

```
college-trunk-trade/
│
├── public/                         ← Static assets served as-is
│   ├── campusxchange-logo.png      ← Browser tab favicon
│   └── campusxchange-icon.png      ← Navbar and brand icon
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          ← Top navigation bar
│   │   │   └── Footer.tsx          ← Page footer
│   │   ├── ui/                     ← All shadcn/ui components (buttons, cards, etc.)
│   │   ├── ProductCard.tsx         ← The card shown for each listing
│   │   └── ThemeToggle.tsx         ← Dark/Light mode switch
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx             ← Manages the logged-in user session
│   │   └── useWishlist.ts          ← Manages wishlist state
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts           ← Supabase connection setup
│   │       └── types.ts            ← TypeScript types auto-generated from the database
│   │
│   ├── lib/
│   │   ├── marketplace.ts          ← Utility functions (formatting prices, dates, initials)
│   │   └── storage.ts              ← Resolves image URLs from Supabase Storage
│   │
│   ├── routes/                     ← Every page in the app (file = route)
│   │   ├── __root.tsx              ← Root layout: sets up the Navbar, Footer, and favicon
│   │   ├── index.tsx               ← Homepage (/)
│   │   ├── auth.tsx                ← Login / Register page (/auth)
│   │   ├── products.index.tsx      ← Browse all listings (/products)
│   │   ├── products.$productId.tsx ← Single listing detail page (/products/:id)
│   │   ├── about.tsx               ← About page
│   │   ├── contact.tsx             ← Contact page
│   │   ├── privacy.tsx             ← Privacy policy page
│   │   ├── reset-password.tsx      ← Password reset page
│   │   └── _authenticated/         ← All pages that REQUIRE login
│   │       ├── route.tsx           ← Auth guard (redirects logged-out users)
│   │       ├── dashboard.tsx       ← User dashboard (/dashboard)
│   │       ├── sell.tsx            ← Post a new listing (/sell)
│   │       ├── my-listings.tsx     ← Manage own listings (/my-listings)
│   │       ├── profile.tsx         ← Edit profile (/profile)
│   │       ├── settings.tsx        ← Account settings (/settings)
│   │       ├── wishlist.tsx        ← Saved items (/wishlist)
│   │       ├── notifications.tsx   ← In-app notifications (/notifications)
│   │       └── admin.tsx           ← Admin panel (/admin) — admin only
│   │
│   └── styles.css                  ← Global styles and CSS variables
│
├── .env                            ← Environment variables (Supabase keys — never committed to Git)
├── vite.config.ts                  ← Vite configuration
├── package.json                    ← All project dependencies and scripts
└── tsconfig.json                   ← TypeScript configuration
```

---

## 5. All Pages / Features Built

### Public Pages (Anyone Can Access)

| Page | URL | What It Does |
|---|---|---|
| **Homepage** | `/` | Landing page with hero section and CTAs to browse or register |
| **Browse Listings** | `/products` | Shows all available products; supports search, category filter, condition filter, price range, and sorting |
| **Product Detail** | `/products/:id` | Shows full listing details: photos, price, description, seller info, phone number, and "Email Seller" button |
| **Login / Register** | `/auth` | Two-tab form to sign in or create an account; supports Google OAuth |
| **About** | `/about` | Information about the platform |
| **Contact** | `/contact` | Contact form or info page |
| **Privacy Policy** | `/privacy` | Legal privacy policy page |
| **Reset Password** | `/reset-password` | Allows users to set a new password via email link |

### Protected Pages (Login Required)

| Page | URL | What It Does |
|---|---|---|
| **Dashboard** | `/dashboard` | Welcome screen with stats: active listings, wishlist count, recent activity |
| **Sell an Item** | `/sell` | Form to post a new listing with title, description, price, category, condition, and image upload |
| **My Listings** | `/my-listings` | View, edit, delete, or mark listings as "Sold" |
| **Profile** | `/profile` | Edit display name, college, bio, department, year, phone number, and profile picture |
| **Settings** | `/settings` | Account-level settings |
| **Wishlist** | `/wishlist` | All items you've saved by clicking the heart icon |
| **Notifications** | `/notifications` | In-app alerts about wishlist and listing activity |
| **Admin Panel** | `/admin` | Visible only to admin accounts; can view all users, products, and reports |

---

## 6. Key Features Explained

### 🔐 Authentication
- Email + password registration/login via Supabase Auth.
- Google OAuth ("Continue with Google") supported.
- All protected routes automatically redirect unauthenticated users to the login page.
- Password reset via email link.

### 🛍️ Product Listings
- Sellers fill in a form with the item's details and upload images.
- Images are stored in **Supabase Storage** (a cloud file storage service).
- Products have a `status` field — either `available` or `sold`.

### 🔍 Search, Filter & Sort
- Real-time search by product title.
- Filter by: Category, Condition, Price Range.
- Sort by: Newest, Price Low-to-High, Price High-to-Low.
- All filters are reflected in the URL so they can be shared/bookmarked.

### ❤️ Wishlist
- Logged-in users can "heart" any listing to save it.
- The wishlist syncs with the database so it persists across devices.

### 📧 Direct Seller Contact
- Instead of an in-app chat (which was removed to keep the app simple), buyers contact sellers directly via **email**.
- Clicking "Email Seller" opens the user's default email app with the seller's address pre-filled.
- Phone numbers (if provided in the seller's profile) are also shown to logged-in buyers.
- This eliminates the need for any backend messaging infrastructure.

### 🌓 Dark / Light Mode
- A toggle in the Navbar lets users switch between dark and light themes.
- The preference is saved in the browser.

### 🛡️ Admin Panel
- Admin accounts (manually set in the database) can access `/admin`.
- Provides a view over all users, products, and reported listings.

---

## 7. Work Done — Phase by Phase

### Phase 1: Setup, Branding & Cleanup

This was the first major phase. The project was originally generated from a Lovable template called "Campus Marketplace". We transformed it into a clean, professional product:

| What We Did | Files Changed |
|---|---|
| Renamed all text from "CampusMarket" / "Campus Marketplace" to **CampusXchange** | 23 files |
| Updated the browser tab favicon with the new logo | `__root.tsx` |
| Replaced the in-app brand icon in the Navbar with the custom `campusxchange-icon.png` | `Navbar.tsx` |
| Fixed 8 TypeScript errors in routing and navigation | `Navbar.tsx`, `route.tsx`, `settings.tsx`, `products.$productId.tsx`, `products.index.tsx` |
| Removed unused dead code (unused `units` variable) | `marketplace.ts` |
| **Confirmed:** Zero TypeScript errors, production build passes ✅ | — |

### Phase 2: Messaging System Removal

The original template included a full in-app buyer-seller chat system. After auditing it, we decided to remove it entirely for the following reasons:
- It added significant complexity (real-time database polling).
- It required maintaining a `messages` database table.
- Direct email contact is simpler, free, and more reliable.

| What We Did | Files Changed / Deleted |
|---|---|
| Removed the messages icon from the Navbar | `Navbar.tsx` |
| Deleted the entire messages page and its logic | ~~`messages.tsx`~~ (deleted) |
| Replaced "Message Seller" button with "Email Seller" (`mailto:` link) | `products.$productId.tsx` |
| Updated the Supabase query to also fetch seller's email address | `products.$productId.tsx` |
| Removed messaging-related text from SEO meta tags | `notifications.tsx`, `products.$productId.tsx` |
| Removed `messages` table from TypeScript types | `types.ts` |
| **Confirmed:** Zero TypeScript errors, production build passes ✅ | — |

---

## 8. How Authentication Works (Simplified)

```
User visits /dashboard
        │
        ▼
  Are they logged in?
        │
    NO  │  YES
        │    │
        ▼    ▼
  Redirect  Show Dashboard
  to /auth
        │
  User logs in
        │
        ▼
  Supabase Auth generates
  a secure session token
        │
        ▼
  Token saved in localStorage
        │
        ▼
  useAuth() hook reads the token
  and provides user data everywhere
        │
        ▼
  User can access all protected pages
```

---

## 9. How Listing Images Work

```
Seller uploads a photo on the /sell page
        │
        ▼
  Image sent to Supabase Storage
  (a cloud bucket, like Google Drive)
        │
        ▼
  Supabase returns a storage path
  e.g. "products/abc123/photo.jpg"
        │
        ▼
  That path is saved in the products table
  under the "images" column
        │
        ▼
  When a buyer views the listing,
  resolveImage() converts the path
  into a public URL
        │
        ▼
  Image displays in the browser
```

---

## 10. Validation & Quality Checks

Throughout development, we ran two checks after every major change:

| Check | Command | What It Does |
|---|---|---|
| **TypeScript check** | `npx tsc --noEmit` | Scans all TypeScript files and reports any type errors without producing output files |
| **Production build** | `npm run build` | Compiles everything into optimised files ready for deployment; if this passes, the app will work when live |

**Both checks passed cleanly at all phases.** ✅

---

## 11. What Is Not Yet Built (Future Phases)

The following features are planned but not yet implemented:

| Feature | Description |
|---|---|
| Email domain validation | Restricting registration to verified college email domains (e.g. `@iitb.ac.in`) |
| Product ratings & reviews | Allow buyers to rate sellers after a transaction |
| Location/campus filtering | Filter listings by specific campus or city |
| Push notifications | Notify users via browser notifications |
| PWA support | Make the app installable like a native mobile app |
| Seller rating system | Build trust scores based on past transactions |

---

## 12. Quick Glossary

| Term | Plain English Explanation |
|---|---|
| **Frontend** | The part of the website you see and interact with in your browser |
| **Backend** | The server-side logic that processes data and runs business rules |
| **Database** | An organised filing system that stores all the app's data |
| **API** | A way for the frontend to talk to the backend/database |
| **Supabase** | The all-in-one backend service we use (handles users, database, and file storage) |
| **TypeScript** | A stricter version of JavaScript that prevents common coding mistakes |
| **Route** | A URL path in the app (e.g. `/products`, `/dashboard`) |
| **Protected Route** | A route that only logged-in users can access |
| **Hook** | A reusable piece of React logic (e.g. `useAuth()` gives any component access to the current user) |
| **Build** | The process of compiling and optimising all the source code into files a browser can run efficiently |
| **SSR** | Server-Side Rendering — the page is built on the server and sent to the browser, which helps with SEO and load speed |

---

*Report generated for CampusXchange | Built with React + TanStack + Supabase*
