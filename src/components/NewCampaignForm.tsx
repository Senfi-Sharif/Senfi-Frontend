import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import moment from 'moment';
import { useAuthApi } from '../api/auth';
import { FaTimes, FaRegEdit, FaLock, FaGlobe, FaRegClock, FaExclamationTriangle, FaPaperPlane, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import colors from 'react-multi-date-picker/plugins/colors';
import { sanitizeInput, SecureTokenManager } from '../utils/security';

// برای جلوگیری از خطای تایپ‌اسکریپت
declare global {
  interface Window {
    __lastSuccessNotifTime?: number;
  }
}

function NewCampaignForm() {
  const [shouldRender, setShouldRender] = useState(false); // برای حضور در DOM
  const [visible, setVisible] = useState(false); // برای انیمیشن باز/بسته
  const [closing, setClosing] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [endDate, setEndDate] = useState<any>(null);
  const [label, setLabel] = useState("مسائل دانشگاهی");
  const { showNotification } = useNotification();
  const authApi = useAuthApi();
  
  // تابع باز کردن فرم با انیمیشن
  const handleOpen = () => {
    setShouldRender(true);
    setTimeout(() => setVisible(true), 10); // فعال‌سازی انیمیشن باز شدن
    setClosing(false);
  };
  // تابع بستن فرم با انیمیشن
  const handleClose = () => {
    setVisible(false);
    setClosing(true);
    setTimeout(() => {
      setShouldRender(false);
      setClosing(false);
    }, 500); // مدت زمان transition
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      showNotification('لطفاً تیتر و متن را وارد کنید.', 'warning');
      return;
    }
    if (!endDate) {
      showNotification('لطفاً تاریخ و ساعت پایان را انتخاب کنید.', 'warning');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let email = SecureTokenManager.getEmail() || '';
      // اصلاح ساخت end_datetime با تایم‌زون صحیح
      const end_datetime = moment(endDate?.toDate()).format(); // خروجی: 2024-07-20T14:00:00+03:30
      const res = await authApi.submitCampaign({ 
          title: sanitizeInput(title, 200), 
          description: sanitizeInput(desc, 2000), 
          email: email || '',
          is_anonymous: isAnonymous ? "anonymous" : "public",
          end_datetime,
          label: sanitizeInput(label, 50)
        });
      if (res.success) {
        showNotification('کارزار با موفقیت ایجاد شد!', 'success', 10000);
        setTitle('');
        setDesc('');
        setIsAnonymous(false);
        setEndDate(null);
        handleClose(); // فرم را با انیمیشن ببند
      } else {
        showNotification(res.message || 'خطا در ثبت کارزار', 'error');
      }
    } catch (err) {
      // Extract the actual error message from the response
      let errorMessage = 'خطا در ارتباط با سرور';
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const FACULTY_CHOICES = [
    "فیزیک", "صنایع", "کامپیوتر", "برق", "عمران", "مواد", "مهندسی شیمی و نفت", "ریاضی", "هوافضا", "انرژی", "مدیریت و اقتصاد", "شیمی", "مکانیک"
  ];
  const DORMITORY_CHOICES = [
    "احمدی روشن", "طرشت ۲", "طرشت ۳"
  ];
  // نقش و اطلاعات کاربر از SecureTokenManager
  let userRole = SecureTokenManager.getRole() || '';
  let userFaculty = '';
  let userDormitory = '';
  // Note: faculty and dormitory are stored in localStorage for now
  if (typeof window !== 'undefined') {
    userFaculty = localStorage.getItem('faculty') || '';
    userDormitory = localStorage.getItem('dormitory') || '';
  }

  let labelChoices = ["مسائل دانشگاهی", ...FACULTY_CHOICES, ...DORMITORY_CHOICES];
  if (!['superadmin', 'head', 'center_member'].includes(userRole)) {
    labelChoices = ["مسائل دانشگاهی"];
    if (userFaculty && FACULTY_CHOICES.includes(userFaculty)) labelChoices.push(userFaculty);
    if (userDormitory && DORMITORY_CHOICES.includes(userDormitory)) labelChoices.push(userDormitory);
  }

  return (
    <>
      <div className="new-campaign-form-container">
      <button 
        onClick={() => (shouldRender ? handleClose() : handleOpen())}
        className={`new-campaign-toggle-button ${isHovered ? 'new-campaign-toggle-button-hover' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          {shouldRender ? <><FaTimes /> بستن فرم</> : <><FaRegEdit /> ایجاد کارزار جدید</>}
      </button>
      </div>
      {shouldRender && (
        <div className={`new-campaign-form new-campaign-form-animated${closing ? ' closing' : ''}${visible ? '' : ' closed'}`}>
            <h3 className="new-campaign-form-title">
              ایجاد کارزار جدید
            </h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label >تیتر کارزار:</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="مثلاً: درخواست بهبود غذای سلف" 
                  disabled={loading}
                  required
                />
              </div>
              <div >
                <label>متن کارزار:</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  rows={5} 
                  placeholder="شرح کامل درخواست یا مشکل..." 
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="new-campaign-form-group">
                <FaLock /> نوع کارزار:
                <div className="new-campaign-radio-group">
                  <label className="new-campaign-radio-option">
                    <input 
                      type="radio" 
                      name="anonymous" 
                      checked={!isAnonymous} 
                      onChange={() => setIsAnonymous(false)}
                      disabled={loading}
                      className="new-campaign-radio-input"
                    />
                    <span className="new-campaign-radio-label"><FaGlobe /> عمومی (امضاکنندگان نمایش داده می‌شوند)</span>
                  </label>
                  <label className="new-campaign-radio-option">
                    <input 
                      type="radio" 
                      name="anonymous" 
                      checked={isAnonymous} 
                      onChange={() => setIsAnonymous(true)}
                      disabled={loading}
                      className="new-campaign-radio-input"
                    />
                    <span className="new-campaign-radio-label"><FaLock /> ناشناس (فقط تعداد امضاها نمایش داده می‌شود)</span>
                  </label>
                </div>
              </div>
              
              <div className="new-campaign-form-group">
                <label ><FaRegClock /> تاریخ و ساعت پایان کارزار (اجباری):</label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD HH:mm"
                  calendarPosition="bottom-right"
                  editable={false}
                  disableDayPicker={false}
                  className="new-campaign-date-picker"
                  plugins={[
                    <TimePicker position="bottom" hideSeconds />
                  ]}
                  showOtherDays
                  disableMonthPicker={false}
                  disableYearPicker={false}
                  inputClass="custom-date-input"
                  placeholder="انتخاب تاریخ و ساعت..."
                  minDate={new Date()}
                  required
                  portal
                />
              </div>

              <div className="new-campaign-form-group">
                <label>برچسب کارزار (دانشکده/خوابگاه/مسائل دانشگاهی):</label>
                <select value={label} onChange={e => setLabel(e.target.value)} className="new-campaign-date-picker" required>
                  {labelChoices.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              
              {error && <div className="new-campaign-error-message"><FaExclamationTriangle /> {error}</div>}
              
              <button 
                type="submit" 
                className={`new-campaign-submit-button ${loading ? 'new-campaign-submit-button-loading' : ''}`}
                disabled={loading}
              >
                {loading ? <><FaSpinner className="fa-spin" /> در حال ارسال...</> : <><FaPaperPlane /> ارسال به نمایندگان صنف جهت بررسی</>}
              </button>
              
            </form>
        </div>
      )}
      {loading && (
        <div className="new-campaign-loading-overlay">
          <FaSpinner className="fa-spin new-campaign-loading-spinner" />
          <span>در حال ثبت کارزار...</span>
        </div>
      )}
    </>
  );
}

export default NewCampaignForm; 