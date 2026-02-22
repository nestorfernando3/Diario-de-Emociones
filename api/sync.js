export default async function handler(req, res) {
    // Enable CORS for local development if needed
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action, blobId } = req.query;

    try {
        if (action === 'upload') {
            const isNew = !blobId || blobId === 'undefined' || blobId === 'null';
            const url = isNew ? 'https://jsonblob.com/api/jsonBlob' : `https://jsonblob.com/api/jsonBlob/${blobId}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(req.body)
            });

            if (!response.ok) {
                throw new Error(`Cloud DB HTTP error: ${response.status}`);
            }

            let newBlobId = blobId;
            if (isNew) {
                const location = response.headers.get('Location');
                if (location) {
                    const parts = location.split('/');
                    newBlobId = parts[parts.length - 1];
                } else {
                    newBlobId = response.headers.get('x-jsonblob-id');
                }
            }

            if (!newBlobId) {
                throw new Error('Failed to extract document ID from upstream');
            }

            return res.status(200).json({ blobId: newBlobId });
        }
        else if (action === 'download') {
            if (!blobId || blobId === 'undefined' || blobId === 'null') {
                return res.status(400).json({ error: 'Missing blobId parameter' });
            }

            const response = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Cloud DB HTTP error: ${response.status}`);
            }

            const data = await response.json();
            return res.status(200).json(data);
        }
        else {
            return res.status(400).json({ error: 'Invalid action parameter. Must be upload or download.' });
        }
    } catch (error) {
        console.error("Vercel Proxy Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
