/**
 * Smoke test for the Nov 2026 redesign: the whole app renders Home, then the Places of Braj
 * screen (a town picked from Home's dham row) and one place, without a crash.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { navigationRef } from '../src/navigation/RootNavigator';
import { ROUTES } from '../src/navigation/routes';
import { BRAJ_PLACES } from '../src/utils/brajPlaces';

const nav = navigationRef as unknown as { navigate: (name: string, params?: object) => void };

// The real provider waits for a native measurement that never comes in Jest.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// All visible text in the rendered tree (props are skipped: some hold circular objects).
type Node = ReactTestRenderer.ReactTestRendererJSON | string;
const collect = (node: Node | Node[] | null, out: string[]): string[] => {
  if (node == null) return out;
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (typeof node === 'string') out.push(node);
  else collect(node.children as Node[] | null, out);
  return out;
};
const textOf = (r: ReactTestRenderer.ReactTestRenderer) => collect(r.toJSON() as Node | Node[] | null, []).join(' ');

test('Home, Places of Braj and a place render', async () => {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    r = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  });
  const home = textOf(r);
  expect(home).not.toContain('कुछ गड़बड़ हो गई'); // the error screen
  expect(home).toContain('राधे राधे');
  expect(home).toContain('आज का ब्रज');
  expect(home).toContain('ब्रज के धाम');

  await ReactTestRenderer.act(async () => {
    nav.navigate(ROUTES.BRAJ_PLACES, { town: 'barsana' });
  });
  const places = textOf(r);
  expect(places).not.toContain('कुछ गड़बड़ हो गई'); // the error screen
  expect(places).toContain('ब्रज के स्थल');
  expect(places).toContain('बरसाना');

  const place = BRAJ_PLACES.find((p) => p.templeId == null && p.photo)!;
  await ReactTestRenderer.act(async () => {
    nav.navigate(ROUTES.BRAJ_PLACE, { id: place.id });
  });
  const detail = textOf(r);
  expect(detail).not.toContain('कुछ गड़बड़ हो गई'); // the error screen
  expect(detail).toContain(place.nameHi);
  expect(detail).toContain('रास्ता देखें');

  await ReactTestRenderer.act(async () => {
    r.unmount();
  });
});
