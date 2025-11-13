import React, { useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import PDFPreview from '../components/PDFPreview';
import SenfiAccordion from '../components/SenfiAccordion';
import StatsPanel from '../components/StatsPanel';
import { container as sharedContainer } from '../theme/sharedStyles';
import {
  FaRegFileAlt,
  FaCheckCircle,
  FaTimes,
  FaBan,
  FaFolderOpen,
  FaLayerGroup,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { universityPublications } from '../data/universityPublications';
import type {
  UniversityPublication,
  UniversityPublicationIssue,
  UniversityPublicationCategory,
} from '../data/universityPublications';
import moment from 'moment-jalaali';

export default function UniversityPublicationsPage() {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilters, setRoleFilters] = useState({ owner: true, manager: true, editor: true });
  const [startDate, setStartDate] = useState<DateObject | null>(null);
  const [endDate, setEndDate] = useState<DateObject | null>(null);

  type SubcategoryNode = {
    name: string;
    publications: UniversityPublication[];
    children: Map<string, SubcategoryNode>;
  };

  moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

  const toPersianDigits = (value: string | number) => {
    const persianMap = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return value
      .toString()
      .replace(/[0-9]/g, (digit) => persianMap[parseInt(digit, 10)]);
  };

  const formatIssueDate = (rawDate: string) => {
    const value = rawDate.trim();
    if (!value) {
      return '';
    }

    const parts = value.split('/');
    if (parts.length !== 3) {
      return value;
    }

    const [dayRaw, monthRaw, yearRaw] = parts;

    const toNumber = (input: string) => {
      if (!input) return null;
      const sanitized = input.replace(/[^0-9]/g, '');
      if (!sanitized) return null;
      return parseInt(sanitized, 10);
    };

    const year = toNumber(yearRaw);
    const month = toNumber(monthRaw);
    const day = toNumber(dayRaw);

    if (!year) {
      return value;
    }

    if (!month) {
      return `${year}`;
    }

    const parsed = moment(`${year}/${month}/${day ?? 1}`, 'jYYYY/jM/jD', true);
    if (!parsed.isValid()) {
      return `${year}`;
    }

    if (!day) {
      return parsed.format('jMMMM jYYYY');
    }

    return parsed.format('jD jMMMM jYYYY');
  };

  const parseIssueDateToMoment = (rawDate: string) => {
    const value = rawDate.trim();
    if (!value) return null;

    const parts = value.split('/');
    if (parts.length !== 3) return null;

    const toNumber = (input: string | undefined) => {
      if (!input) return null;
      const sanitized = input.replace(/[^0-9]/g, '');
      return sanitized ? parseInt(sanitized, 10) : null;
    };

    const [dayRaw, monthRaw, yearRaw] = parts;
    const year = toNumber(yearRaw);
    const month = toNumber(monthRaw) ?? 1;
    const day = toNumber(dayRaw) ?? 1;

    if (!year) return null;

    const parsed = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD', true);
    return parsed.isValid() ? parsed : null;
  };

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

  const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => englishDigitMap[digit] ?? digit);

  const normalizeText = (input: string) =>
    input
      .toLowerCase()
      .replace(/[۰-۹]/g, (digit) => englishDigitMap[digit] ?? digit);

  const renderIssueContent = (
    issue: UniversityPublicationIssue,
    publication: UniversityPublication
  ) => {
    const cleanedTitleParts = issue.title
      ? issue.title
          .split(' - ')
          .map((part) => part.trim())
          .filter((part) =>
            part && !/[0-9xX]{1,2}\/[0-9xX]{1,2}\/[0-9xX]{2,4}/.test(part)
          )
      : [];

    const rawPrimaryTitle = cleanedTitleParts.shift();
    const primaryTitle = issue.issueNumber
      ? `شماره ${toPersianDigits(issue.issueNumber)}`
      : rawPrimaryTitle || cleanedTitleParts.shift() || issue.title || 'شماره بدون عنوان';
    const displayTitle = toPersianDigits(primaryTitle);
    const subtitleRaw = cleanedTitleParts.length ? cleanedTitleParts.join(' • ') : undefined;
    const subtitle = subtitleRaw ? toPersianDigits(subtitleRaw) : undefined;

    const ownerName = toPersianDigits(issue.owner ?? publication.owners[0] ?? 'نامشخص');
    const managerName = toPersianDigits(issue.manager ?? publication.managers[0] ?? 'نامشخص');
    const editorName = toPersianDigits(issue.editor ?? publication.editors[0] ?? 'نامشخص');

    const formattedDate = issue.date ? formatIssueDate(issue.date) : '';
    const hasDateInfo = Boolean(formattedDate || issue.period || issue.season);
    const dateValue = formattedDate
      || (issue.period ? `دوره ${issue.period}` : '')
      || (issue.season ? `فصل ${issue.season}` : '');
    const localizedDateValue = dateValue ? toPersianDigits(dateValue) : '';

    return (
      <div className="publications-issue-content">
        <div className="publications-issue-heading">
          <div className="publications-issue-title">{displayTitle}</div>
          {subtitle && <div className="publications-issue-subtitle">{subtitle}</div>}
        </div>
        <div className="publications-issue-meta-grid">
          <div className="publication-role-card">
            <span className="publication-role-title">صاحب امتیاز</span>
            <span className="publication-role-value">{ownerName}</span>
          </div>
          <div className="publication-role-card">
            <span className="publication-role-title">مدیرمسئول</span>
            <span className="publication-role-value">{managerName}</span>
          </div>
          <div className="publication-role-card">
            <span className="publication-role-title">سردبیر</span>
            <span className="publication-role-value">{editorName}</span>
          </div>
          {hasDateInfo && (
            <div className="publication-role-card publication-role-card-accent">
              <span className="publication-role-title">تاریخ انتشار</span>
              <span className="publication-role-value">{localizedDateValue || 'نامشخص'}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderIssues = (publicationKey: string, publication: UniversityPublication) => (
    <ul className="publications-issues-list">
      {publication.issues.map((issue, index) => {
        const hasPreview = Boolean(issue.fileId);
        const hasLink = Boolean(issue.url);
        const key = `${publicationKey}-${index}`;
        const renderedContent = renderIssueContent(issue, publication);

        if (hasPreview) {
          return (
            <li key={key} className="publications-issue-item">
              <button
                className="publications-issue-button"
                onClick={() => setCurrentPdf(issue.fileId!)}
              >
                <span className="publications-issue-icon">
                  <FaRegFileAlt />
                </span>
                {renderedContent}
              </button>
            </li>
          );
        }

        if (hasLink) {
          return (
            <li key={key} className="publications-issue-item">
              <a
                className="publications-issue-button publications-issue-link"
                href={issue.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="publications-issue-icon">
                  <FaExternalLinkAlt />
                </span>
                {renderedContent}
              </a>
            </li>
          );
        }

        return (
          <li key={key} className="publications-issue-item">
            <div className="publications-issue-missing">
              <span className="publications-issue-icon">
                <FaBan />
              </span>
              {renderedContent}
            </div>
          </li>
        );
      })}
    </ul>
  );

  const renderPublication = (
    publication: UniversityPublication,
    key: string
  ) => {
    const publicationKey = publication.pathSegments.join('>');
    return (
      <SenfiAccordion key={key} title={publication.name}>
        {renderIssues(publicationKey, publication)}
      </SenfiAccordion>
    );
  };

  const buildSubcategoryTree = (publications: UniversityPublication[]) => {
    const rootPublications: UniversityPublication[] = [];
    const tree = new Map<string, SubcategoryNode>();

    publications.forEach((publication) => {
      if (!publication.subcategories.length) {
        rootPublications.push(publication);
        return;
      }

      let currentLevel = tree;
      publication.subcategories.forEach((subcat, index) => {
        let node = currentLevel.get(subcat);
        if (!node) {
          node = { name: subcat, publications: [], children: new Map() };
          currentLevel.set(subcat, node);
        }

        if (index === publication.subcategories.length - 1) {
          node.publications.push(publication);
        }

        currentLevel = node.children;
      });
    });

    return { tree, rootPublications };
  };

  const renderSubcategoryNodes = (
    nodes: Map<string, SubcategoryNode>,
    parentKey: string
  ): React.ReactNode[] => {
    return Array.from(nodes.values()).map((node) => {
      const key = `${parentKey}-${node.name}`;

      return (
        <SenfiAccordion key={key} title={node.name}>
          {node.publications.map((publication, pubIdx) =>
            renderPublication(publication, `${key}-publication-${pubIdx}`)
          )}
          {renderSubcategoryNodes(node.children, key)}
        </SenfiAccordion>
      );
    });
  };

  const normalizedCategories = useMemo<UniversityPublicationCategory[]>(() => {
    return universityPublications.map((category) => {
      const normalizedPublications = category.publications.map((publication) => {
        let subcategories = [...publication.subcategories];
        while (subcategories.length > 0 && subcategories[0] === category.name) {
          subcategories = subcategories.slice(1);
        }

        let pathSegments = [...publication.pathSegments];
        if (
          pathSegments.length >= 2 &&
          pathSegments[0] === category.name &&
          pathSegments[1] === category.name
        ) {
          pathSegments = [category.name, ...pathSegments.slice(2)];
        }

        return {
          ...publication,
          subcategories,
          pathSegments,
        };
      });

      return {
        ...category,
        publications: normalizedPublications,
      };
    });
  }, []);

  const filteredCategories = useMemo<UniversityPublicationCategory[]>(() => {
    const query = normalizeText(searchQuery.trim());
    const hasQuery = query.length > 0;
 
    const startMoment = startDate
      ? moment(toEnglishDigits(startDate.format('YYYY/MM/DD')), 'jYYYY/jMM/jDD', true)
      : null;
    const endMoment = endDate
      ? moment(toEnglishDigits(endDate.format('YYYY/MM/DD')), 'jYYYY/jMM/jDD', true)
      : null;
 
    const matchesFilters = (issue: UniversityPublicationIssue, publication: UniversityPublication) => {
      const issueMoment = issue.date ? parseIssueDateToMoment(issue.date) : null;
 
      if (startMoment && (!issueMoment || issueMoment.isBefore(startMoment, 'day'))) {
        return false;
      }
      if (endMoment && (!issueMoment || issueMoment.isAfter(endMoment, 'day'))) {
        return false;
      }

      if (!hasQuery) {
        return true;
      }

      const searchFields: string[] = [];
      searchFields.push(issue.title ?? '');
      if (roleFilters.owner) {
        searchFields.push(issue.owner ?? '');
        searchFields.push(...publication.owners);
      }
      if (roleFilters.manager) {
        searchFields.push(issue.manager ?? '');
        searchFields.push(...publication.managers);
      }
      if (roleFilters.editor) {
        searchFields.push(issue.editor ?? '');
        searchFields.push(...publication.editors);
      }

      return searchFields.some((field) => normalizeText(field || '').includes(query));
    };

    return normalizedCategories
      .map((category) => {
        const publications = category.publications
          .map((publication) => {
            const issues = publication.issues.filter((issue) => matchesFilters(issue, publication));
            return { ...publication, issues };
          })
          .filter((publication) => publication.issues.length > 0);

        return { ...category, publications };
      })
      .filter((category) => category.publications.length > 0);
  }, [normalizedCategories, searchQuery, roleFilters, startDate, endDate]);

  const councilCategory = useMemo(
    () => filteredCategories.find((category) => category.name === 'شورا'),
    [filteredCategories]
  );

  const otherCategories = useMemo(
    () => filteredCategories.filter((category) => category.name !== 'شورا'),
    [filteredCategories]
  );

  const stats = useMemo(() => {
    const totalCategories = filteredCategories.length;
    const totals = filteredCategories.reduce(
      (acc, category) => {
        acc.publications += category.publications.length;
        category.publications.forEach((publication) => {
          acc.issues += publication.issues.length;
          acc.availableIssues += publication.issues.filter(
            (issue) => Boolean(issue.fileId) || Boolean(issue.url)
          ).length;
        });
        return acc;
      },
      { publications: 0, issues: 0, availableIssues: 0 }
    );

    return {
      totalCategories,
      totalPublications: totals.publications,
      totalIssues: totals.issues,
      availableIssues: totals.availableIssues,
    };
  }, [filteredCategories]);

  return (
    <Layout
      title="آرشیو نشریات دانشگاه"
      description="آرشیو کامل نشریات دانشگاه صنعتی شریف"
    >
      <div className="senfi-page-container">
        <div style={sharedContainer}>
          <section className="publications-filter-section">
            <div className="publications-filter-row">
              <div className="publications-filter-group">
                <label htmlFor="publication-search">جست‌وجو</label>
                <input
                  id="publication-search"
                  type="text"
                  className="publications-filter-input"
                  placeholder="جست‌وجو بر اساس عنوان، صاحب امتیاز، مدیرمسئول یا سردبیر"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="publications-filter-group small">
                <label>نقش‌های جست‌وجو</label>
                <div className="publications-filter-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={roleFilters.owner}
                      onChange={(event) =>
                        setRoleFilters((prev) => ({ ...prev, owner: event.target.checked }))
                      }
                    />
                    صاحب امتیاز
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={roleFilters.manager}
                      onChange={(event) =>
                        setRoleFilters((prev) => ({ ...prev, manager: event.target.checked }))
                      }
                    />
                    مدیرمسئول
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={roleFilters.editor}
                      onChange={(event) =>
                        setRoleFilters((prev) => ({ ...prev, editor: event.target.checked }))
                      }
                    />
                    سردبیر
                  </label>
                </div>
              </div>
            </div>
            <div className="publications-filter-row">
              <div className="publications-filter-group">
                <label>از تاریخ (شمسی)</label>
                <DatePicker
                  value={startDate}
                  onChange={(value) =>
                    setStartDate(Array.isArray(value) ? (value[0] as DateObject | null) : (value as DateObject | null))
                  }
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="publications-filter-input"
                  portal
                  placeholder="انتخاب تاریخ"
                />
              </div>
              <div className="publications-filter-group">
                <label>تا تاریخ (شمسی)</label>
                <DatePicker
                  value={endDate}
                  onChange={(value) =>
                    setEndDate(Array.isArray(value) ? (value[0] as DateObject | null) : (value as DateObject | null))
                  }
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="publications-filter-input"
                  portal
                  placeholder="انتخاب تاریخ"
                />
              </div>
              <div className="publications-filter-group reset">
                <button
                  type="button"
                  className="publications-filter-reset"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilters({ owner: true, manager: true, editor: true });
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </section>

          <StatsPanel
            stats={[
              { icon: <FaLayerGroup />, label: 'دسته‌بندی', value: stats.totalCategories },
              { icon: <FaFolderOpen />, label: 'نشریه', value: stats.totalPublications },
              { icon: <FaRegFileAlt />, label: 'کل شماره‌ها', value: stats.totalIssues },
              { icon: <FaCheckCircle />, label: 'قابل مشاهده', value: stats.availableIssues },
            ]}
          />

          {filteredCategories.length === 0 && (
            <div className="publications-empty-state">
              نتیجه‌ای با فیلترهای فعلی یافت نشد.
            </div>
          )}

          {currentPdf && (
            <div className="publications-pdf-container">
              <PDFPreview fileId={currentPdf} />
              <div className="publications-pdf-close-container">
                <button
                  className="publications-pdf-close-button"
                  onClick={() => setCurrentPdf(null)}
                >
                  <FaTimes /> بستن
                </button>
              </div>
            </div>
          )}

          {councilCategory && (
            <section className="university-council-section">
              <div className="university-section-header">
                <FaLayerGroup />
                <h2>نشریه شورا</h2>
              </div>
              <div className="university-council-publications">
                {councilCategory.publications.map((publication, index) =>
                  renderPublication(
                    publication,
                    `council-publication-${index}`
                  )
                )}
              </div>
            </section>
          )}

          <div>
            {otherCategories.map((category) => {
              const { tree, rootPublications } = buildSubcategoryTree(category.publications);

              return (
                <SenfiAccordion
                  key={category.name}
                  title={
                    <>
                      <FaLayerGroup /> {category.name}
                    </>
                  }
                >
                  {category.publications.length === 0 ? (
                    <div className="university-publications-empty">
                      هیچ نشریه‌ای برای این دسته ثبت نشده است.
                    </div>
                  ) : (
                    <>
                      {rootPublications.map((publication, publicationIndex) =>
                        renderPublication(
                          publication,
                          `${category.name}-publication-${publicationIndex}`
                        )
                      )}
                      {renderSubcategoryNodes(
                        tree,
                        `${category.name}-subcategory`
                      )}
                    </>
                  )}
                </SenfiAccordion>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

