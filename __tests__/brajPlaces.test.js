/* eslint-env jest */
import {
  BRAJ_PLACES,
  BRAJ_TOWNS,
  PLACE_KINDS,
  kindLabel,
  placesInTown,
  kindsIn,
  findBrajPlace,
  placeImage,
  placeWebUrl,
  placeOpenStatus,
} from '../src/utils/brajPlaces';
import temples from '../src/data/temples.json';

// Times are given as UTC instants; IST = UTC + 5:30.
const at = (iso) => new Date(iso);
const bankeBihari = () => findBrajPlace('banke-bihari-mandir');

describe('the website places snapshot', () => {
  test('has the places to visit, each once, without parking or stations', () => {
    expect(BRAJ_PLACES.length).toBeGreaterThan(100);
    expect(new Set(BRAJ_PLACES.map((p) => p.id)).size).toBe(BRAJ_PLACES.length);
    expect(BRAJ_PLACES.some((p) => p.category === 'facility')).toBe(false);
    for (const p of BRAJ_PLACES) {
      expect(p.nameHi).toBeTruthy();
      expect(p.nameEn).toBeTruthy();
    }
  });

  test('every place belongs to a town on the left rail, so none is out of reach', () => {
    const total = BRAJ_TOWNS.reduce((sum, t) => sum + t.count, 0);
    expect(total).toBe(BRAJ_PLACES.length);
    for (const t of BRAJ_TOWNS) expect(t.hi && t.en).toBeTruthy();
  });

  test('every kind of place has a Hindi and English label', () => {
    for (const p of BRAJ_PLACES) {
      expect(PLACE_KINDS[p.category]).toBeDefined();
      expect(kindLabel(p.category, true)).not.toBe('');
      expect(kindLabel(p.category, false)).not.toBe('');
    }
  });

  test('photos come from divyabraj.com only', () => {
    for (const p of BRAJ_PLACES.filter((x) => x.photo)) {
      expect(p.photo.uri.startsWith('https://www.divyabraj.com/')).toBe(true);
      expect(placeImage(p)).toEqual({ uri: p.photo.uri });
    }
    expect(placeImage({ photo: null })).toBeNull();
  });

  test('a place linked to an app temple points at a temple the app has', () => {
    const ids = new Set(temples.map((t) => t.id));
    const linked = BRAJ_PLACES.filter((p) => p.templeId != null);
    expect(linked.length).toBeGreaterThan(0);
    for (const p of linked) expect(ids.has(p.templeId)).toBe(true);
  });
});

describe('towns and kinds', () => {
  test('a town lists its main (P1) places first', () => {
    const list = placesInTown('vrindavan');
    const firstOther = list.findIndex((p) => p.priority !== 'P1');
    if (firstOther >= 0) expect(list.slice(firstOther).some((p) => p.priority === 'P1')).toBe(false);
    expect(list.every((p) => p.region === 'vrindavan')).toBe(true);
  });

  test('kind chips show only kinds present, in a fixed order', () => {
    const kinds = kindsIn([{ category: 'ghat' }, { category: 'major-temple' }, { category: 'ghat' }]);
    expect(kinds).toEqual(['major-temple', 'ghat']);
  });

  test('website link: the page the sync found on divyabraj.com, else none', () => {
    expect(placeWebUrl({ id: 'x', web: '/places/keshi-ghat' })).toBe('https://www.divyabraj.com/places/keshi-ghat');
    expect(placeWebUrl({ id: 'x', web: null })).toBeNull();
    // The eight original temples live at /temples/<number>, not /places/<id>.
    expect(placeWebUrl(findBrajPlace('banke-bihari-mandir'))).toBe('https://www.divyabraj.com/temples/1');
    for (const p of BRAJ_PLACES) {
      if (p.web) expect(p.web).toMatch(/^\/(temples|places)\/[^/]+$/);
    }
    expect(findBrajPlace('no-such-place')).toBeNull();
  });
});

describe('placeOpenStatus (website timings, IST)', () => {
  test('winter morning at Banke Bihari: open until 1:30 PM', () => {
    // 9 Nov 2026, 10:30 IST
    const s = placeOpenStatus(bankeBihari(), at('2026-11-09T05:00:00Z'));
    expect(s.isOpen).toBe(true);
    expect(s.until).toBe('1:30 PM');
    expect(s.windows).toEqual(['8:00 AM – 1:30 PM', '4:00 PM – 9:00 PM']);
  });

  test('winter afternoon break: closed, opens 4:00 PM', () => {
    // 9 Nov 2026, 14:30 IST
    const s = placeOpenStatus(bankeBihari(), at('2026-11-09T09:00:00Z'));
    expect(s.isOpen).toBe(false);
    expect(s.opensAt).toBe('4:00 PM');
  });

  test('the winter season wraps the year end (January)', () => {
    // 15 Jan 2027, 08:30 IST
    expect(placeOpenStatus(bankeBihari(), at('2027-01-15T03:00:00Z')).isOpen).toBe(true);
  });

  test('summer hours from April', () => {
    // 1 Jun 2026, 07:30 IST: summer opens at 7:00
    const s = placeOpenStatus(bankeBihari(), at('2026-06-01T02:00:00Z'));
    expect(s.isOpen).toBe(true);
    expect(s.until).toBe('12:30 PM');
  });

  test('after the last window: closed with nothing more today', () => {
    // 9 Nov 2026, 22:00 IST
    const s = placeOpenStatus(bankeBihari(), at('2026-11-09T16:30:00Z'));
    expect(s).toMatchObject({ isOpen: false, opensAt: null, until: null });
  });

  test('no timings in the data: no status at all (never a guess)', () => {
    expect(placeOpenStatus({ timings: null })).toBeNull();
    expect(placeOpenStatus(BRAJ_PLACES.find((p) => !p.timings))).toBeNull();
  });
});
