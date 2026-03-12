# ThreeForged Licensing System Architecture

## Overview

This document defines the licensing architecture for ThreeForged paid plugins.

ThreeForged distributes its tools as npm packages, but certain commands are locked behind a license system.

The goal is to provide:

- frictionless installation for developers
- secure license validation
- simple purchase flow
- scalable backend architecture

Developers should be able to install plugins normally with npm and activate them using a license key.

Example developer workflow:

npm install threeforged @threeforged/optimizer

threeforged activate TF-OPT-XXXX

threeforged optimize ./assets

---

# High-Level Architecture

The licensing system consists of five core components:

1. ThreeForged Website
2. Stripe Checkout
3. Stripe Webhook
4. Supabase Database
5. CLI License Verification

System flow:

User purchases plugin  
↓  
Stripe Checkout completes  
↓  
Stripe webhook fires  
↓  
Backend generates license  
↓  
License stored in Supabase  
↓  
User activates license via CLI  
↓  
CLI verifies license with backend

---

# Technology Stack

Recommended stack:

Frontend website:
Next.js

Payments:
Stripe Checkout

Backend API:
Next.js API routes

Database:
Supabase (Postgres)

Authentication (optional):
Supabase Auth

CLI:
Node.js

---

# Purchase Flow

## Step 1: User purchases plugin

User clicks "Buy Static Optimizer" on the ThreeForged website.

Website calls backend:

POST /api/checkout/create

Backend creates Stripe Checkout session.

Stripe Checkout metadata should include:

product_code=optimizer  
customer_email=user@email.com

User is redirected to Stripe Checkout.

---

## Step 2: Payment completes

Stripe processes payment.

Stripe sends webhook event to:

POST /api/stripe/webhook

Relevant events:

checkout.session.completed

---

## Step 3: Webhook creates license

Webhook logic:

1. verify Stripe signature
2. parse purchased product
3. locate or create customer
4. generate license key
5. store license record
6. store product entitlements
7. optionally email the license

License is stored in Supabase.

---

# License Key Generation

License keys should be cryptographically random.

Example license format:

TF-OPT-8K3D9X-2Q7MPL-4ZN8AR

Components:

TF = ThreeForged  
OPT = product identifier  
random segments = cryptographic randomness

Example generator approach:

- generate random bytes
- encode using base32 or base36
- format into readable segments

---

# Database Schema

The licensing system uses several tables in Supabase.

---

## customers

Stores customers linked to Stripe.

Fields:

id  
email  
stripe_customer_id  
created_at

---

## licenses

Stores licenses.

Fields:

id  
customer_id  
license_key_hash  
license_key_prefix  
status  
created_at  
expires_at nullable

Status values:

active  
revoked  
refunded

Important:

Only store a **hash** of the license key.

Never store raw keys.

---

## license_entitlements

Defines which products a license unlocks.

Fields:

id  
license_id  
product_code  
created_at

Example product codes:

optimizer  
lod-generator  
instancing  
auditor  
pro-bundle

---

## activations

Tracks CLI activations.

Fields:

id  
license_id  
machine_fingerprint nullable  
activated_at  
last_seen_at

Optional but useful for abuse prevention.

---

# License Verification API

CLI tools must verify licenses using the backend.

Endpoint:

POST /api/licenses/verify

Input:

license_key  
machine_fingerprint optional  
requested_product

Example request:

{
  "license_key": "TF-OPT-8K3D9X-2Q7MPL-4ZN8AR",
  "product": "optimizer"
}

Server flow:

1. hash license key
2. lookup license in database
3. verify status = active
4. check entitlement
5. return verification response

Example response:

{
  "valid": true,
  "products": ["optimizer"],
  "status": "active"
}

---

# CLI Activation Flow

Developer installs plugin:

npm install threeforged @threeforged/optimizer

Developer activates license:

threeforged activate TF-OPT-XXXX

CLI sends request to verification API.

If license is valid:

CLI stores activation locally.

---

# Local License Storage

License is stored locally on developer machine.

Recommended location:

~/.threeforged/license.json

Example file:

{
  "licenseKey": "TF-OPT-8K3D9X-2Q7MPL-4ZN8AR",
  "products": ["optimizer"],
  "lastVerifiedAt": "2026-03-11T14:00:00Z"
}

This allows the CLI to operate without contacting the server every time.

Recommended refresh strategy:

- verify on activation
- revalidate periodically
- revalidate when running paid commands

---

# Plugin Execution Flow

Example command:

threeforged optimize ./assets

Execution steps:

1. load local license
2. verify optimizer entitlement
3. if missing → show purchase message
4. if valid → run optimizer

Example error:

Optimizer requires a valid license.

Activate with:

threeforged activate YOUR_LICENSE_KEY

---

# Security Considerations

## Hash license keys

Store only hashed license keys in the database.

Example:

SHA256(license_key)

This protects users if the database is compromised.

---

## Verify Stripe webhooks

Always verify Stripe webhook signatures before processing events.

This prevents fake webhook requests.

---

## Avoid constant license checks

Do not call the verification API on every command execution.

Use cached license verification.

Example refresh interval:

7 days.

---

## Machine activation limits (optional)

You may optionally limit number of machines per license.

Example:

3 machines per license.

Track this using the activations table.

---

# Example Backend Endpoints

Minimum API endpoints:

POST /api/checkout/create  
POST /api/stripe/webhook  
POST /api/licenses/verify  

Optional:

GET /api/account/licenses  
POST /api/licenses/revoke  

---

# Product Mapping

Example mapping between products and commands:

optimizer → threeforged optimize  
lod-generator → threeforged generate-lod  
instancing → threeforged instance  
auditor → threeforged audit  

Analyzer remains free.

---

# Developer Experience

Developer workflow should remain simple.

Install tools:

npm install threeforged

Install plugin:

npm install @threeforged/optimizer

Activate license:

threeforged activate LICENSE_KEY

Run tool:

threeforged optimize ./assets

---

# Implementation Phases

Recommended development order:

Phase 1  
Stripe Checkout purchase flow

Phase 2  
Stripe webhook license creation

Phase 3  
Supabase database schema

Phase 4  
License verification endpoint

Phase 5  
CLI activation command

Phase 6  
Plugin entitlement checks

Phase 7  
Customer license dashboard (optional)

---

# Long-Term Improvements

Future improvements may include:

- team licenses
- subscription billing
- seat management
- usage analytics
- organization accounts
- license revocation
- automatic renewal

---

# Design Goal

The licensing system should remain:

simple  
secure  
low-friction  

Developers should feel like they are using a normal npm CLI tool.

License activation should take less than 30 seconds.

---

# Final Summary

ThreeForged licensing system:

Stripe handles payments  
Supabase stores licenses  
Backend verifies licenses  
CLI activates and checks entitlements

Developers install plugins normally and unlock paid functionality using license keys.

This architecture supports both free tools and paid plugins while keeping installation friction minimal.