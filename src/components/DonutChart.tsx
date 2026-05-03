/**
 * ReturnX - Donut Chart Component (SVG)
 * Shows proportional breakdown (Principal vs Returns)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { formatINRShort, formatPercent } from '../utils/format';

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  centerLabel = 'Total',
  centerValue,
  size = 140,
  strokeWidth = 24,
  title,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartRow}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {segments.map((segment, index) => {
              const percent = segment.value / total;
              const dashArray = `${percent * circumference} ${(1 - percent) * circumference}`;
              const dashOffset = -cumulativePercent * circumference;
              cumulativePercent += percent;

              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>

        {/* Center label */}
        {centerValue !== undefined && (
          <View style={[styles.centerLabel, { top: size / 2 - 20, left: size / 2 - 40 }]}>
            <Text style={styles.centerLabelText}>{centerLabel}</Text>
            <Text style={styles.centerValue}>{formatINRShort(centerValue)}</Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <View>
                <Text style={styles.legendLabel}>{segment.label}</Text>
                <Text style={[styles.legendValue, { color: segment.color }]}>
                  {formatINRShort(segment.value)}
                  <Text style={styles.legendPercent}>
                    {' '}({formatPercent((segment.value / total) * 100, 0)})
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  centerValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  legend: {
    flex: 1,
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
  },
  legendLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  legendValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  legendPercent: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
});

export default DonutChart;
