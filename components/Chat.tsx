import { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView, Image, Alert } from 'react-native';
import { GiftedChat, IMessage, Bubble, BubbleProps, InputToolbar, InputToolbarProps, ActionsProps } from "react-native-gifted-chat";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from "@react-native-community/netinfo";
import { RootStackParamList } from './Start';
import { FirestoreContext } from "../contexts/FirestoreContext";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';

// Type definition for navigation props
type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// Extended custom message type to include location data
interface CustomMessage extends IMessage {
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Type definition for props of the custom view
type CustomViewProps = BubbleProps<CustomMessage>;

const Chat: React.FC<Props> = ({ route }) => {
  // Extracting parameters passed through navigation
  const { userID, bgColor, userName } = route.params;
  
  // State for managing messages in the chat
  const [messages, setMessages] = useState<CustomMessage[]>([]);

  // Network info for checking connectivity status
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? false;

  // Accessing Firestore and Storage context
  const { db, storage } = useContext(FirestoreContext);

  // Effect for handling Firestore network state
  useEffect(() => {
    if (db) {
      if (isConnected) {
        enableNetwork(db).catch((error) => console.error("Error enabling Firestore network", error));
      } else {
        disableNetwork(db).catch((error) => console.error("Error disabling Firestore network", error));
      }
    }
  }, [isConnected, db]);

  // Effect for fetching and setting up messages from Firestore
  useEffect(() => {
    if (db && isConnected) {
      const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const firebaseData = doc.data();
          const jsDate = new Date(firebaseData.createdAt.seconds * 1000);
          const message: CustomMessage = {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: jsDate,
            user: firebaseData.user,
            location: firebaseData.location,
            image: firebaseData.image
          };
          return message;
        });
        setMessages(messages);
        await AsyncStorage.setItem('cachedMessages', JSON.stringify(messages));
      });
      return () => unsubscribe();
    } else {
      AsyncStorage.getItem('cachedMessages')
        .then(cachedData => {
          if (cachedData) {
            setMessages(JSON.parse(cachedData));
          }
        })
        .catch(error => console.error("Error loading cached messages: ", error));
    }
  }, [db, isConnected]);

  // Clear cached messages from AsyncStorage
  const clearCachedMessages = async () => {
    try {
      await AsyncStorage.removeItem('cachedMessages');
      console.log('Cached messages cleared');
    } catch (error) {
      console.error('Error clearing cached messages:', error);
    }
  };

  // Handler for sending new messages
  const onSend = (newMessages: CustomMessage[]) => {
    if (db && isConnected && newMessages.length > 0) {
      const message = newMessages[0];
      const firestoreTimestamp = message.createdAt instanceof Date ? 
        Timestamp.fromDate(message.createdAt) : 
        message.createdAt;
      const firestoreMessage = {
        ...message,
        createdAt: firestoreTimestamp,
      };
      addDoc(collection(db as Firestore, "messages"), firestoreMessage)
        .then(documentReference => {
          console.log(`Message sent with ID: ${documentReference.id}`);
        })
        .catch(error => {
          console.error("Error sending message: ", error);
        });
    } else if (!db) {
      console.error('Firestore instance not initialized');
    } else if (!isConnected) {
      console.error('No internet connection');
    }
  };

  // Custom bubble renderer for messages
  const renderBubble = (props: BubbleProps<CustomMessage>) => {
    const username = props.currentMessage?.user?.name;
    return (
      <View>
        {username && <Text style={{ fontWeight: 'bold', marginBottom: 5, color: 'white' }}>{username}</Text>}
        <Bubble {...props} wrapperStyle={props.wrapperStyle} />
      </View>
    );
  };

  // Custom input toolbar renderer
  const renderInputToolbar = (props: InputToolbarProps<CustomMessage>) => {
    if (!isConnected) return null;
    return <InputToolbar {...props} />;
  };

  // Custom actions for the input toolbar
  const renderCustomActions = (props: ActionsProps) => {
    if (!isConnected) return null;
    return <CustomActions {...props} pickImage={pickImage} takePhoto={takePhoto} onSendLocation={sendLocation} />;
  };

  // Custom avatar renderer
  const renderAvatar = (props: any) => {
    const user = props.currentMessage ? props.currentMessage.user : props.user;
    if (user && user.avatar) {
      return <Image source={{ uri: user.avatar }} style={{ width: 64, height: 64, borderRadius: 50 }} />;
    }
    return null;
  };

  // Custom view renderer for map and images
  const renderCustomView = (props: CustomViewProps) => {
    if (props.currentMessage?.location) {
      const { latitude, longitude } = props.currentMessage.location;
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

// Function to send the current location
const sendLocation = async () => {
  // Request permission to access location in the foreground
  let permissions = await Location.requestForegroundPermissionsAsync();

  // Check if permission is granted
  if (permissions?.granted) {
      // Get the current position
      const location = await Location.getCurrentPositionAsync({});

      // If location is successfully retrieved
      if (location) {
          // Construct a location message object
          const locationMessage = {
              _id: Math.round(Math.random() * 1000000).toString(), // Unique message ID
              text: "Location", // Text content of the message
              createdAt: new Date(), // Timestamp of message creation
              user: {
                  _id: userID, // User ID from route parameters
                  name: userName, // User name from route parameters
              },
              location: {
                  latitude: location.coords.latitude, // Latitude of the location
                  longitude: location.coords.longitude, // Longitude of the location
              },
          };

          // Send the location message
          onSend([locationMessage]);
      } else {
          // Alert if location could not be fetched
          Alert.alert("Error occurred while fetching location");
      }
  } else {
      // Alert if location permissions are not granted
      Alert.alert("Permissions haven't been granted.");
  }
};

// Function to pick an image from the library
const pickImage = async () => {
  // Request permission to access media library
  let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

  // Check if permission is granted
  if (permissions?.granted) {
      // Launch the image library and allow selection of images only
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      // If image is selected and not cancelled
      if (!result.canceled && result.assets && result.assets.length > 0) {
          // Upload the selected image and send it
          await uploadAndSendImage(result.assets[0].uri);
      }
  } else {
      // Alert if media library permissions are not granted
      Alert.alert("Permissions haven't been granted.");
  }
};

// Function to take a photo using the camera
const takePhoto = async () => {
  // Request permission to access camera
  let permissions = await ImagePicker.requestCameraPermissionsAsync();

  // Check if permission is granted
  if (permissions?.granted) {
      // Launch the camera and allow taking of images only
      let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      // If photo is taken and not cancelled
      if (!result.canceled && result.assets && result.assets.length > 0) {
          // Upload the taken photo and send it
          await uploadAndSendImage(result.assets[0].uri);
      }
  } else {
      // Alert if camera permissions are not granted
      Alert.alert("Permissions haven't been granted.");
  }
};

// Function to upload an image to Firebase and send it as a message
const uploadAndSendImage = async (imageURI: string) => {
  // Create a unique name for the image to be stored in Firebase
  const imageName = `chat-images/${Date.now()}-${userID}`;
  // Create a reference to Firebase Storage with the image name
  const imageRef = ref(storage, imageName);

  // Fetch the image from the URI and convert it to a blob
  const response = await fetch(imageURI);
  const blob = await response.blob();

  // Upload the image blob to Firebase Storage
  uploadBytes(imageRef, blob).then(async (snapshot) => {
      // Get the URL of the uploaded image
      const imageURL = await getDownloadURL(snapshot.ref);

      // Construct an image message object
      const imageMessage = {
          _id: Math.round(Math.random() * 1000000).toString(), // Unique message ID
          text: '', // Empty text content
          createdAt: new Date(), // Timestamp of message creation
          user: {
              _id: userID, // User ID
              name: userName, // User name
          },
          image: imageURL, // URL of the uploaded image
      };

      // Send the image message
      onSend([imageMessage]);
  }).catch((error) => {
      // Log error if image upload fails
      console.error("Error uploading image to Firebase Storage:", error);
  });
  };

  return (
    // View component with combined styles for container and dynamic background color
    <View style={{...styles.container, backgroundColor: bgColor}}>
        {/* Displaying a greeting message with dynamic user name */}
        <Text style={styles.textStyle}>Hello {userName}!</Text>

        {/* GiftedChat component to handle chat functionalities */}
        <GiftedChat
          messages={messages} // Array of message objects to display
          renderBubble={renderBubble} // Custom function to render chat bubbles
          showUserAvatar={true} // Boolean to show the user's avatar
          showAvatarForEveryMessage={true} // Boolean to show avatar for every message
          renderAvatar={renderAvatar} // Custom function to render avatars
          onSend={(messages: CustomMessage[]) => onSend(messages)} // Function to handle the sending of messages
          user={{
            _id: userID, // Unique ID for the user
            name: userName // Name of the user
          }}
          renderInputToolbar={renderInputToolbar} // Custom function to render the input toolbar
          renderActions={renderCustomActions} // Custom function to render additional action buttons
          renderCustomView={renderCustomView} // Custom function to render custom views within messages
        />

        {/* Conditional rendering for Android to avoid keyboard overlap */}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
    </View>
  );
};

// Stylesheet for the Chat component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Flex value to take up the full height of the screen
  },
  textStyle: {
    fontSize: 32, // Font size for the greeting text
    color: 'white', // Text color
    textAlign: 'center', // Aligning text to the center
    marginTop: 10, // Top margin for the text
  }
});

// Exporting the Chat component as the default export
export default Chat;