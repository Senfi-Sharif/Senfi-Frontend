import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  LabelList,
} from 'recharts';
import { FaChartBar, FaChartLine, FaChartPie, FaTable } from 'react-icons/fa';
import type { UniversityPublicationCategory } from '../hooks/useExcelData';
import {
  processPublicationData,
  getYearlyCounts,
  getMonthlyCounts,
  getSeasonCounts,
  getYearMonthMatrix,
  getCategoryCounts,
  getWeekOfYearCounts,
  getCategoryByYearData,
  toPersianDigits,
  PERSIAN_MONTH_NAMES,
} from '../utils/publicationChartUtils';

type ChartType =
  | 'yearly'
  | 'monthly'
  | 'season'
  | 'yearMonthHeatmap'
  | 'weekOfYear'
  | 'categoryByYear';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
];

interface PublicationChartsProps {
  categories: UniversityPublicationCategory[];
}

export default function PublicationCharts({ categories }: PublicationChartsProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>('yearly');

  const processedData = useMemo(() => {
    return processPublicationData(categories);
  }, [categories]);

  const chartData = useMemo(() => {
    switch (selectedChart) {
      case 'yearly':
        return getYearlyCounts(processedData.years);
      case 'monthly':
        return getMonthlyCounts(processedData.months);
      case 'season':
        return getSeasonCounts(processedData.seasons);
      case 'weekOfYear':
        return getWeekOfYearCounts(processedData.weeksOfYear);
      case 'categoryByYear':
        return getCategoryByYearData(categories);
      case 'yearMonthHeatmap':
        return getYearMonthMatrix(processedData.yearMonthPairs);
      default:
        return [];
    }
  }, [selectedChart, processedData, categories]);

  const chartOptions = [
    { value: 'yearly' as ChartType, label: 'نمودار سالانه', icon: <FaChartBar /> },
    { value: 'monthly' as ChartType, label: 'نمودار ماهانه', icon: <FaChartPie /> },
    { value: 'season' as ChartType, label: 'نمودار فصلی', icon: <FaChartPie /> },
    { value: 'weekOfYear' as ChartType, label: 'نمودار هفته سال', icon: <FaChartLine /> },
    { value: 'categoryByYear' as ChartType, label: 'دسته‌بندی بر اساس سال', icon: <FaChartBar /> },
    { value: 'yearMonthHeatmap' as ChartType, label: 'نقشه حرارتی ماه و سال', icon: <FaTable /> },
  ];

  const renderChart = () => {
    if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          داده‌ای برای نمایش وجود ندارد
        </div>
      );
    }

    switch (selectedChart) {
      case 'yearly': {
        const data = chartData as Array<{ year: number; count: number; label: string }>;
        return (
          <ResponsiveContainer width="100%" height={550}>
            <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 160 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={160}
                interval={0}
                dy={15}
                dx={-5}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => toPersianDigits(value)}
                labelFormatter={(label) => `سال: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="تعداد نشریات">
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={8}
                  formatter={(value: number) => toPersianDigits(value)}
                  style={{
                    fill: '#fff',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    stroke: '#000',
                    strokeWidth: '0.5px',
                    paintOrder: 'stroke fill',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'monthly': {
        const data = chartData as Array<{ month: number; count: number; label: string }>;
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry: any) => {
                  if (entry.percent < 0.05) return ''; // برای بخش‌های کوچک label نشان نده
                  return `${entry.label}: ${toPersianDigits(entry.count)}`;
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const percent = props.payload.percent;
                  if (percent === undefined || isNaN(percent)) {
                    return [`${toPersianDigits(value)}`, props.payload.label];
                  }
                  return [
                    `${toPersianDigits(value)} (${(percent * 100).toFixed(1)}%)`,
                    props.payload.label,
                  ];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span className="publication-chart-legend-text">
                    {entry.payload.label}: {toPersianDigits(entry.payload.count)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'season': {
        const data = chartData as Array<{ season: number; count: number; label: string }>;
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry: any) => {
                  if (!entry.percent || entry.percent < 0.05) return '';
                  return `${entry.label}: ${toPersianDigits(entry.count)}`;
                }}
                outerRadius={120}
                fill="#82ca9d"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const percent = props.payload.percent;
                  if (percent === undefined || isNaN(percent)) {
                    return [`${toPersianDigits(value)}`, props.payload.label];
                  }
                  return [
                    `${toPersianDigits(value)} (${(percent * 100).toFixed(1)}%)`,
                    props.payload.label,
                  ];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span className="publication-chart-legend-text">
                    {entry.payload.label}: {toPersianDigits(entry.payload.count)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'weekOfYear': {
        const data = chartData as Array<{ week: number; count: number }>;
        return (
          <div>
            <div style={{ 
              padding: '15px', 
              marginBottom: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center',
              color: '#555',
              fontSize: '14px'
            }}>
              <strong>توضیحات:</strong> این نمودار تعداد نشریات را به ازای هر هفته سال (از هفته ۱ تا ۵۳) نمایش می‌دهد، بدون توجه به اینکه در کدام سال منتشر شده‌اند.
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => toPersianDigits(value)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => toPersianDigits(value)}
                  labelFormatter={(label) => `هفته ${toPersianDigits(label)}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="تعداد نشریات"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 'categoryByYear': {
        const data = chartData as {
          years: number[];
          categories: string[];
          data: Array<Record<string, number>>;
        };
        return (
          <ResponsiveContainer width="100%" height={550}>
            <ComposedChart data={data.data} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => toPersianDigits(value)}
                angle={-45}
                textAnchor="end"
                height={160}
                interval={0}
                dy={15}
                dx={-5}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => toPersianDigits(value)}
                labelFormatter={(label) => `سال: ${toPersianDigits(label)}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              {data.categories.slice(0, 10).map((cat, index) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={cat}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      }

      case 'yearMonthHeatmap': {
        const data = chartData as {
          years: number[];
          months: number[];
          data: Array<Array<{ year: number; month: number; count: number }>>;
        };
        // برای heatmap از جدول استفاده می‌کنیم - سال‌ها از چپ به راست (برعکس)
        const reversedYears = [...data.years].reverse();
        return (
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                direction: 'ltr',
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #ddd', direction: 'rtl' }}>ماه / سال</th>
                  {reversedYears.map((year) => (
                    <th
                      key={year}
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        minWidth: '60px',
                      }}
                    >
                      {toPersianDigits(year)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.months.map((month, monthIdx) => (
                  <tr key={month}>
                    <td
                      style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        fontWeight: 'bold',
                        direction: 'rtl',
                      }}
                    >
                      {PERSIAN_MONTH_NAMES[month]}
                    </td>
                    {data.data[monthIdx].slice().reverse().map((cell, yearIdx) => {
                      const maxCount = Math.max(
                        ...data.data.flat().map((c) => c.count)
                      );
                      const intensity = maxCount > 0 ? cell.count / maxCount : 0;
                      const bgColor = `rgba(136, 132, 216, ${0.3 + intensity * 0.7})`;
                      return (
                        <td
                          key={`${cell.year}-${cell.month}`}
                          style={{
                            padding: '8px',
                            border: '1px solid #ddd',
                            backgroundColor: bgColor,
                            textAlign: 'center',
                            color: intensity > 0.5 ? 'white' : 'black',
                          }}
                        >
                          {cell.count > 0 ? toPersianDigits(cell.count) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="publication-charts-container">
      <div className="publication-charts-header">
        <h2>نمودارهای آماری نشریات</h2>
        <div className="publication-charts-selector">
          {chartOptions.map((option) => (
            <button
              key={option.value}
              className={`publication-chart-button ${
                selectedChart === option.value ? 'active' : ''
              }`}
              onClick={() => setSelectedChart(option.value)}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="publication-charts-content">{renderChart()}</div>
    </div>
  );
}

