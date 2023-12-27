// Importing React Navigation and Firebase Context components
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Start from './components/Start';
import Chat from './components/Chat';
import { RootStackParamList } from './components/Start';
import { FirestoreProvider } from './contexts/FirestoreContext';

// Creating a stack navigator with a predefined type for navigation props
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    // FirestoreProvider wraps the app to provide Firebase context to all components
    <FirestoreProvider>
      {/* NavigationContainer wraps the navigation stack */}
      <NavigationContainer>
        {/* Stack.Navigator defines the navigation stack */}
        <Stack.Navigator initialRouteName="Start">
          {/* Stack.Screen defines individual screens in the navigation stack */}
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="Chat" component={Chat} />
        </Stack.Navigator>
      </NavigationContainer>
    </FirestoreProvider>
  );
}

export default App;
