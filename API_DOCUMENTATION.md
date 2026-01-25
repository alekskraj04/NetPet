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