import moment from 'moment-jalaali';
import type {
  UniversityPublication,
  UniversityPublicationIssue,
  UniversityPublicationCategory,
} from '../hooks/useExcelData';

// نام‌های فارسی ماه‌ها
export const PERSIAN_MONTH_NAMES: Record<number, string> = {
  1: 'فروردین',
  2: 'اردیبهشت',
  3: 'خرداد',
  4: 'تیر',
  5: 'مرداد',
  6: 'شهریور',
  7: 'مهر',
  8: 'آبان',
  9: 'آذر',
  10: 'دی',
  11: 'بهمن',
  12: 'اسفند',
};

// نام‌های فارسی فصل‌ها
export const PERSIAN_SEASON_NAMES: Record<number, string> = {
  1: 'بهار',
  2: 'تابستان',
  3: 'پاییز',
  4: 'زمستان',
};

// تبدیل اعداد انگلیسی به فارسی
export const toPersianDigits = (value: string | number): string => {
  const persianMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return value
    .toString()
    .replace(/[0-9]/g, (digit) => persianMap[parseInt(digit, 10)]);
};

// تبدیل اعداد فارسی به انگلیسی
export const toEnglishDigits = (value: string): string => {
  const englishDigitMap: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  return value.replace(/[۰-۹]/g, (digit) => englishDigitMap[digit] ?? digit);
};

// استخراج سال و ماه از تاریخ شمسی
export const extractYearMonthFromDate = (
  dateStr: string | undefined
): { year: number; month: number } | null => {
  if (!dateStr) return null;

  const value = dateStr.trim();
  if (!value) return null;

  const parts = value.split('/');
  if (parts.length !== 3) return null;

  const toNumber = (input: string | undefined): number | null => {
    if (!input) return null;
    const sanitized = toEnglishDigits(input).replace(/[^0-9]/g, '');
    return sanitized ? parseInt(sanitized, 10) : null;
  };

  const [dayRaw, monthRaw, yearRaw] = parts;
  const year = toNumber(yearRaw);
  const month = toNumber(monthRaw);

  if (!year || !month) return null;
  if (!(1 <= month && month <= 12)) return null;
  if (!(1300 <= year && year <= 1500)) return null;

  return { year, month };
};

// تبدیل ماه به فصل
export const monthToSeason = (month: number): number => {
  if (1 <= month && month <= 3) return 1; // بهار
  if (4 <= month && month <= 6) return 2; // تابستان
  if (7 <= month && month <= 9) return 3; // پاییز
  return 4; // زمستان
};

// محاسبه روز سال شمسی
export const dayOfYearJalali = (year: number, month: number, day: number): number => {
  try {
    const targetDate = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
    const firstDay = moment(`${year}/1/1`, 'jYYYY/jM/jD');
    return targetDate.diff(firstDay, 'days') + 1;
  } catch {
    // محاسبه تقریبی
    const daysInMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    const isLeap = (year % 33) in [1, 5, 9, 13, 17, 22, 26, 30];
    if (isLeap) daysInMonths[11] = 30;
    return daysInMonths.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
  }
};

// محاسبه شماره هفته در سال
export const weekOfYearJalali = (year: number, month: number, day: number): number => {
  const dayOfYear = dayOfYearJalali(year, month, day);
  return Math.floor((dayOfYear - 1) / 7) + 1;
};

// پردازش داده‌های نشریات برای نمودارها
export const processPublicationData = (
  categoriesData: UniversityPublicationCategory[]
) => {
  const yearMonthPairs: Array<{ year: number; month: number }> = [];
  const years: number[] = [];
  const months: number[] = [];
  const seasons: number[] = [];
  const weeksOfYear: number[] = [];
  const categories: string[] = [];

  categoriesData.forEach((category) => {
    category.publications.forEach((publication) => {
      publication.issues.forEach((issue) => {
        const dateInfo = extractYearMonthFromDate(issue.date);
        if (dateInfo) {
          const { year, month } = dateInfo;
          yearMonthPairs.push({ year, month });
          years.push(year);
          months.push(month);
          seasons.push(monthToSeason(month));

          // محاسبه هفته سال
          const day = parseInt(toEnglishDigits(issue.date?.split('/')[0] || '1'), 10) || 1;
          weeksOfYear.push(weekOfYearJalali(year, month, day));
        }

        // استخراج دسته‌بندی
        if (publication.category) {
          categories.push(publication.category);
        }
        publication.subcategories.forEach((subcat) => {
          if (subcat) categories.push(subcat);
        });
      });
    });
  });

  return {
    yearMonthPairs,
    years,
    months,
    seasons,
    weeksOfYear,
    categories,
  };
};

