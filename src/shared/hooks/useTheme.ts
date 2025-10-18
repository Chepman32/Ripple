import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ColorScheme } from '../constants/colors';

export const useTheme = (): { colors: ColorScheme; isDark: boolean } => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
};
