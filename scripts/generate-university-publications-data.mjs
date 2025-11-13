import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const excelPath = path.join(projectRoot, 'static', '📁 Public Folder Listing.xlsx');
const tsOutputPath = path.join(projectRoot, 'src', 'data', 'universityPublications.ts');
const jsonOutputDir = path.join(projectRoot, 'static', 'data');
const jsonOutputPath = path.join(jsonOutputDir, 'universityPublications.json');

function cleanValue(value) {
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

function extractFileId(url) {
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

function buildData(rows) {
  const categories = new Map();

  rows.forEach((row) => {
    const folderPath = cleanValue(row['Folder Path']);
    const fileType = cleanValue(row['Type']);

    if (!folderPath || fileType !== 'application/pdf') {
      return;
    }

    const segments = folderPath
      .split('/')
      .map((seg) => seg.trim())
      .filter((seg) => seg && seg !== 'Root');

    const categoryName = segments.length ? segments[0] : 'سایر';
    const pathSegments = segments.length ? segments : ['سایر'];
    const categoryEntry =
      categories.get(categoryName) ||
      categories.set(categoryName, new Map()).get(categoryName);

    const publicationKey = pathSegments.join('::');
    if (!categoryEntry.has(publicationKey)) {
      categoryEntry.set(publicationKey, {
        name: pathSegments[pathSegments.length - 1],
        pathSegments: [...pathSegments],
        owners: [],
        managers: [],
        editors: [],
        issues: [],
      });
    }

    const publication = categoryEntry.get(publicationKey);
    const ownerValue = cleanValue(row['صاحب امتیاز']);
    const managerValue = cleanValue(row['مدیرمسئول']);
    const editorValue = cleanValue(row['سردبیر']);

    [
      ['owners', ownerValue],
      ['managers', managerValue],
      ['editors', editorValue],
    ].forEach(([key, value]) => {
      if (value && !publication[key].includes(value)) {
        publication[key].push(value);
      }
    });

    const url = cleanValue(row['URL']);
    const issueNumber = cleanValue(row['شماره']);
    const period = cleanValue(row['دوره']);
    const week = cleanValue(row['هفته']);
    const season = cleanValue(row['فصل']);
    const date = cleanValue(row['تاریخ']);
    const spanFrom = cleanValue(row['از']);
    const spanTo = cleanValue(row['تا']);
    const description = cleanValue(row['متن']);
    const fileName = cleanValue(row['File Name']);
    const titleParts = [];

    if (issueNumber) titleParts.push(`شماره ${issueNumber}`);
    if (period) titleParts.push(`دوره ${period}`);
    if (week) titleParts.push(`هفته ${week}`);
    if (season) titleParts.push(`فصل ${season}`);
    if (date) titleParts.push(date);

    publication.issues.push({
      title: titleParts.length ? titleParts.join(' - ') : fileName || 'شماره بدون عنوان',
      fileName,
      url,
      fileId: extractFileId(url),
      owner: ownerValue || undefined,
      manager: managerValue || undefined,
      editor: editorValue || undefined,
      issueNumber,
      period,
      week,
      season,
      date,
      from: spanFrom,
      to: spanTo,
      description,
    });
  });

  const result = Array.from(categories.entries())
    .sort(([a], [b]) => {
      if (a === 'سایر') return -1;
      if (b === 'سایر') return 1;
      return a.localeCompare(b, 'fa');
    })
    .map(([name, publicationsMap]) => ({
      name,
      publications: Array.from(publicationsMap.values()).map((publication) => ({
        ...publication,
        category: name,
        subcategories: publication.pathSegments.slice(1, -1),
      })),
    }));

  return result;
}

function main() {
  if (!fs.existsSync(excelPath)) {
    console.error(`Excel source not found at ${excelPath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const categories = buildData(rows);

  const interfaces = `export interface UniversityPublicationIssue {
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

`;

  const tsContent =
    interfaces +
    `export const universityPublications: UniversityPublicationCategory[] = ${JSON.stringify(
      categories,
      null,
      2
    )};\n`;

  fs.writeFileSync(tsOutputPath, tsContent, 'utf8');
  console.log(`Updated ${path.relative(projectRoot, tsOutputPath)}`);

  if (!fs.existsSync(jsonOutputDir)) {
    fs.mkdirSync(jsonOutputDir, { recursive: true });
  }
  fs.writeFileSync(jsonOutputPath, JSON.stringify(categories, null, 2), 'utf8');
  console.log(`Wrote ${path.relative(projectRoot, jsonOutputPath)}`);
}

main();

