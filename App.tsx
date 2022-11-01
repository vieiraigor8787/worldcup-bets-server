import { useFonts, Roboto_700Bold, Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { NativeBaseProvider, Center, StatusBar } from "native-base";

import { Loading } from "./src/componets/Loading";
import { SignIn } from "./src/screens/SignIn";

import { THEME } from "./src/styles/theme";

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold, Roboto_400Regular, Roboto_500Medium})
  
  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar 
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      <Center flex={1} bgColor="gray.900">
        { fontsLoaded ? <SignIn /> : <Loading /> }
        
      </Center>
    </NativeBaseProvider>
  );
}

