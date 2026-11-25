import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';

dotenv.config();

interface FirebaseAppletConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId?: string;
}

const BOOTSTRAPPED_ADMIN_EMAIL = 'kevinmosesbinali@gmail.com';
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadFirebaseConfig(): FirebaseAppletConfig | null {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as FirebaseAppletConfig;
  } catch {
    return null;
  }
}

async function verifyAdminToken(authHeader: string | undefined): Promise<{ uid: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return null;
  }

  const fbConfig = loadFirebaseConfig();
  if (!fbConfig?.apiKey || !fbConfig?.projectId) {
    return null;
  }

  try {
    const lookupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(fbConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!lookupRes.ok) {
      return null;
    }

    const lookupData = (await lookupRes.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const user = lookupData.users?.[0];
    if (!user?.localId || !user.email || user.emailVerified !== true) {
      return null;
    }

    if (user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL) {
      return { uid: user.localId, email: user.email };
    }

    // Check Firestore admins/{uid} document using the caller's verified ID token
    const dbId = fbConfig.firestoreDatabaseId || '(default)';
    const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      fbConfig.projectId
    )}/databases/${encodeURIComponent(dbId)}/documents/admins/${encodeURIComponent(user.localId)}`;

    const adminCheckRes = await fetch(adminDocUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (adminCheckRes.ok) {
      return { uid: user.localId, email: user.email };
    }

    return null;
  } catch {
    return null;
  }
}

function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

async function startServer() {
  const app = express();
  const port = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'viccie-mobile-spa' });
  });

  // Public runtime config (browser-scoped Google Maps key only)
  app.get('/api/public-config', (_req, res) => {
    const googleMapsApiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ googleMapsApiKey });
  });

  // Authenticated Admin Image Upload endpoint
  app.post('/api/uploads', async (req, res) => {
    const admin = await verifyAdminToken(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: 'Unauthorized admin session.' });
      return;
    }

    const { dataUrl } = req.body as { dataUrl?: unknown };
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Invalid image payload.' });
      return;
    }

    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
      res.status(400).json({ error: 'Malformed image data URL.' });
      return;
    }

    const base64Part = dataUrl.slice(commaIndex + 1);
    const buffer = Buffer.from(base64Part, 'base64');

    // Enforce 3MB maximum file size
    if (buffer.length === 0 || buffer.length > 3 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be smaller than 3MB.' });
      return;
    }

    const ext = detectImageExtension(buffer);
    if (!ext) {
      res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
      return;
    }

    const fileName = `spa-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, fileName);

    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid file destination.' });
      return;
    }

    try {
      fs.writeFileSync(targetPath, buffer);
      res.status(201).json({ imageUrl: `/uploads/${fileName}` });
    } catch {
      res.status(500).json({ error: 'Failed to store uploaded image.' });
    }
  });

  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '7d',
      fallthrough: false,
    })
  );

  // Error handler for static /uploads misses
  app.use('/uploads', (_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(404).json({ error: 'Image not found.' });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Viccie Mobile Spa server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
