import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../src/constants/theme';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.accent,
    background: COLORS.primaryDark,
    surface: COLORS.surface,
    onSurface: COLORS.textPrimary,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor={COLORS.primaryDark} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.primaryDark },
            animation: 'slide_from_right',
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
