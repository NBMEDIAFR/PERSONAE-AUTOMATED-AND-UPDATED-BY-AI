import { put, head } from "@vercel/blob";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — charge les personas
  if (req.method === "GET") {
    try {
      const blobUrl = process.env.PERSONAS_BLOB_URL;
      if (!blobUrl) return res.status(200).json(null);
      const response = await fetch(blobUrl + "?t=" + Date.now());
      if (!response.ok) return res.status(200).json(null);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(200).json(null);
    }
  }

  // POST — sauvegarde les personas
  if (req.method === "POST") {
    try {
      const personas = req.body;
      const blob = await put("personas.json", JSON.stringify(personas), {
        access: "public",
        addRandomSuffix: false,
        cacheControlMaxAge: 0,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      // Sauvegarde l'URL pour les prochains GET
      process.env.PERSONAS_BLOB_URL = blob.url;
      return res.status(200).json({ ok: true, url: blob.url });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
