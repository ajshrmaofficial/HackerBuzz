import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme/context";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import SettingsIcon from "@/components/settingsIcon";
import BookmarkIcon from "@/components/bookmarkIcon";
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { BookmarkProvider } from "../utility/bookmarkContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [_loaded, _error] = useFonts({
    'Comic-Font': require('../assets/fonts/GloriaHallelujah.ttf'),
  })

  if(!_loaded){
    return null;
  }

  const Layout = () => {
    const { colors, theme } = useTheme();

    const screenOptions: NativeStackNavigationOptions = useMemo(() => ({
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
      headerRight: () => <><BookmarkIcon/><SettingsIcon/></>,
      animation: 'fade',
      animationDuration: 200
    }), [colors]);

    return (
      <>
        <StatusBar
          style={theme === 'system' ? 'auto' : theme === 'dark' ? 'light' : 'dark'}
          backgroundColor={colors.primary}
        />
        <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{title: "HackerBuzz"}} />
        <Stack.Screen name="comments" options={{title: "Comments", headerShown: false, presentation: 'containedTransparentModal'}} />
        <Stack.Screen name="settings" options={{title: "Settings", headerRight: ()=>null, presentation: 'containedTransparentModal'}} />
        <Stack.Screen name="bookmarks" options={{title: "Bookmarks", headerRight: ()=>null, presentation: 'containedTransparentModal'}} />
      </Stack>
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BookmarkProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <Layout />
          </GestureHandlerRootView>
        </BookmarkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
