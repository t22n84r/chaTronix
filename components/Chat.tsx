import { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { GiftedChat, IMessage, Bubble, BubbleProps } from "react-native-gifted-chat";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, Firestore } from 'firebase/firestore';
import { RootStackParamList } from './Start';
import { FirestoreContext } from "../contexts/FirestoreContext";

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const Chat: React.FC<Props> = ({ route }) => {
   const {userID, bgColor, userName} = route.params;

   const [messages, setMessages] = useState<IMessage[]>([]);

   const db = useContext(FirestoreContext);

   useEffect(() => {
      if (db) {
        // Create a query against the messages collection, ordering by createdAt
        const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    
        // Listen for query snapshot updates
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
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
    
          // Update the messages state
          setMessages(messages);
        });
    
        // Unsubscribe from the snapshot listener when the component unmounts
        return () => unsubscribe();
      }
   }, [db]); // Add db as a dependency for useEffect

   const onSend = (newMessages: IMessage[]) => {
      if (db && newMessages.length > 0) {
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