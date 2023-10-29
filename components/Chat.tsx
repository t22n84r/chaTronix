import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { GiftedChat, IMessage, Bubble, BubbleProps } from "react-native-gifted-chat";
import { RootStackParamList } from './Start';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

type Props = {
  route: ChatScreenRouteProp;
};

const Chat: React.FC<Props> = ({ route }) => {
   const {bgColor} = route.params;
   const {userName} = route.params

   const [messages, setMessages] = useState<IMessage[]>([]);

   useEffect(() => {
      setMessages([
         {
            _id: 1,
            text: 'Hello Developer!',
            createdAt: new Date(),
            user: {
               _id: 2,
               name: "System",
               avatar: "https://dummyimage.com/200x200/a2d2ff/0d1321.png&text=System",
            },
            system: true,
         },
         {
            _id: 3,
            text: "Hello developer",
            createdAt: new Date(),
            user: {
            _id: 4,
            name: "React Native",
            avatar: "https://reactnative.dev/img/tiny_logo.png",
            },
         },
      ]);
   }, []);

   const onSend = (newMessages: IMessage[]) => {
      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages))
   }
   
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
            _id: 1
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