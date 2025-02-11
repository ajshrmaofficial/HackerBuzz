import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme/context";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import SettingsIcon from "@/components/settingsIcon";
import BookmarkIcon from "@/components/bookmarkIcon";
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { BookmarkProvider } from "../utility/bookmarkContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from 'expo-splash-screen';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  // duration: 400,
  fade: true,
});

const Layout = ({userOnboarded}: {userOnboarded: boolean}) => {
  const { colors, theme } = useTheme();
  const router = useRouter();

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
    animationDuration: 200,
  }), [colors]);

  useEffect(() => {
    if (!userOnboarded) {
      router.replace('/onboarding');
    }
  }, [userOnboarded]);

  return (
    <>
      <StatusBar
        style={theme === 'system' ? 'auto' : theme === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.primary}
      />
      <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: "HackerBuzz", presentation: 'containedTransparentModal' }} />
      <Stack.Screen name="onboarding" options={{headerShown: false, presentation: 'containedTransparentModal'}} />
      <Stack.Screen name="comments" options={{title: "Comments", headerShown: false, presentation: 'containedTransparentModal'}} />
      <Stack.Screen name="settings" options={{title: "Settings", headerRight: ()=>null, presentation: 'containedTransparentModal'}} />
      <Stack.Screen name="bookmarks" options={{title: "Bookmarks", headerRight: ()=>null, presentation: 'containedTransparentModal'}} />
    </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    'Comic-Font': require('../assets/fonts/GloriaHallelujah.ttf'),
  })
  const [userOnboarded, setUserOnboarded] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkOnboardingStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('userOnboarded');
        if (isMounted) {
          setUserOnboarded(onboarded === 'true');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    checkOnboardingStatus();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isInitializing) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitializing]);

  if(!fontsLoaded || isInitializing){
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BookmarkProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <Layout userOnboarded={userOnboarded}/>
          </GestureHandlerRootView>
        </BookmarkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
