import React, { useState } from 'react';
import Layout from '@theme/Layout';
import PDFPreview from '../components/PDFPreview';
import { magazines } from '../data/magazines';
import SenfiAccordion from '../components/SenfiAccordion';
import StatsPanel from '../components/StatsPanel';
import { container as sharedContainer } from '../theme/sharedStyles';
import { FaUsers, FaRegEdit, FaRegFileAlt, FaCheckCircle, FaTimes, FaUser, FaBan } from 'react-icons/fa';



function PublicationsContent() {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState<string[]>([]);


  const toggleManager = (idx: number) => setManagerOpen(opened =>
    opened.includes(idx) ? opened.filter(i => i !== idx) : [...opened, idx]
  );

  const toggleEditor = (midx: number, eidx: number) => {
    const key = `${midx}-${eidx}`;
    setEditorOpen(opened =>
      opened.includes(key)
        ? opened.filter(i => i !== key)
        : [...opened, key]
    );
  };

  const totalManagers = magazines.length;
  const totalEditors = magazines.reduce((acc, mag) => acc + mag.editors.length, 0);
  const totalIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => sum + ed.issues.length, 0), 0);
  const availableIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => 
      sum + ed.issues.filter(issue => issue.fileId).length, 0), 0);

  return (
    <div style={sharedContainer}>
      <StatsPanel
        stats={[
          { icon: <FaUsers />, label: 'مدیرمسئول', value: totalManagers },
          { icon: <FaRegEdit />, label: 'سردبیر', value: totalEditors },
          { icon: <FaRegFileAlt />, label: 'کل شماره‌ها', value: totalIssues },
          { icon: <FaCheckCircle />, label: 'موجود', value: availableIssues },
        ]}
      />
      {/* حذف هدر گرافیکی و استایل‌های اضافی */}
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
      <div>
        {magazines.map((mag, i) => (
          <SenfiAccordion
            key={i}
            title={<><FaUser /> مدیرمسئول: {mag.manager}</>}
            icon={null}
            defaultOpen={managerOpen.includes(i)}
            styleOverrides={{}}
          >
            {mag.editors.map((ed, j) => (
              <SenfiAccordion
                key={j}
                title={ed.title ? ed.title : "(بدون عنوان سردبیر)"}
                icon={null}
                defaultOpen={editorOpen.includes(`${i}-${j}`)}
                styleOverrides={{}}
              >
                <ul className="publications-issues-list">
                  {ed.issues.map((issue, k) => (
                    <li key={k} className="publications-issue-item">
                      {issue.fileId ? (
                        <button 
                          className="publications-issue-button"
                          onClick={() => setCurrentPdf(issue.fileId)}
                        >
                          <span className="publications-issue-icon"><FaRegFileAlt /></span>
                          {issue.title}
                        </button>
                      ) : (
                        <div className="publications-issue-missing">
                          <span className="publications-issue-icon"><FaBan /></span>
                          {issue.title}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </SenfiAccordion>
            ))}
          </SenfiAccordion>
        ))}
      </div>
    </div>
  );
}

function PublicationsContentWrapper() {
  return (
    <div className="senfi-page-container">
        <PublicationsContent />
    </div>
  );
}

export default function Publications() {
  return (
    <Layout title="نشریه شورا" description="آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف">
      <PublicationsContentWrapper />
    </Layout>
  );
} 