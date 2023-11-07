import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Start from './components/Start';
import Chat from './components/Chat';
import { RootStackParamList } from './components/Start';
import { FirestoreProvider } from './contexts/FirestoreContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {

  return (
    <FirestoreProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="Chat" component={Chat} />
        </Stack.Navigator>
      </NavigationContainer>
    </FirestoreProvider>
  );
}

export default App;