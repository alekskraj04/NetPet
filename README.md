# NetPet : A Persistent Virtual Pet Application

## Description
NetPet is a full-stack virtual pet game featuring a pixel-art aesthetic. Your pet lives on a server, and its status (hunger, sleep, happiness) decreases over time in real-time,even when you are logged out.

## Feature Map
### Phase 1: Minimum Viable Product (MVP)
- [ ] **User Registration:** Create an account and name your pet (Create).
- [ ] **Status Dashboard:** Visual bars for hunger, energy, and happiness.
- [ ] **Interaction:** Buttons to feed and play with your pet (Modify).
- [ ] **Persistent Storage:** Store data in PostgreSQL so the pet "remembers" its state.

### Phase 2: Server Logic & Automation
- [ ] **Time-based Calculation:** Backend logic that calculates hunger/status decay based on timestamps.
- [ ] **Auto-save:** Automatic status updates and state persistence.

### Phase 3: Social Features (Sharing)
- [ ] **Search Functionality:** A search bar to find and view other players' pets by their username (Share).
- [ ] **Gifting System:** After finding a friend's pet, users can send an "Energy Booster" as a gift (Share/Modify).

## Technical Requirements
- **Frontend:** HTML, CSS, JavaScript (Progressive Web App - PWA).
- **Backend:** Node.js with Express (Rest'ish API).
- **Database:** PostgreSQL for cloud-based storage.
- **Functionality:** Offline support and user authentication.
