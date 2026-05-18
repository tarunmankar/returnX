/**
 * ReturnX - Logo Component
 * Renders the ReturnX logo using the image provided by the user
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface LogoIconProps {
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 40 }) => {
  return (
    <Image 
      source={require('../../assets/icon.png')} 
      style={{ width: size, height: size, resizeMode: 'cover' }} 
    />
  );
};

interface LogoWithBgProps {
  size?: number;
  bgColor?: string;
  borderRadius?: number;
}

export const LogoWithBg: React.FC<LogoWithBgProps> = ({
  size = 48,
  bgColor = COLORS.primary,
  borderRadius,
}) => {
  const br = borderRadius ?? size * 0.28;
  return (
    <View
      style={[
        styles.logoBg,
        {
          width: size,
          height: size,
          borderRadius: br,
          backgroundColor: bgColor,
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: size * 0.2,
          elevation: 8,
        },
      ]}
    >
      <LogoIcon size={size * 1.14} />
    </View>
  );
};

interface LogoHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  size = 'md',
  showTagline = false,
}) => {
  const { Text } = require('react-native');

  const dimensions = { sm: 32, md: 44, lg: 56 };
  const fontSize = { sm: 18, md: 24, lg: 32 };
  const iconSize = dimensions[size];

  return (
    <View style={styles.headerRow}>
      <LogoWithBg size={iconSize} />
      <View>
        <Text
          style={[
            styles.logoText,
            { fontSize: fontSize[size] },
          ]}
        >
          ReturnX
        </Text>
        {showTagline && (
          <Text style={styles.tagline}>Nivesh Calculator</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoBg: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default LogoIcon;
