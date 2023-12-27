import React, { useState } from 'react';
import { StyleSheet, Text, ImageBackground, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, signInAnonymously } from "firebase/auth";

// Types for navigation parameters
export type RootStackParamList = {
  Start: undefined;
  Chat: {
    userID: string;
    bgColor: string;
    userName: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

const Start: React.FC<Props> = ({ navigation }) => {
  // State for selected color and user name
  const [selectedColor, setSelectedColor] = useState('#3D2C8D');
  const [userName, setuserName] = useState<string>('');

  // Color options for the user to select from
  const colorOptions = ['#3D2C8D', '#0C134F', '#183D3D', '#A21232'];

  // Firebase authentication instance
  const auth = getAuth();

  // Function to handle user sign-in
  const signInUser = async () => {
    try {
      const result = await signInAnonymously(auth);
      navigation.navigate('Chat', { userID: result.user.uid, bgColor: selectedColor, userName: userName });
      Alert.alert("Signed in Successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Unable to sign in, try again later.");
    }
  };

  return (
    // Background image for the start screen
    <ImageBackground source={require('../assets/33114791_rm251-mind-06-f.jpg')} style={styles.container}>
      
      <Text style={styles.textStyle}>Hello world!</Text>

      {/* Text input for user name */}
      <TextInput
        style={styles.input}
        onChangeText={setuserName}
        value={userName}
        placeholder="Enter your name..."
        placeholderTextColor="#fff"
      />

      {/* Color selection view */}
      <View style={styles.colorPicker}>
        {colorOptions.map(color => (
          <TouchableOpacity 
            key={color}
            style={{ ...styles.colorCircle, backgroundColor: color }}
            onPress={() => setSelectedColor(color)}>
          </TouchableOpacity>
        ))}
      </View>

      {/* Button to proceed to chat screen */}
      <TouchableOpacity 
        style={{...styles.buttonStyle, backgroundColor: selectedColor,}} 
        onPress={signInUser}>
        <Text style={styles.buttonText}>Go to Chat</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

// StyleSheet for styling the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  textStyle: {
    color: '#fff'
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    color: '#fff',
    padding: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    margin: 10
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 25,
    margin: 5
  },
  buttonStyle: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  }
});

export default Start;
