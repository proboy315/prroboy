export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Read environment variables set in Vercel
  res.status(200).json({
    totpSecret: process.env.TOTP || '',
    repo: process.env.REPO || '',
    token: process.env.GITHUB_TOKEN || '',
    dbPath: process.env.DB_PATH || 'public/vault/database.json'
  });
}