// شمارش بر اساس سال
export const getYearlyCounts = (years: number[]) => {
  const counts: Record<number, number> = {};
  years.forEach((year) => {
    counts[year] = (counts[year] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([year, count]) => ({
      year: parseInt(year, 10),
      count,
      label: toPersianDigits(year),
    }))
    .sort((a, b) => a.year - b.year);
};

// شمارش بر اساس ماه
export const getMonthlyCounts = (months: number[]) => {
  const counts: Record<number, number> = {};
  months.forEach((month) => {
    counts[month] = (counts[month] || 0) + 1;
  });
  return Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    month,
    count: counts[month] || 0,
    label: PERSIAN_MONTH_NAMES[month],
  }));
};

// شمارش بر اساس فصل
export const getSeasonCounts = (seasons: number[]) => {
  const counts: Record<number, number> = {};
  seasons.forEach((season) => {
    counts[season] = (counts[season] || 0) + 1;
  });
  return Array.from({ length: 4 }, (_, i) => i + 1).map((season) => ({
    season,
    count: counts[season] || 0,
    label: PERSIAN_SEASON_NAMES[season],
  }));
};

// ماتریس ماه و سال (heatmap)
export const getYearMonthMatrix = (
  yearMonthPairs: Array<{ year: number; month: number }>
) => {
  const matrix: Record<number, Record<number, number>> = {};
  const yearSet = new Set<number>();
  const monthSet = new Set<number>();

  yearMonthPairs.forEach(({ year, month }) => {
    yearSet.add(year);
    monthSet.add(month);
    if (!matrix[year]) matrix[year] = {};
    matrix[year][month] = (matrix[year][month] || 0) + 1;
  });

  const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
  const sortedMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  return {
    years: sortedYears,
    months: sortedMonths,
    data: sortedMonths.map((month) =>
      sortedYears.map((year) => ({
        year,
        month,
        count: matrix[year]?.[month] || 0,
      }))
    ),
  };
};

// شمارش بر اساس دسته‌بندی
export const getCategoryCounts = (categories: string[]) => {
  const counts: Record<string, number> = {};
  categories.forEach((cat) => {
    if (cat && cat.trim()) {
      counts[cat] = (counts[cat] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 10 دسته برتر
};

// شمارش بر اساس هفته سال
export const getWeekOfYearCounts = (weeksOfYear: number[]) => {
  const counts: Record<number, number> = {};
  weeksOfYear.forEach((week) => {
    counts[week] = (counts[week] || 0) + 1;
  });
  return Array.from({ length: 53 }, (_, i) => i + 1).map((week) => ({
    week,
    count: counts[week] || 0,
  }));
};

// نمودار ترکیبی دسته‌بندی و سال
export const getCategoryByYearData = (
  categoriesData: UniversityPublicationCategory[]
) => {
  const dataMap: Record<number, Record<string, number>> = {};
  const categorySet = new Set<string>();

  categoriesData.forEach((category) => {
    category.publications.forEach((publication) => {
      const catName = publication.category || category.name;
      categorySet.add(catName);

      publication.issues.forEach((issue) => {
        const dateInfo = extractYearMonthFromDate(issue.date);
        if (dateInfo) {
          const { year } = dateInfo;
          if (!dataMap[year]) dataMap[year] = {};
          dataMap[year][catName] = (dataMap[year][catName] || 0) + 1;
        }
      });
    });
  });

  const sortedYears = Object.keys(dataMap)
    .map(Number)
    .sort((a, b) => a - b);
  const categoriesList = Array.from(categorySet);

  return {
    years: sortedYears,
    categories: categoriesList,
    data: sortedYears.map((year) => {
      const yearData: Record<string, number> = { year };
      categoriesList.forEach((cat) => {
        yearData[cat] = dataMap[year]?.[cat] || 0;
      });
      return yearData;
    }),
  };
};

