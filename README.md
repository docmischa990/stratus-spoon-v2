# Stratus Spoon v2

## Overview

**Stratus Spoon v2** is the production-ready evolution of the Stratus Spoon recipe platform.

The original Stratus Spoon was a static HTML/CSS/JS front-end. v2 rebuilds the platform as a full-stack application with user accounts, cloud storage, AI-generated imagery, external recipe API integration, personalised recommendations, and a behaviour-driven engine that learns from what users browse, search, and import.

---

# Tech Stack

## Frontend

* **Next.js 16** (App Router)
* **React 19**
* **TailwindCSS**
* **Framer Motion** — animations and micro-interactions
* **TanStack Query v5** — server state and caching
* **Zustand** — client state management

## Backend / Cloud

* **Firebase Authentication** — user accounts and session management
* **Firebase Firestore** — recipe and user data storage
* **Firebase Storage** — recipe image hosting
* **Firebase Functions** — server-side callables and HTTP endpoints
* **Firebase Analytics** — usage and engagement tracking

## External APIs

* **Spoonacular** — external recipe search and data (via Firebase callable)
* **AI image generation** — recipe image generation (via Firebase callable)

---

# Implemented Features

## User Authentication

* Sign up, log in, log out
* Persistent session state via Firebase Auth
* Protected routes for authenticated actions

---

## Recipe Browsing

* Browse internal (Firestore) and external (Spoonacular API) recipes in a unified paginated grid
* Search recipes with debounced query handling
* Filter by category, tags, and source
* Load more pagination — internal and external results are fetched and merged per page

---

## Recipe Detail Pages

* Full recipe view: title, description, ingredients, steps, notes, image
* View count tracking (Firestore behaviour signals)
* Like / Dislike ratings (YouTube-style, with animated Framer Motion feedback)
* Owner-only edit and delete actions

---

## Recipe Creation and Editing

* Authenticated users can create and edit recipes
* Image upload to Firebase Storage
* AI image generation during creation and editing
* Recipes stored in Firestore with full metadata

---

## Recipe Import

* Users can import external Spoonacular recipes into their own Firestore collection
* Import events are tracked as behaviour signals

---

## AI Image Generation

* On-demand AI image generation for any recipe
* Generated images saved to Firebase Storage and linked to Firestore recipe records

---

## Personal Cookbook

* Save favourites from any recipe (internal or external)
* Organise recipes into named collections
* View all created recipes under My Recipes
* Favourites page with optimistic cache updates

---

## Ratings System

* Like / Dislike ratings per recipe per user
* Global like and dislike counts stored in a dedicated `recipeStats` Firestore collection using atomic `increment()` operations
* Ratings feed directly into recommendation scoring

---

## Analytics and Usage Tracking

* Firebase Analytics events for: recipe views, search queries, recipe creation, recipe imports, favourite toggling, collection creation, AI image generation success and failure
* Per-user behaviour signals written to `users/{uid}/behaviour/signals` in Firestore

---

## Smart Recommendations

* Weighted preference profile built from each user's cookbook favourites (1×) and liked recipes (2×)
* Recommendation scoring: ingredient match ×3, tag match ×2, category match ×1.5, search keyword overlap ×2
* Disliked recipes suppressed from the candidate pool entirely, with a keyword/tag penalty applied to similar recipes
* Trending recipes scored from real stats: `viewCount + likeCount×2 + favoriteCount×1.5`
* All recommendation queries are guarded with `.catch()` fallbacks so partial Firestore failures never crash the homepage

---

# Development Setup

Clone the repository:

```bash
git clone https://github.com/docmischa990/stratus-spoon-v2.git
```

Navigate to the project:

```bash
cd stratus-spoon-v2
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The dev server runs Next.js with Webpack (`next dev --webpack`) for consistency with the production build.

Set up your environment variables in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

---

# Project Structure

```
src/
  app/                  # Next.js App Router — route files and root layout
    layouts/            # Shared layout wrappers (AppLayout)
  views/                # Page-level view components (consumed by app/ route files)
  components/           # Reusable UI components
    auth/
    cookbook/
    home/
    layout/
    recipes/
    ui/
  hooks/                # Custom React hooks
  services/             # API and business logic layer
    analytics/
    behaviour/
    cookbook/
    images/
    recipes/
    recommendations/
  lib/
    firebase/           # Firebase client initialisation
  utils/                # Shared helpers (ingredient parser, etc.)
  assets/               # Static assets
```

---

# Firestore Recipe Seed Shape

If you manually add a recipe document in Firestore and want it to appear on the recipes page, the document must satisfy the current internal query and security rule assumptions.

Minimum recommended shape:

```json
{
  "title": "Test Pasta",
  "slug": "test-pasta",
  "description": "A manually seeded recipe for Firestore testing.",
  "category": "Dinner",
  "tags": ["Test"],
  "ingredients": ["200g pasta", "salt"],
  "steps": [{ "id": "step-1", "text": "Boil pasta" }],
  "notes": "Seed data",
  "sourceType": "internal",
  "visibility": "public",
  "ownerId": "YOUR_FIREBASE_AUTH_UID",
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp",
  "image": null
}
```

Important notes:

* `sourceType` must be `"internal"`
* `visibility` must be `"public"` unless you are signed in as the matching `ownerId`
* `createdAt` should be a real Firestore Timestamp — the browse query orders by it
* The browse queries require composite indexes defined in `firestore.indexes.json`

---

# AI Development Workflow

This repository uses **AI-assisted development** with strict governance rules defined in `AGENTS.md`.

AI agents must:

* Propose a plan and wait for explicit approval before implementing any change
* Log all modifications to `PROJECTTRACKER.md`
* Use atomic, independently reversible commits
* Follow the project's layered architecture (services, hooks, views, components)
* Never commit secrets or credentials

---
