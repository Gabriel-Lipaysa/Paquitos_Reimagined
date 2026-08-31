/**
 * PizzaAPI - Centralized API/Fetch Helper
 * 
 * All fetch() calls should go through this module for consistent
 * error handling and response parsing.
 */
const PizzaAPI = {
    /**
     * POST request with FormData
     * @param {string} url - Endpoint URL
     * @param {Object|FormData} data - Key-value pairs or FormData to send
     * @returns {Promise<{ok: boolean, data: any, status: number}>}
     */
    async post(url, data) {
        let body;
        if (data instanceof FormData) {
            body = data;
        } else {
            body = new FormData();
            for (const [key, value] of Object.entries(data)) {
                body.append(key, value);
            }
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: body
            });

            const contentType = response.headers.get('content-type') || '';
            let responseData;

            if (contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            return {
                ok: response.ok,
                data: responseData,
                status: response.status
            };
        } catch (error) {
            console.error('PizzaAPI.post error:', error);
            return {
                ok: false,
                data: null,
                status: 0,
                error: error.message
            };
        }
    },

    /**
     * GET request
     * @param {string} url - Endpoint URL
     * @returns {Promise<{ok: boolean, data: any, status: number}>}
     */
    async get(url) {
        try {
            const response = await fetch(url);
            const contentType = response.headers.get('content-type') || '';
            let responseData;

            if (contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            return {
                ok: response.ok,
                data: responseData,
                status: response.status
            };
        } catch (error) {
            console.error('PizzaAPI.get error:', error);
            return {
                ok: false,
                data: null,
                status: 0,
                error: error.message
            };
        }
    }
};

