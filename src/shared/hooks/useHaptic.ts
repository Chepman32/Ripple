import { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType) => {
    const hapticMap = {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
      selection: 'selection',
    } as const;

    ReactNativeHapticFeedback.trigger(hapticMap[type], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  }, []);

  return {
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    selection: () => trigger('selection'),
  };
};
