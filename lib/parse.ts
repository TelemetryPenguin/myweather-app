import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';

Parse.setAsyncStorage(AsyncStorage);

Parse.initialize(
  process.env.EXPO_PUBLIC_BACK4APP_APP_ID!,
  process.env.EXPO_PUBLIC_BACK4APP_JS_KEY!
);

(Parse as any).serverURL = 'https://parseapi.back4app.com';

export default Parse;
