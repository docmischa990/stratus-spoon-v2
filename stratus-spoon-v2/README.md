# Stratus Spoon v2 🍽️

## Overview

**Stratus Spoon v2** is the next-generation version of the Stratus Spoon recipe platform.

The original Stratus Spoon project was built using **HTML, CSS, and JavaScript** as a front-end recipe application.
Stratus Spoon v2 rebuilds the platform using a modern full-stack architecture to support scalable features such as user accounts, cloud storage, AI-generated images, and API-powered recipe data.

The goal of this project is to evolve Stratus Spoon into a **production-ready recipe platform** with modern tooling and a modular architecture.

---

# Tech Stack

## Frontend

* **React**
* **Vite**
* **TailwindCSS**
* **React Router**

## Backend / Cloud

* **Firebase Authentication**
* **Firebase Firestore**
* **Firebase Storage**

## APIs

* Recipe data API
* AI image generation API

---

# Core Features

## User Authentication

Users will be able to:

* Sign up
* Log in
* Log out
* Maintain session state
* Manage personal profiles

Authentication will be handled through **Firebase Authentication**.

---

## Recipe Browsing

Users can:

* Browse recipes from the platform database
* View detailed recipe pages
* Search and filter recipes

Recipe pages contain:

* Recipe title
* Description
* Ingredients
* Cooking steps
* Notes
* Recipe image

---

## Recipe Creation

Authenticated users can:

* Create new recipes
* Upload recipe images
* Generate AI images for recipes
* Save recipes to the database

Recipes will be stored in **Firebase Firestore**.

Images will be stored in **Firebase Storage**.

---

## AI Image Generation

Users will have the option to generate images for recipes using an AI image generation API.

Generated images will:

* Be saved to Firebase Storage
* Be linked to recipe records in Firestore

---

## Personal Cookbook

Users can manage their own cookbook by:

* Saving favorite recipes
* Viewing created recipes
* Organizing collections

---

# Planned Features

Future development goals include:

* Recipe ratings and reviews
* Ingredient-based filtering
* Advanced search
* Recipe tagging and categories
* User collections
* Social sharing
* Improved accessibility
* Performance optimizations

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

---

# Project Structure (Planned)

```
src/
  components/
  pages/
  hooks/
  context/
  services/
  firebase/
  utils/
  assets/
```

---

# AI Development Workflow

This repository uses **AI-assisted development** with strict governance rules defined in:

```
AGENTS.md
PROJECTTRACKER.md
```

AI agents must:

* Request approval before implementing changes
* Log all modifications
* Use atomic commits
* Follow the project architecture rules

---

# Firestore Recipe Seed Shape

If you manually add a recipe document in Firestore and want it to appear on the recipes page,
the document must satisfy the current internal query and security rule assumptions.

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

* `sourceType` must be `internal`
* `visibility` must be `public` unless you are signed in as the matching `ownerId`
* `createdAt` should be a real Firestore timestamp because the browse query orders by it
* the current browse queries require composite indexes defined in `firestore.indexes.json`

---
