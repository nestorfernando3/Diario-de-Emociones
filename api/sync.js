export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action, blobId } = req.query;

    console.log(`[Proxy Sync] Action: ${action}, BlobId: ${blobId}, Method: ${req.method}`);

    try {
        if (action === 'upload') {
            const isNew = !blobId || blobId === 'undefined' || blobId === 'null';
            const url = isNew ? 'https://api.restful-api.dev/objects' : `https://api.restful-api.dev/objects/${blobId}`;
            const method = isNew ? 'POST' : 'PUT';

            // The free API expects a wrapper object payload: {"name": "diario", "data": {...}}
            const cloudPayload = {
                name: "diario_sync",
                data: req.body
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(cloudPayload)
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[Proxy Sync] Upstream error: ${response.status} ${errText}`);
                throw new Error(`Cloud DB HTTP error: ${response.status} - ${errText}`);
            }

            const data = await response.json();

            // Extract the ID returned by restful-api.dev
            const newBlobId = data.id || blobId;

            if (!newBlobId) {
                throw new Error('Failed to extract document ID from upstream');
            }

            return res.status(200).json({ blobId: newBlobId });
        }
        else if (action === 'download') {
            if (!blobId || blobId === 'undefined' || blobId === 'null') {
                return res.status(400).json({ error: 'Missing blobId parameter' });
            }

            const response = await fetch(`https://api.restful-api.dev/objects/${blobId}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Cloud DB HTTP error: ${response.status}`);
            }

            // The API returns { id: "...", name: "diario_sync", data: { ... } }
            const jsonRes = await response.json();

            if (!jsonRes.data) {
                throw new Error('El objeto retornado está vacío o corrupto');
            }

            return res.status(200).json(jsonRes.data);
        }
        else {
            return res.status(400).json({ error: 'Invalid action parameter. Must be upload or download.' });
        }
    } catch (error) {
        console.error("Vercel Proxy Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
