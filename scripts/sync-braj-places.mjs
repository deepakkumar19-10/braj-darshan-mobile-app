// Snapshot of the website's Braj places (https://www.divyabraj.com/api/v1/places) for the app's
// Places screen: the same 190 places as divyabraj.com/places, slimmed to what the app shows, so the
// screen works offline. Photos point at the website (the 480 px WebP copy when it exists).
//
//   node scripts/sync-braj-places.mjs        writes src/data/brajPlaces.json
//
// Nothing is invented here: every field is copied from the website's data as it stands.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = 'https://www.divyabraj.com';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'brajPlaces.json');

const res = await fetch(`${SITE}/api/v1/places`);
if (!res.ok) throw new Error(`places API ${res.status}`);
const body = await res.json();
const list = body.data;
if (!Array.isArray(list) || list.length < 100) throw new Error(`unexpected places list (${list && list.length})`);

const exists = async (url) => {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.ok;
  } catch {
    return false;
  }
};

// The small WebP copy the website made for phones, if it exists (checked with a HEAD request).
async function smallCopy(src) {
  const url = `${SITE}/images/v/${src.replace(/^\/images\//, '').replace(/\.[a-z]+$/i, '')}-480.webp`;
  return (await exists(url)) ? url : null;
}

// The place's own page on the website: one of the original temples, a temple page or a place page,
// whichever really answers (checked with a HEAD request). null when the website has no page for it,
// so the app never shows a link that leads to "page not found".
async function webPage(p) {
  const candidates = p.legacy?.templeId ? [`/temples/${p.legacy.templeId}`] : [`/places/${p.id}`, `/temples/${p.id}`];
  for (const c of candidates) {
    if (await exists(`${SITE}${encodeURI(c)}`)) return c;
  }
  return null;
}

const places = [];
for (const p of list) {
  if (p.category === 'facility') continue; // parking, stations: not places to visit
  let photo = null;
  if (p.photo?.src) {
    photo = {
      uri: (await smallCopy(p.photo.src)) || `${SITE}${p.photo.src}`,
      author: p.photo.author || null,
      license: p.photo.license || null,
      page: p.photo.page || null,
      representative: Boolean(p.photo.representative),
    };
  }
  places.push({
    id: p.id,
    nameHi: p.nameHi,
    nameEn: p.nameEn,
    region: p.region,
    category: p.category,
    priority: p.priority || null,
    summaryHi: p.summaryHi || '',
    summaryEn: p.summaryEn || '',
    geo: p.geo ? { lat: p.geo.lat, lng: p.geo.lng } : null,
    visitMinutes: Array.isArray(p.visitMinutes) ? p.visitMinutes : null,
    timings: p.timings?.seasons?.length
      ? { seasons: p.timings.seasons.map((s) => ({ from: s.from, to: s.to, windows: s.windows })), noteHi: p.timings.noteHi || null, noteEn: p.timings.noteEn || null }
      : null,
    templeId: p.legacy?.templeId ?? null,
    web: await webPage(p),
    photo,
  });
}

writeFileSync(OUT, `${JSON.stringify({ source: `${SITE}/api/v1/places`, version: body.version, updatedAt: body.updatedAt, places }, null, 0)}\n`);
const withPhoto = places.filter((x) => x.photo).length;
const withPage = places.filter((x) => x.web).length;
console.log(`${places.length} places (${withPhoto} with a photo, ${withPage} with a website page) -> ${path.relative(process.cwd(), OUT)}`);
