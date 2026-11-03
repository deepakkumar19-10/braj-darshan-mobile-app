/**
 * Deep links: brajdarshan://temple/1, brajdarshan://map, brajdarshan://panchang …
 * Work whether the app is closed, in the background or already open.
 */

import { ROUTES } from './routes';

/** @type {import('@react-navigation/native').LinkingOptions<any>} */
export const linking = {
  prefixes: ['brajdarshan://'],
  config: {
    // A link opened from outside keeps Home underneath, so Back always has somewhere to go.
    initialRouteName: ROUTES.HOME,
    screens: {
      [ROUTES.HOME]: 'home',
      [ROUTES.TEMPLES]: 'temples',
      [ROUTES.TEMPLE_DETAIL]: {
        path: 'temple/:id',
        parse: { id: (id) => Number(id) },
      },
      [ROUTES.MAP]: 'map',
      [ROUTES.PLACES]: 'places',
      [ROUTES.PLACE_DETAIL]: 'place/:key',
      [ROUTES.PANCHANG]: 'panchang',
      [ROUTES.EVENTS]: 'festivals',
      [ROUTES.YATRA]: 'yatra',
      [ROUTES.HELPDESK]: 'help',
      [ROUTES.FAVORITES]: 'saved',
      [ROUTES.MORE]: 'more',
    },
  },
};

export default linking;
