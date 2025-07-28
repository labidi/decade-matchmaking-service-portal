# Ocean Decade Portal Documentation

## Overview
The Ocean Decade Portal is a web platform built with **Laravel 12** on the backend and **React.js** on the frontend. Vite is used as the build tool and TailwindCSS provides styling. The system matches capacity development requests with potential partners while also allowing organizations to post opportunities.

### Key Technologies
- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React.js + Vite
- **Styling:** TailwindCSS
- **Routing:** Laravel routes with Inertia/React Router for SPA pages
- **Package Manager:** NPM

## Core Models

### `Request`
Represents a capacity development request.
```php
protected $fillable = [
    'request_data',
    'status_id',
    'user_id',
    'matched_partner_id'
];
```
Related models: `Status`, `Offer`, and `Detail` for normalized data.

### `Request\Detail`
Stores normalized request information.
```php
protected $fillable = [
    'request_id',
    'capacity_development_title',
    'is_related_decade_action',
    'unique_related_decade_action_id',
    'first_name',
    'last_name',
    'email',
    'has_significant_changes',
    'changes_description',
    'change_effect',
    'request_link_type',
    'project_stage',
    'project_url',
    'related_activity',
    'delivery_format',
    'delivery_countries',
    'subthemes',
    'support_types',
    'target_audience',
    'subthemes_other',
    'support_types_other',
    'target_audience_other',
    'gap_description',
    'has_partner',
    'partner_name',
    'partner_confirmed',
    'needs_financial_support',
    'budget_breakdown',
    'support_months',
    'completion_date',
    'risks',
    'personnel_expertise',
    'direct_beneficiaries',
    'direct_beneficiaries_number',
    'expected_outcomes',
    'success_metrics',
    'long_term_impact',
    'additional_data'
];
```
Casts arrays for subthemes, support types, target audiences, delivery countries, etc.

### `Request\Offer`
Represents an offer made on a request.
```php
protected $fillable = [
    'request_id',
    'matched_partner_id',
    'description',
    'status',
];
```

### `Opportunity`
Opportunities that partners can submit.
```php
protected $fillable = [
    'title',
    'type',
    'closing_date',
    'coverage_activity',
    'implementation_location',
    'target_audience',
    'summary',
    'url',
];
```

### `Document`
Generic file upload model.
```php
protected $fillable = [
    'name',
    'path',
    'file_type',
    'document_type',
    'parent_id',
    'parent_type',
    'uploader_id',
];
```

Other supporting models include `Notification`, `Setting`, and option helpers under `app/Models/Data`.

## Database Structure
Database migrations define the schema. Important tables:
- `requests` – main request records and links to users.
- `request_details` – normalized data with full‑text search indexes.
- `request_offers` and `documents` – offers on requests and related files.
- `opportunities` – opportunity postings (with `status` and optional `key_words`).
- `notifications` – simple user notifications.
- `settings` – key/value settings for the portal.

The normalized tables for `subthemes`, `support_types`, and `target_audiences` were later dropped in favor of JSON arrays stored in `request_details`.

## Routing Overview
Routes are grouped by user roles and defined in `routes/web.php` and `routes/auth.php`.

### Authentication
```php
Route::middleware('guest')->group(function () {
    Route::get('signin', [SessionController::class, 'create'])->name('sign.in');
    Route::post('signin', [SessionController::class, 'store'])->name('sign.in.post');
});
Route::middleware('auth')->group(function () {
    Route::post('signout', [SessionController::class, 'destroy'])->name('sign.out');
});
```

### User Routes
```php
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');
    Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('request.create');
    Route::get('request/me/list', [OcdRequestController::class, 'myRequestsList'])->name('request.me.list');
    // ... additional request and opportunity routes
});
```

### Partner Routes
```php
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/me/list', [OcdOpportunityController::class, 'mySubmittedList'])->name('opportunity.me.list');
    Route::get('opportunity/create', [OcdOpportunityController::class, 'create'])->name('partner.opportunity.create');
    // ... additional partner routes
});
```

### Admin Routes
```php
Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('settings', [SettingsController::class, 'index'])->name('admin.portal.settings');
    Route::get('request/list', [AdminOcdRequestController::class, 'list'])->name('admin.request.list');
    // ... more admin routes
});
```

Additional routes provide file uploads, offer management, location data APIs, and user guides.

## Services
The **RequestService** centralizes request logic (creation, updates, search, analytics). See `docs/REQUEST_SERVICE.md` for details.

## Front‑End Structure
React components live under `resources/js/`. The folder layout includes:
```
resources/js/
├── components/    # Reusable UI components
├── pages/         # Inertia pages
├── layouts/       # Layout wrappers
├── hooks/         # Custom React hooks
├── services/      # API and helper utilities
├── forms/         # Form schemas and components
└── app.tsx        # Entry point for the React app
```
The configuration uses Vite (`vite.config.js`) with plugins for Laravel, React, and TailwindCSS. TypeScript path aliases (`@/*`) map to `resources/js/*` as defined in `tsconfig.json`.

---
This document provides a high‑level reference for developers working on the Ocean Decade Portal.
