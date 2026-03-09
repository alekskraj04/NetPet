// Corrected BASE_URL without the trailing slash to prevent double slashes (//) in the final URL
const BASE_URL = 'https://netpet.onrender.com'; 

async function request(endpoint, method = 'GET', body = null) {
    // Combines the base URL with the endpoint (e.g., /api/users)
    const url = `${BASE_URL}${endpoint}`;

    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Fetch Manager Error:", error);
        throw error;
    }
}

export default request;