import { StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './Start';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

type Props = {
  route: ChatScreenRouteProp;
};

const Chat: React.FC<Props> = ({ route }) => {
   const {bgColor} = route.params;
   const {userName} = route.params

   return (
      <View style={{...styles.container, backgroundColor: bgColor}}>
         <Text style={styles.textStyle}>Hello {userName}!</Text>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
   },
   textStyle: {
      fontSize: 32,
      color: 'white'
   }
 });

export default Chat;