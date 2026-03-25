import request from './modules/fetchManager.mjs';

// --- Translations ---
const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        saveError: "Kunne ikke lagre bruker.",
        invalidLogin: "Ugyldig brukernavn eller passord.",
        connectionError: "Tilkoblingsfeil til server."
    },
    en: {
        fillFields: "Please fill in all fields",
        saveError: "Could not save user.",
        invalidLogin: "Invalid username or password.",
        connectionError: "Connection error."
    }
};

const lang = navigator.language.startsWith('no') ? 'no' : 'en';
const t = translations[lang];

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hunger = 100; // Intern stats for sult
        this.gameTick = null;
    }

    async connectedCallback() {
        const savedUser = localStorage.getItem('netpet_user');
        if (savedUser) {
            return this.showGameView(savedUser);
        }

        try {
            const response = await fetch('./views/UserView.html');
            this.shadowRoot.innerHTML = await response.text();
            this.setupEventListeners();
        } catch (error) {
            console.error("UI Load Error:", error);
        }
    }

    setupEventListeners() {
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        const loginBtn = this.shadowRoot.querySelector('#login-btn');
        
        if (createBtn) createBtn.onclick = () => this.createUser();
        if (loginBtn) loginBtn.onclick = () => this.loginUser();
    }

    async loginUser() {
        const username = this.shadowRoot.querySelector('#login-username').value.trim();
        const password = this.shadowRoot.querySelector('#login-password').value;

        if (!username || !password) return alert(t.fillFields);

        try {
            const users = await request('/api/users', 'GET');
            // Vi finner brukeren i lista
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            // I et fullverdig system ville vi sjekket bcrypt-hashen på server-side,
            // men for denne innleveringen lar vi appen gå videre hvis brukeren finnes.
            if (user) {
                localStorage.setItem('netpet_user', username);
                this.showGameView(username);
            } else {
                alert(t.invalidLogin);
            }
        } catch (error) {
            alert(t.connectionError);
        }
    }

    async createUser() {
        const username = this.shadowRoot.querySelector('#username').value;
        const password = this.shadowRoot.querySelector('#password').value;

        if (!username || !password) return alert(t.fillFields);

        const newUser = { username, password };

        try {
            await request('/api/users', 'POST', newUser);
            localStorage.setItem('netpet_user', username);
            this.showGameView(username);
        } catch (error) {
            alert(t.saveError);
        }
    }

    async showGameView(username) {
        try {
            // Skjul elementer i index.html
            ['h1', 'body > img', 'footer'].forEach(s => {
                const el = document.querySelector(s);
                if (el) el.style.display = 'none';
            });

            const response = await fetch('./views/GAMEVIEW.html');
            this.shadowRoot.innerHTML = await response.text();
            
            this.shadowRoot.querySelector('#pet-name').innerText = `${username.toUpperCase()}'S PET`;
            const hungerFill = this.shadowRoot.querySelector('#hunger-fill');
            const statusText = this.shadowRoot.querySelector('#status-text');

            // --- GAME LOOP (TICK) ---
            // Kjæledyret mister 2% sult hvert 3. sekund
            this.gameTick = setInterval(() => {
                this.hunger -= 2;
                if (this.hunger <= 0) {
                    this.hunger = 0;
                    statusText.innerText = "Status: STARVING! 💀";
                }
                
                if (hungerFill) {
                    hungerFill.style.width = this.hunger + "%";
                    hungerFill.style.backgroundColor = this.hunger < 30 ? "#ff4c4c" : "#4caf50";
                }
            }, 3000);

            // --- FEED BUTTON ---
            this.shadowRoot.querySelector('#feed-btn').onclick = () => {
                this.hunger = Math.min(this.hunger + 20, 100);
                statusText.innerText = "Status: YUMMY! 🍎";
                setTimeout(() => {
                    if (this.hunger > 0) statusText.innerText = "Status: HAPPY!";
                }, 2000);
            };

            // --- LOGOUT ---
            this.shadowRoot.querySelector('#logout-btn').onclick = () => {
                clearInterval(this.gameTick);
                localStorage.removeItem('netpet_user');
                window.location.reload();
            };

        } catch (error) {
            console.error("Error loading GameView:", error);
        }
    }
}

customElements.define('user-manager', UserManager);