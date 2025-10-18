import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { findIconConfig, getDefaultIcon } from '../../constants/habitIcons';

interface HabitIconProps {
  iconName: string;
  iconType?: string;
  size?: number;
  color?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({
  iconName,
  iconType,
  size = 24,
  color = '#000',
}) => {
  // If iconType is provided, use it directly
  if (iconType) {
    const IconComponent =
      iconType === 'Feather'
        ? FeatherIcon
        : iconType === 'MaterialCommunityIcons'
        ? MaterialIcon
        : Icon;
    return <IconComponent name={iconName} size={size} color={color} />;
  }

  // Otherwise, look up the icon config
  const iconConfig = findIconConfig(iconName) || getDefaultIcon();
  const IconComponent =
    iconConfig.type === 'Feather'
      ? FeatherIcon
      : iconConfig.type === 'MaterialCommunityIcons'
      ? MaterialIcon
      : Icon;

  return <IconComponent name={iconConfig.name} size={size} color={color} />;
};
