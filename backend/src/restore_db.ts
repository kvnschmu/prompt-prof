import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const API_URL = 'https://prompt-prof.reutemann.xyz';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return `${BASE_URL}/uploads/${filename}`;
  } catch (e) {
    console.error(`Failed to download ${url}:`, e);
    return null;
  }
}

async function restore() {
  console.log('Fetching prompts from', API_URL);
  const response = await fetch(`${API_URL}/api/prompts`);
  if (!response.ok) {
    console.error('Failed to fetch:', response.statusText);
    return;
  }
  const prompts = await response.json() as any[];
  console.log(`Found ${prompts.length} prompts.`);

  for (const p of prompts) {
    let localImageUri = null;
    if (p.imageUri) {
      if (p.imageUri.startsWith(API_URL)) {
          console.log(`Downloading ${p.imageUri}`);
          const originalName = p.imageUri.split('/').pop() || `${randomUUID()}.jpg`;
          localImageUri = await downloadImage(p.imageUri, originalName);
      } else {
          localImageUri = p.imageUri;
      }
    }

    try {
      await prisma.prompt.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          content: p.content,
          tags: JSON.stringify(p.tags),
          category: p.category,
          type: p.type,
          isFavorite: p.isFavorite,
          imageUri: localImageUri,
          metadata: JSON.stringify(p.metadata),
        },
        create: {
          id: p.id,
          title: p.title,
          content: p.content,
          tags: JSON.stringify(p.tags),
          category: p.category,
          type: p.type,
          isFavorite: p.isFavorite,
          imageUri: localImageUri,
          metadata: JSON.stringify(p.metadata),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }
      });
      console.log(`Upserted ${p.id}`);
    } catch (e) {
      console.error(`Failed to upsert ${p.id}:`, e);
    }
  }
  console.log('Restore done!');
  process.exit(0);
}

restore();
