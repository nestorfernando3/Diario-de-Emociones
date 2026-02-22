export const syncAPI = {
    // Generate a random password for encryption
    generatePassword: () => {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Encrypt text using AES-GCM
    encryptData: async (text, password) => {
        const enc = new TextEncoder();

        // Derive key from password
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
        );

        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));

        // Return salt, iv, and ciphertext as base64
        const bufferToB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
        return {
            salt: bufferToB64(salt),
            iv: bufferToB64(iv),
            data: bufferToB64(encrypted)
        };
    },

    // Decrypt text using AES-GCM
    decryptData: async (encryptedObj, password) => {
        try {
            const b64ToBuffer = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const salt = b64ToBuffer(encryptedObj.salt);
            const iv = b64ToBuffer(encryptedObj.iv);
            const data = b64ToBuffer(encryptedObj.data);

            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
            );

            const key = await window.crypto.subtle.deriveKey(
                { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
                keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
            );

            const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            throw new Error("Contraseña incorrecta o datos corruptos");
        }
    },

    // Push local database to JSONBlob
    upload: async (existingKey = null) => {
        // 1. Gather all local data
        const dataToSync = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('diario_')) {
                dataToSync[k] = localStorage.getItem(k);
            }
        }

        const jsonString = JSON.stringify(dataToSync);

        // 3. Upload via our custom Vercel Proxy to bypass browser CORS completely
        let blobId = null;
        let password = null;

        if (existingKey && existingKey.includes('@')) {
            const parts = existingKey.split('@');
            blobId = parts[0];
            password = parts[1];
        } else {
            password = syncAPI.generatePassword();
        }

        // 2. Encrypt data
        const encryptedPayload = await syncAPI.encryptData(jsonString, password);

        // Call the Vercel Serverless Function Proxy.
        // We use the absolute URL so it works even if running locally via Vite.
        const url = 'https://diario-de-emociones.vercel.app/api/sync?action=upload' + (blobId ? `&blobId=${blobId}` : '');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(encryptedPayload)
        });

        if (!response.ok) {
            throw new Error('Error al subir los datos a la nube. Bloqueado por red local o servidor.');
        }

        const resData = await response.json();

        if (!resData || !resData.blobId) {
            throw new Error('El proxy no devolvió un ID válido');
        }

        return `${resData.blobId}@${password}`;
    },

    // Pull database from JSONBlob
    download: async (syncKey) => {
        if (!syncKey || !syncKey.includes('@')) {
            throw new Error("Formato de llave inválido");
        }

        const [blobId, password] = syncKey.split('@');

        const response = await fetch(`https://diario-de-emociones.vercel.app/api/sync?action=download&blobId=${blobId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('No se encontró información para esta llave o el enlace expiró');
        }

        const encryptedPayload = await response.json();
        if (!encryptedPayload) throw new Error("Datos inválidos devueltos por la nube");

        const jsonString = await syncAPI.decryptData(encryptedPayload, password);

        const dataObj = JSON.parse(jsonString);

        // Save imported data to localStorage
        for (const [k, v] of Object.entries(dataObj)) {
            localStorage.setItem(k, v);
        }

        return true;
    }
};
