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
        this.coins = 0;
        this.gameTick = null;
    }

    async connectedCallback() {
        const savedUser = localStorage.getItem('netpet_user');
        
        // KUN gå til spill hvis savedUser faktisk har en verdi (ikke null eller tom)
        if (savedUser && savedUser !== "null" && savedUser !== "") {
            return this.showGameView(savedUser);
        }

        // Ellers: Vis alltid innlogging
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
        const username = this.shadowRoot.querySelector('#username')?.value.trim() || 
                         this.shadowRoot.querySelector('#login-username')?.value.trim();
        const password = this.shadowRoot.querySelector('#password')?.value || 
                         this.shadowRoot.querySelector('#login-password')?.value;

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
        const username = this.shadowRoot.querySelector('#username').value;
        const password = this.shadowRoot.querySelector('#password').value;

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
            // Fiks for dobbel GIF: Skjul alle elementer i index.html helt kontant
            const globalElements = document.querySelectorAll('h1, footer, img, .background-gif');
            globalElements.forEach(el => el.style.display = 'none');

            const response = await fetch('./views/GAMEVIEW.html');
            this.shadowRoot.innerHTML = await response.text();
            
            this.shadowRoot.querySelector('#pet-name').innerText = `${username.toUpperCase()}'S PET`;

            this.gameTick = setInterval(() => {
                this.hunger = Math.max(0, this.hunger - 2);
                this.energy = Math.max(0, this.energy - 1);
                this.updateUI();
            }, 3000);

            this.shadowRoot.querySelector('#feed-btn').onclick = () => {
                this.hunger = Math.min(100, this.hunger + 20);
                this.coins += 5;
                this.updateUI("Yummy! +5 Coins");
            };

            this.shadowRoot.querySelector('#sleep-btn').onclick = () => {
                this.energy = Math.min(100, this.energy + 30);
                this.updateUI("Zzz... Resting");
            };

            this.shadowRoot.querySelector('#gift-btn').onclick = async () => {
                const recipient = this.shadowRoot.querySelector('#gift-target').value.trim();
                if (!recipient) return;
                try {
                    await request('/api/users/gift', 'POST', { recipient });
                    alert(t.giftSent + recipient);
                } catch (e) {
                    alert(t.userNotFound);
                }
            };

            this.shadowRoot.querySelector('#logout-btn').onclick = () => {
                clearInterval(this.gameTick);
                localStorage.removeItem('netpet_user');
                // Tvinger siden til å gå helt tilbake til start
                window.location.reload(); 
            };

            this.updateUI();
        } catch (error) {
            console.error("Error loading GameView:", error);
        }
    }

    updateUI(msg = "Happy!") {
        const hFill = this.shadowRoot.querySelector('#hunger-fill');
        const eFill = this.shadowRoot.querySelector('#energy-fill');
        const cCount = this.shadowRoot.querySelector('#coin-count');
        const sText = this.shadowRoot.querySelector('#status-text');

        if (hFill) hFill.style.width = this.hunger + "%";
        if (eFill) eFill.style.width = this.energy + "%";
        if (cCount) cCount.innerText = this.coins;
        if (sText) sText.innerText = `Status: ${msg}`;
    }
}

customElements.define('user-manager', UserManager);