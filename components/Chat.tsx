import { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { GiftedChat, IMessage, Bubble, BubbleProps, InputToolbar, InputToolbarProps } from "react-native-gifted-chat";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from "@react-native-community/netinfo";
import { RootStackParamList } from './Start';
import { FirestoreContext } from "../contexts/FirestoreContext";

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const Chat: React.FC<Props> = ({ route }) => {
  const {userID, bgColor, userName} = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);

  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? false;

  const db = useContext(FirestoreContext);

  useEffect(() => {
    if (db) {
      if (isConnected) {
        enableNetwork(db).catch((error) => console.error("Error enabling Firestore network", error));
      } else {
        disableNetwork(db).catch((error) => console.error("Error disabling Firestore network", error));
      }
    }
  }, [isConnected, db]);

  useEffect(() => {
    if (db && isConnected) {
      const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  
      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const firebaseData = doc.data();
  
          // Convert the Timestamp to a Date object
          const jsDate = new Date(firebaseData.createdAt.seconds * 1000);
  
          // Construct a GiftedChat compatible message object
          const message: IMessage = {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: jsDate,
            user: {
              _id: firebaseData.user._id,
              name: firebaseData.user.name,
              avatar: firebaseData.user.avatar,
            },
          };
  
          return message;
        });
  
        setMessages(messages);
  
        // Cache messages
        await AsyncStorage.setItem('cachedMessages', JSON.stringify(messages));
      });
  
      return () => unsubscribe();
    } else {
      // Load cached messages when offline
      AsyncStorage.getItem('cachedMessages')
        .then(cachedData => {
          if (cachedData) {
            setMessages(JSON.parse(cachedData));
          }
        })
        .catch(error => console.error("Error loading cached messages: ", error));
    }
  }, [db, isConnected]);

  const clearCachedMessages = async () => {
    try {
      await AsyncStorage.removeItem('cachedMessages');
      console.log('Cached messages cleared');
    } catch (error) {
      console.error('Error clearing cached messages:', error);
    }
  };  
  
  const onSend = (newMessages: IMessage[]) => {
    if (db && isConnected && newMessages.length > 0) {
      const message = newMessages[0];
      // Convert the date to Firestore timestamp if necessary
      const firestoreTimestamp = message.createdAt instanceof Date ? 
        Timestamp.fromDate(message.createdAt) : 
        message.createdAt;

      // Prepare the message to be compatible with Firestore
      const firestoreMessage = {
        ...message,
        createdAt: firestoreTimestamp,
      };

      // Add the message to the "messages" collection in Firestore
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
      // Handle the case when the app is offline
      // For example, show an alert or store the message to send later
      console.error('No internet connection');
    }
  };

  const renderBubble = (props: BubbleProps<IMessage>) => {
      const username = props.currentMessage?.user?.name;
  
      return (
          <View>
              {username && <Text style={{ fontWeight: 'bold', marginBottom: 5, color: 'white' }}>{username}</Text>}
              <Bubble
                  {...props}
                  wrapperStyle={{
                      right: {
                          backgroundColor: "#000",
                      },
                      left: {
                          backgroundColor: "#FFF",
                      },
                  }}
              />
          </View>
      );
  };

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    // Don't render the input bar if there's no connection
    if (!isConnected) return null;
    return <InputToolbar {...props} />;
  };

  const renderAvatar = (props: any) => {
    
    const user = props.currentMessage ? props.currentMessage.user : props.user;
    
    if (user && user.avatar) {
        return (
            <Image
                source={{ uri: user.avatar }}
                style={{ width: 64, height: 64, borderRadius: 50 }}
            />
        );
    }
    // Handle cases where there's no avatar, perhaps return a default avatar or null
    return null;
  };

  return (
    <View style={{...styles.container, backgroundColor: bgColor}}>
        <Text style={styles.textStyle}>Hello {userName}!</Text>

        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          showUserAvatar={true}
          showAvatarForEveryMessage={true}
          renderAvatar={renderAvatar}
          onSend={(messages: IMessage[]) => onSend(messages)}
          user={{
          _id: userID,
          name: userName
          }}
          renderInputToolbar={renderInputToolbar}
        />

        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
     flex: 1,
   },
   textStyle: {
      fontSize: 32,
      color: 'white',
      textAlign: 'center',
      marginTop: 10,
   }
 });

export default Chat;