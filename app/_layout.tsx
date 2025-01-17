import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemeProvider, useTheme } from "@/theme/context";
import { StatusBar } from "expo-status-bar";
import React from "react";

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
    return(
      <TouchableOpacity onPress={() => router.push({pathname: '/settings'})} style={{padding: 10}}>
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
        }}
      >
        <Stack.Screen name="index" options={{title: "HackerBuzz"}} />
        <Stack.Screen name="comments" options={{title: "Comments", headerShown: false}} />
        <Stack.Screen name="settings" options={{title: "Settings", headerRight: ()=>null}} />
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
