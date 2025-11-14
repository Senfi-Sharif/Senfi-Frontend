import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export interface UniversityPublicationIssue {
  title: string;
  fileName?: string;
  url?: string;
  fileId?: string;
  owner?: string;
  manager?: string;
  editor?: string;
  issueNumber?: string;
  period?: string;
  week?: string;
  season?: string;
  date?: string;
  from?: string;
  to?: string;
  description?: string;
}

export interface UniversityPublication {
  name: string;
  pathSegments: string[];
  category: string;
  subcategories: string[];
  owners: string[];
  managers: string[];
  editors: string[];
  issues: UniversityPublicationIssue[];
}

export interface UniversityPublicationCategory {
  name: string;
  publications: UniversityPublication[];
}

function cleanValue(value: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return String(value);
    }
    const str = String(value);
    return str.includes('.') ? str.replace(/0+$/, '').replace(/\.$/, '') : str;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function extractFileId(url: string | null): string | null {
  if (!url) {
    return null;
  }
  const driveMatch = url.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (driveMatch) {
    return driveMatch[1];
  }
  const altMatch = url.match(/id=([A-Za-z0-9_-]+)/);
  return altMatch ? altMatch[1] : null;
}

function buildData(rows: any[]): UniversityPublicationCategory[] {
  const categories = new Map<string, Map<string, UniversityPublication>>();

  rows.forEach((row) => {
    const folderPath = cleanValue(row['Folder Path']);
    const fileType = cleanValue(row['Type']);

    if (!folderPath || fileType !== 'application/pdf') {
      return;
    }

    const segments = folderPath
      .split('/')
      .map((seg: string) => seg.trim())
      .filter((seg: string) => seg && seg !== 'Root');

    const categoryName = segments.length ? segments[0] : 'سایر';
    const pathSegments = segments.length ? segments : ['سایر'];

    if (!categories.has(categoryName)) {
      categories.set(categoryName, new Map());
    }
    const categoryEntry = categories.get(categoryName)!;

    const publicationKey = pathSegments.join('::');
    if (!categoryEntry.has(publicationKey)) {
      categoryEntry.set(publicationKey, {
        name: pathSegments[pathSegments.length - 1],
        pathSegments: [...pathSegments],
        category: categoryName,
        subcategories: pathSegments.slice(1),
        owners: [],
        managers: [],
        editors: [],
        issues: [],
      });
    }

    const publication = categoryEntry.get(publicationKey)!;
    const ownerValue = cleanValue(row['صاحب امتیاز']);
    const managerValue = cleanValue(row['مدیرمسئول']);
    const editorValue = cleanValue(row['سردبیر']);

    if (ownerValue && !publication.owners.includes(ownerValue)) {
      publication.owners.push(ownerValue);
    }
    if (managerValue && !publication.managers.includes(managerValue)) {
      publication.managers.push(managerValue);
    }
    if (editorValue && !publication.editors.includes(editorValue)) {
      publication.editors.push(editorValue);
    }

    const url = cleanValue(row['URL']);
    const issueNumber = cleanValue(row['شماره']);
    const period = cleanValue(row['دوره']);
    const week = cleanValue(row['هفته']);
    const season = cleanValue(row['فصل']);
    const date = cleanValue(row['تاریخ'] || row['میانگین تاریخ']);
    const spanFrom = cleanValue(row['از']);
    const spanTo = cleanValue(row['تا']);
    const description = cleanValue(row['متن']);
    const fileName = cleanValue(row['File Name']);

    const titleParts: string[] = [];
    if (issueNumber) titleParts.push(`شماره ${issueNumber}`);
    if (date) titleParts.push(date);
    const title = titleParts.length ? titleParts.join(' - ') : fileName || 'بدون عنوان';

    const issue: UniversityPublicationIssue = {
      title,
      fileName: fileName || undefined,
      url: url || undefined,
      fileId: url ? extractFileId(url) : undefined,
      owner: ownerValue || undefined,
      manager: managerValue || undefined,
      editor: editorValue || undefined,
      issueNumber: issueNumber || undefined,
      period: period || undefined,
      week: week || undefined,
      season: season || undefined,
      date: date || undefined,
      from: spanFrom || undefined,
      to: spanTo || undefined,
      description: description || undefined,
    };

    publication.issues.push(issue);
  });

  const result: UniversityPublicationCategory[] = Array.from(categories.entries()).map(
    ([categoryName, publicationsMap]) => ({
      name: categoryName,
      publications: Array.from(publicationsMap.values()),
    })
  );

  return result;
}

export function useExcelData() {
  const [data, setData] = useState<UniversityPublicationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExcelData() {
      try {
        setLoading(true);
        setError(null);

        // خواندن فایل اکسل از static یا data
        let response;
        let errorMessage = '';
        
        try {
          response = await fetch('/📁 Public Folder Listing.xlsx');
          if (!response.ok) {
            errorMessage = `مسیر اول (static): ${response.status} ${response.statusText}`;
            // اگر در static نبود، از data بخوان
            response = await fetch('/data/📁 Public Folder Listing.xlsx');
            if (!response.ok) {
              throw new Error(`فایل اکسل پیدا نشد. ${errorMessage}. مسیر دوم (data): ${response.status} ${response.statusText}`);
            }
          }
        } catch (fetchError) {
          throw new Error(`خطا در دریافت فایل اکسل: ${fetchError instanceof Error ? fetchError.message : 'خطای نامشخص'}`);
        }

        // بررسی Content-Type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('فایل اکسل به عنوان HTML برگردانده شد. احتمالاً فایل در مسیر صحیح نیست.');
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // بررسی اینکه آیا داده‌ها معتبر هستند
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('فایل اکسل خالی است یا به درستی دانلود نشده است');
        }

        let workbook;
        try {
          workbook = XLSX.read(arrayBuffer, { 
            type: 'array', 
            cellDates: false,
            cellNF: false,
            cellText: false
          });
        } catch (err) {
          throw new Error(`خطا در خواندن فایل اکسل: ${err instanceof Error ? err.message : 'خطای نامشخص'}`);
        }

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('فایل اکسل فاقد sheet است');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        if (!sheet) {
          throw new Error(`Sheet با نام "${sheetName}" پیدا نشد`);
        }

        const rows = XLSX.utils.sheet_to_json(sheet, { 
          defval: null,
          raw: false
        });

        if (!rows || rows.length === 0) {
          throw new Error('فایل اکسل فاقد داده است');
        }

        const categories = buildData(rows);
        
        if (!categories || categories.length === 0) {
          throw new Error('هیچ داده معتبری در فایل اکسل یافت نشد');
        }

        setData(categories);
      } catch (err) {
        console.error('Error loading Excel data:', err);
        const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری فایل اکسل';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadExcelData();
  }, []);

  return { data, loading, error };
}

