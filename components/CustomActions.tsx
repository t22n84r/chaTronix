// Importing necessary components and hooks from react-native and expo
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";

// Defining interface for the CustomActions component props
interface CustomActionsProps {
   wrapperStyle?: StyleProp<ViewStyle>; // Optional style prop for the wrapper
   iconTextStyle?: StyleProp<TextStyle>; // Optional style prop for the icon text
   onSendLocation: () => Promise<void>; // Function to handle sending location
   pickImage: () => Promise<void>; // Function to handle image picking
   takePhoto: () => Promise<void>; // Function to handle taking a photo
} 

// CustomActions functional component
const CustomActions = ({ wrapperStyle, iconTextStyle, pickImage, takePhoto, onSendLocation }: CustomActionsProps) => {
   const actionSheet = useActionSheet(); // Hook to use action sheet from expo

   // Function to handle action sheet options
   const onActionPress = () => {
      // Options for the action sheet
      const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
      const cancelButtonIndex = options.length - 1; // Index of the cancel button

      // Showing the action sheet with options
      actionSheet.showActionSheetWithOptions(
         {
           options,
           cancelButtonIndex,
         },
         async (buttonIndex) => { // Callback function for button press
            switch (buttonIndex) {
               case 0: // Case for picking an image from library
               console.log('user wants to pick an image');
               pickImage();
               return;
               case 1: // Case for taking a photo
               console.log('user wants to take a photo');
               takePhoto();
               return;
               case 2: // Case for sending location
               console.log('user wants to get their location');
               await onSendLocation();
               default:
            }
         },
      );
   }

   // Returning the touchable component
   return (
      <TouchableOpacity 
         style={styles.container}
         onPress={onActionPress}
         accessible={true}
         accessibilityLabel="More options"
         accessibilityRole="button"
      >
         <View style={[styles.wrapper, wrapperStyle]}>
            <Text style={[styles.iconText, iconTextStyle]}>+</Text>
         </View>
      </TouchableOpacity>
   );
}

// StyleSheet for styling the components
const styles = StyleSheet.create({
   container: {
      width: 26,
      height: 26,
      marginLeft: 10,
      marginBottom: 10,
   },
   wrapper: {
      borderRadius: 15,
      borderColor: '#1D2D44',
      borderWidth: 2,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   iconText: {
      color: '#1D2D44',
      fontWeight: 'bold',
      fontSize: 20,
      backgroundColor: 'transparent',
   },
});

// Exporting CustomActions as a default export
export default CustomActions;