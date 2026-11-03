/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// Expo Go and `npx expo start` open the component registered as "main"; the APK opens appName.
AppRegistry.registerComponent('main', () => App);
