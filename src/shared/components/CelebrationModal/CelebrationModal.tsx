import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import { Button } from '../Button';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { spacing, typography } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji?: string;
  showConfetti?: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  emoji = '🎉',
  showConfetti = true,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      haptic.success();

      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });

      emojiScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 }),
        ),
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
      emojiScale.value = 0;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {showConfetti && <ConfettiAnimation count={50} />}

        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: colors.modalOverlay },
            backdropStyle,
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.surface },
            modalStyle,
          ]}
        >
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {emoji}
          </Animated.Text>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          <Button
            variant="primary"
            onPress={onClose}
            fullWidth
            style={styles.button}
          >
            Awesome!
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: SCREEN_WIDTH - spacing['4xl'] * 2,
    borderRadius: 24,
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.lg,
  },
});
