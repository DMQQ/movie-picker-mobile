import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD2DarkTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Bebas: require('../../assets/fonts/BebasNeue-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={MD2DarkTheme}>
          <ThemeProvider value={DarkTheme}>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                
                {/* Movie Details */}
                <Stack.Screen 
                  name="movie/[...params]" 
                  options={{ 
                    headerShown: false,
                    headerTransparent: true,
                  }} 
                />
                
                {/* Modals */}
                <Stack.Screen 
                  name="settings" 
                  options={{ 
                    presentation: 'modal',
                    ...(Platform.OS === "ios" && { 
                      animation: "fade", 
                      gestureEnabled: true 
                    }),
                  }} 
                />
                <Stack.Screen 
                  name="search-filters" 
                  options={{ 
                    presentation: 'modal',
                    ...(Platform.OS === "ios" && { 
                      animation: "fade", 
                      gestureEnabled: true 
                    }),
                  }} 
                />
                <Stack.Screen 
                  name="region-selector" 
                  options={{ 
                    presentation: 'modal',
                    ...(Platform.OS === "ios" && { 
                      animation: "fade", 
                      gestureEnabled: true 
                    }),
                  }} 
                />
                
                {/* Game Screens */}
                <Stack.Screen name="fortune" options={{ headerShown: false }} />
                <Stack.Screen name="overview" options={{ headerShown: false }} />
                <Stack.Screen name="group" options={{ headerShown: false }} />
                
                {/* Dynamic Routes */}
                <Stack.Screen name="voter/[sessionId]" options={{ headerShown: false }} />
                <Stack.Screen name="room/[roomId]" options={{ headerShown: false }} />
                <Stack.Screen name="room/qr-scanner" options={{ headerShown: false }} />
                <Stack.Screen name="room/setup" options={{ headerShown: false }} />
                <Stack.Screen name="room/summary" options={{ headerShown: false }} />
              </Stack>
            </GestureHandlerRootView>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}