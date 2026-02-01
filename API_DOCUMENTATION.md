# NetPet API Documentation

This document describes the scaffolded endpoints for the NetPet application.

## Endpoints

### 1. Get Pet Status
* **Endpoint:** `GET /api/pet/:id`
* **Description:** Fetches current pet stats. Uses `petStatus` middleware to calculate real-time decay.
* **Response:** `{ "id": "1", "name": "Pixel", "status": { "hunger": 10, "energy": 80 } }`

### 2. Interact with Pet
* **Endpoint:** `PATCH /api/pet/:id/interact`
* **Body:** `{ "action": "feed" | "play" | "sleep" }`
* **Description:** Updates pet stats based on user interaction.

### 3. Search Pets
* **Endpoint:** `GET /api/pets/search?name=...`
* **Description:** Search for other players' pets for social interactions.

### 4. Send Gift
* **Endpoint:** `POST /api/pets/:id/gift`
* **Description:** Sends an energy booster to a specific pet.

### 5. Initialize Pet
* **Endpoint:** `POST /api/pets`
* **Body:** `{ "petName": "string", "appearance": "type" }`
* **Description:** Creates a new pet instance for the player.



## Middleware: Status Decay (`petStatus.js`)
**Need:** To calculate hunger and energy loss based on the time elapsed since the last interaction.
**Functionality:** It intercepts requests to pet-related routes, calculates the time difference, and attaches a `decayStats` object to the request for use in the response.

---

## User Management (Added Feb 2026)

### 6. Create User
* **Endpoint:** `POST /api/users`
* **Body:** `{ "username": "string", "email": "string", "consentToToS": boolean }`
* **Description:** Creates a new user. Requires `consentToToS` to be true.
* **Requirement:** Data minimization (GDPR).

### 7. Delete User (Retract Consent)
* **Endpoint:** `DELETE /api/users/:username`
* **Description:** Deletes the user account and all associated personal data.
* **Requirement:** Right to be forgotten.