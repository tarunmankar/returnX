/**
 * ReturnX - Custom SVG Bar Chart Component
 * Uses react-native-svg — no external charting library needed
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { formatINRShort } from '../utils/format';

export interface BarDataItem {
  label: string;       // X-axis label (Year 1, Year 2...)
  value1: number;      // Primary bar (e.g., invested)
  value2?: number;     // Secondary bar (e.g., returns)
  value1Label?: string;
  value2Label?: string;
}

interface BarChartProps {
  data: BarDataItem[];
  title?: string;
  color1?: string;
  color2?: string;
  height?: number;
  showLegend?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color1 = COLORS.primaryLight,
  color2 = COLORS.accent,
  height = 200,
  showLegend = true,
}) => {
  if (!data || data.length === 0) return null;

  const chartWidth = Math.max(data.length * 56, 300);
  const chartHeight = height;
  const paddingLeft = 48;
  const paddingBottom = 32;
  const paddingTop = 12;
  const barAreaHeight = chartHeight - paddingBottom - paddingTop;

  // Find max value
  const maxValue = Math.max(...data.map(d => Math.max(d.value1, d.value2 ?? 0)));
  if (maxValue === 0) return null;

  const barGroupWidth = 48;
  const barPadding = 4;
  const singleBarWidth = data[0].value2 !== undefined
    ? (barGroupWidth - barPadding * 3) / 2
    : barGroupWidth - barPadding * 2;

  // Y-axis labels
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((maxValue / ySteps) * i)
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartWidth + paddingLeft} height={chartHeight}>
          {/* Y-axis grid lines */}
          {yLabels.map((val, i) => {
            const y = paddingTop + barAreaHeight - (val / maxValue) * barAreaHeight;
            return (
              <G key={i}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth + paddingLeft}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={paddingLeft - 4}
                  y={y + 4}
                  fontSize={8}
                  fill={COLORS.textMuted}
                  textAnchor="end"
                >
                  {formatINRShort(val).replace('₹ ', '')}
                </SvgText>
              </G>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const groupX = paddingLeft + index * barGroupWidth + barPadding;
            const bar1Height = (item.value1 / maxValue) * barAreaHeight;
            const bar2Height = item.value2 !== undefined ? (item.value2 / maxValue) * barAreaHeight : 0;
            const bar1X = groupX;
            const bar2X = item.value2 !== undefined ? groupX + singleBarWidth + barPadding : groupX;

            return (
              <G key={index}>
                {/* Bar 1 */}
                <Rect
                  x={bar1X}
                  y={paddingTop + barAreaHeight - bar1Height}
                  width={singleBarWidth}
                  height={bar1Height}
                  fill={color1}
                  rx={3}
                />
                {/* Bar 2 */}
                {item.value2 !== undefined && (
                  <Rect
                    x={bar2X}
                    y={paddingTop + barAreaHeight - bar2Height}
                    width={singleBarWidth}
                    height={bar2Height}
                    fill={color2}
                    rx={3}
                  />
                )}
                {/* X-axis label */}
                <SvgText
                  x={groupX + barGroupWidth / 2 - barPadding}
                  y={chartHeight - 8}
                  fontSize={9}
                  fill={COLORS.textMuted}
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}

          {/* X-axis line */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + barAreaHeight}
            x2={chartWidth + paddingLeft}
            y2={paddingTop + barAreaHeight}
            stroke={COLORS.border}
            strokeWidth={1}
          />
        </Svg>
      </ScrollView>

      {/* Legend */}
      {showLegend && data[0].value1Label && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color1 }]} />
            <Text style={styles.legendText}>{data[0].value1Label}</Text>
          </View>
          {data[0].value2Label && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color2 }]} />
              <Text style={styles.legendText}>{data[0].value2Label}</Text>
            </View>
          )}
        </View>
      )}
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
    marginBottom: SPACING.sm,
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.base,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
  },
  legendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
});

export default BarChart;
