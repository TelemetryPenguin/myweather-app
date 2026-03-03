import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';

Parse.setAsyncStorage(AsyncStorage);

Parse.initialize(
  'ZwEcmgfjHiQXGDLKeq4m0aMY2TswjdRL5TCgoiYn', // App ID
  'seWfZTgOwdVIbf4fRg1VqTDuUpTCxr8Rt8ub3wgh'  // JavaScript Key
);

Parse.serverURL = 'https://parseapi.back4app.com';

export default Parse;
