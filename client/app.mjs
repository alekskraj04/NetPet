import request from './modules/fetchManager.mjs';

const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        saveError: "Kunne ikke lagre bruker.",
        invalidLogin: "Ugyldig brukernavn eller passord.",
        giftSent: "Energy Booster sendt til ",
        userNotFound: "Bruker ikke funnet."
    },
    en: {
        fillFields: "Please fill in all fields",
        saveError: "Could not save user.",
        invalidLogin: "Invalid username or password.",
        giftSent: "Energy Booster sent to ",
        userNotFound: "User not found."
    }
};

const lang = navigator.language.startsWith('no') ? 'no' : 'en';
const t = translations[lang];

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hunger = 100;
        this.energy = 100;
        this.gameTick = null;
    }

    async connectedCallback() {
        const savedUser = localStorage.getItem('netpet_user');
        if (savedUser && savedUser !== "null" && savedUser !== "" && savedUser !== "undefined") {
            return this.showGameView(savedUser);
        }
        this.showLoginView();
    }

    async showLoginView() {
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
        const usernameInput = this.shadowRoot.querySelector('#username');
        const passwordInput = this.shadowRoot.querySelector('#password');
        const username = usernameInput?.value.trim();
        const password = passwordInput?.value;

        if (!username || !password) return alert(t.fillFields);
        try {
            const response = await request('/api/users/login', 'POST', { username, password });
            localStorage.setItem('netpet_user', response.username);
            this.showGameView(response.username);
        } catch (error) {
            alert(t.invalidLogin);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const passwordInput = this.shadowRoot.querySelector('#password');
        const username = usernameInput?.value.trim();
        const password = passwordInput?.value;

        if (!username || !password) return alert(t.fillFields);
        try {
            await request('/api/users', 'POST', { username, password });
            localStorage.setItem('netpet_user', username);
            this.showGameView(username);
        } catch (error) {
            alert(t.saveError);
        }
    }

    async showGameView(username) {
        try {
            const globalUI = document.querySelectorAll('h1, footer, .front-gif');
            globalUI.forEach(el => el.style.display = 'none');

            const response = await fetch('./views/GAMEVIEW.html');
            this.shadowRoot.innerHTML = await response.text();
            
            const nameTag = this.shadowRoot.querySelector('#pet-name');
            if (nameTag) nameTag.innerText = `${username.toUpperCase()}'S PET`;

            if (this.gameTick) clearInterval(this.gameTick);
            this.gameTick = setInterval(() => {
                this.hunger = Math.max(0, this.hunger - 2);
                this.energy = Math.max(0, this.energy - 1);
                this.updateUI();
            }, 3000);

            const feedBtn = this.shadowRoot.querySelector('#feed-btn');
            if (feedBtn) {
                feedBtn.onclick = () => {
                    if (this.hunger > 0 || this.energy > 0) { // Kan bare mate hvis ikke død
                        this.hunger = Math.min(100, this.hunger + 20);
                        this.updateUI("Yummy!");
                    }
                };
            }

            const sleepBtn = this.shadowRoot.querySelector('#sleep-btn');
            if (sleepBtn) {
                sleepBtn.onclick = () => {
                    if (this.hunger > 0 || this.energy > 0) {
                        this.energy = Math.min(100, this.energy + 30);
                        this.updateUI("Zzz...");
                    }
                };
            }

            const giftBtn = this.shadowRoot.querySelector('#gift-btn');
            if (giftBtn) {
                giftBtn.onclick = async () => {
                    const recipient = this.shadowRoot.querySelector('#gift-target')?.value.trim();
                    if (!recipient) return;
                    try {
                        await request('/api/users/gift', 'POST', { recipient });
                        alert(t.giftSent + recipient);
                    } catch (e) {
                        alert(t.userNotFound);
                    }
                };
            }

            const logoutBtn = this.shadowRoot.querySelector('#logout-btn');
            if (logoutBtn) logoutBtn.onclick = () => this.logout();

            this.updateUI();
        } catch (error) {
            console.error("Error loading GameView:", error);
        }
    }

    logout() {
        clearInterval(this.gameTick);
        localStorage.removeItem('netpet_user');
        window.location.reload(); 
    }

    updateUI(msg = "Happy!") {
        const hFill = this.shadowRoot.querySelector('#hunger-fill');
        const eFill = this.shadowRoot.querySelector('#energy-fill');
        const sText = this.shadowRoot.querySelector('#status-text');
        const pImg = this.shadowRoot.querySelector('#pet-image');

        if (hFill) hFill.style.width = this.hunger + "%";
        if (eFill) eFill.style.width = this.energy + "%";

        if (pImg) {
            // 1. Sjekk først om dyret er dødt (0% på begge)
            if (this.hunger <= 0 && this.energy <= 0) {
                pImg.src = "/assets/dead.gif";
                if (sText) sText.innerText = "Status: Oh no! Your pet is dead... 💀";
            } 
            // 2. Sjekk om den er trist (Under 50% på sult ELLER energi)
            else if (this.hunger < 50 || this.energy < 50) {
                pImg.src = "/assets/sad.gif";
                if (sText) sText.innerText = "Status: I'm feeling a bit down...";
            } 
            // 3. Ellers er den glad (Idle)
            else {
                pImg.src = "/assets/creatureidle.gif";
                if (sText) sText.innerText = `Status: ${msg}`;
            }
        }
    }
}

customElements.define('user-manager', UserManager);