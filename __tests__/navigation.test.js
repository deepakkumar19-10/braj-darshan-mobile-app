/* eslint-env jest */
import { StackRouter } from '@react-navigation/routers';
import { popBackToTabs } from '../src/navigation/RootNavigator';
import { ROUTES } from '../src/navigation/routes';

// The app's root stack, with the override that pops back to a tab instead of reordering it.
const names = [ROUTES.HOME, ROUTES.TEMPLES, ROUTES.PANCHANG, ROUTES.MAP, ROUTES.MORE, ROUTES.PLACE_DETAIL, ROUTES.TEMPLE_DETAIL];
const tab = () => 'tab';
const options = {
  routeNames: names,
  routeParamList: {},
  routeGetIdList: { [ROUTES.HOME]: tab, [ROUTES.TEMPLES]: tab, [ROUTES.PANCHANG]: tab, [ROUTES.MAP]: tab, [ROUTES.MORE]: tab },
};
const original = StackRouter({ initialRouteName: ROUTES.HOME });
const router = { ...original, ...popBackToTabs(original) };
const stackOf = (...routeNames) => {
  let state = original.getInitialState(options);
  for (const name of routeNames.slice(1)) {
    state = original.getStateForAction(state, { type: 'NAVIGATE', payload: { name } }, options);
  }
  return state;
};
const go = (state, name, params) => router.getStateForAction(state, { type: 'NAVIGATE', payload: { name, params } }, options);
const namesOf = (state) => state.routes.map((r) => r.name);

test('a tab already in the stack is popped back to, never moved to the top', () => {
  const state = stackOf(ROUTES.HOME, ROUTES.PANCHANG, ROUTES.TEMPLES, ROUTES.PLACE_DETAIL);
  expect(namesOf(go(state, ROUTES.PANCHANG))).toEqual([ROUTES.HOME, ROUTES.PANCHANG]);
});

test('a tab not yet in the stack is pushed', () => {
  const state = stackOf(ROUTES.HOME, ROUTES.TEMPLE_DETAIL);
  expect(namesOf(go(state, ROUTES.MAP))).toEqual([ROUTES.HOME, ROUTES.TEMPLE_DETAIL, ROUTES.MAP]);
});

test('Home from deep in the stack goes back to the single Home', () => {
  const state = stackOf(ROUTES.HOME, ROUTES.TEMPLES, ROUTES.TEMPLE_DETAIL);
  expect(namesOf(go(state, ROUTES.HOME))).toEqual([ROUTES.HOME]);
});

test('params reach the tab it pops back to (e.g. a search from Home)', () => {
  const state = stackOf(ROUTES.HOME, ROUTES.TEMPLES, ROUTES.TEMPLE_DETAIL);
  const next = go(state, ROUTES.TEMPLES, { search: 'राधा' });
  expect(namesOf(next)).toEqual([ROUTES.HOME, ROUTES.TEMPLES]);
  expect(next.routes[1].params).toEqual({ search: 'राधा' });
});

test('detail screens still push as before', () => {
  const state = stackOf(ROUTES.HOME, ROUTES.TEMPLES);
  expect(namesOf(go(state, ROUTES.TEMPLE_DETAIL, { id: 1 }))).toEqual([ROUTES.HOME, ROUTES.TEMPLES, ROUTES.TEMPLE_DETAIL]);
});
