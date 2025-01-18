import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemeProvider, useTheme } from "@/theme/context";
import { StatusBar } from "expo-status-bar";
import React from "react";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

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
    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(()=>{
      return {
        transform: [
          {rotate: `${interpolate(rotation.value, [0, 1], [0, 360])}deg`}
        ]
      }
    })

    const onPress = () => {
      rotation.value = withSpring(rotation.value +1, {
        damping: 15,
        stiffness: 90,
        mass: 0.8
      });
      setTimeout(()=>{
        router.push({pathname: '/settings'});
      }, 400);
    }
    
    return(
      <AnimatedTouchable onPress={onPress} style={[{padding: 10}, animatedStyle]}>
        <AntDesign name="setting" size={24} color={colors.text} />
      </AnimatedTouchable>
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
