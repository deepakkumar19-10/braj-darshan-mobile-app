/**
 * Bhakti audio catalogue (the same data as the website: packages/data/data/v3/bhakti.json).
 * Every item opens on its OFFICIAL YouTube upload or channel (label, artist, temple, ashram), in the
 * YouTube app when it is installed, else in the browser. The app plays nothing itself, so the views
 * and any revenue go to whoever owns the recording.
 */
import { Linking } from 'react-native';
import catalogue from '../data/bhakti.json';
import texts from '../data/bhaktiTexts.json';

const thumb = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const BHAKTI_CATEGORIES = catalogue.categories;

export const BHAKTI_TRACKS = catalogue.tracks.map((t) => ({
  ...t,
  kind: 'video',
  artworkUrl: thumb(t.youtubeId),
  watchUrl: `https://www.youtube.com/watch?v=${t.youtubeId}`,
  significance: texts[t.id]?.significance || null,
  lyrics: texts[t.id]?.lyrics || null,
}));

export const BHAKTI_PLAYLISTS = (catalogue.playlists || []).map((p) => ({
  ...p,
  kind: 'playlist',
  watchUrl: `https://www.youtube.com/playlist?list=${p.playlistId}`,
}));

export const BHAKTI_LIVE = (catalogue.live || []).map((l) => ({
  ...l,
  kind: 'live',
  category: 'live',
  titleHi: l.nameHi,
  titleEn: l.nameEn,
  watchUrl: l.liveUrl,
}));

export const findBhaktiTrack = (id) => (id ? BHAKTI_TRACKS.find((t) => t.id === id) || null : null);

export const itemsInCategory = (categoryId) =>
  categoryId === 'live' ? BHAKTI_LIVE : BHAKTI_TRACKS.filter((t) => t.category === categoryId);

export const playlistsInCategory = (categoryId) => BHAKTI_PLAYLISTS.filter((p) => p.category === categoryId);

// Who performs it; with no named artist, the channel stands in (a "Topic" channel is named after its artist).
export const performerOf = (item, isHindi) =>
  (isHindi ? item.artistHi || item.artistEn : item.artistEn || item.artistHi) ||
  String(item.channel || '').replace(/ - Topic$/, '');

// Opens the item on YouTube. Resolves to true when the phone opened it.
export async function openOnYouTube(item) {
  if (!item?.watchUrl) return false;
  try {
    await Linking.openURL(item.watchUrl);
    return true;
  } catch (e) {
    return false;
  }
}
