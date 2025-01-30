import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemeProvider, useTheme } from "@/theme/context";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { TouchableOpacity } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [_loaded, _error] = useFonts({
    'Comic-Font': require('../assets/fonts/GloriaHallelujah.ttf'),
  })

  if(!_loaded){
    return null;
  }

  const SettingsIcon = () => {
    const router = useRouter();
    const { colors } = useTheme();

    const onPress = () => {
      router.push({pathname: '/settings'});
    }

/**
  * Currently, the `onPress` function is not working as expected.
  * When trying to call onPress on HeaderRight, the screen is not navigating to the settings screen.
  * Refer - https://github.com/expo/expo/issues/29489
  * That is why using onPressIn for now.  
*/

    return(
      <TouchableOpacity onPressIn={onPress} style={{padding: 10}}> 
        <AntDesign name="setting" size={24} color={colors.text} />
      </TouchableOpacity>
    )
  }

  const Layout = () => {
    const { colors, theme } = useTheme();
    return (
      <>
        <StatusBar
          style={theme === 'system' ? 'auto' : theme === 'dark' ? 'light' : 'dark'}
          backgroundColor={useTheme().colors.primary}
        />
        <Stack 
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTitleStyle: {
            fontFamily: 'Comic-Font',
            fontSize: 24,
            color: colors.text,
          },
          headerTintColor: colors.text,
          headerRight: () => <SettingsIcon/>,
          animation: 'fade',
          animationDuration: 200
        }}
      >
        <Stack.Screen name="index" options={{title: "HackerBuzz"}} />
        <Stack.Screen name="comments" options={{title: "Comments", headerShown: false, presentation: 'containedTransparentModal'}} />
        <Stack.Screen name="settings" options={{title: "Settings", headerRight: ()=>null, presentation: 'containedTransparentModal'}} />
      </Stack>
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
