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

function NewCampaignForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [endDate, setEndDate] = useState<any>(null);
  const { showNotification } = useNotification();
  const authApi = useAuthApi();
  
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
      let email = '';
      if (typeof window !== 'undefined') {
        email = localStorage.getItem('auth_email') || '';
      }
      // تبدیل تاریخ جلالی به میلادی (ISO)
      const end_datetime = moment(endDate?.toDate()).format('YYYY-MM-DDTHH:mm:ss');
      const res = await authApi.submitCampaign({ 
          title, 
          description: desc, 
          email: email || '',
          is_anonymous: isAnonymous ? "anonymous" : "public",
          end_datetime
        });
      if (res.success) {
        showNotification('کارزار با موفقیت ایجاد شد!', 'success');
        setTitle('');
        setDesc('');
        setIsAnonymous(false);
        setEndDate(null);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 3000);
      } else {
        showNotification(res.message || 'خطا در ثبت کارزار', 'error');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      showNotification('خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="new-campaign-form-container">
      <button 
        onClick={() => {
          setOpen(v => !v);
          if (open) {
            setTitle('');
            setDesc('');
            setIsAnonymous(false);
            setEndDate(null);
            setError('');
            setSuccess(false);
          }
        }}
        className={`new-campaign-toggle-button ${isHovered ? 'new-campaign-toggle-button-hover' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          {open ? <><FaTimes /> بستن فرم</> : <><FaRegEdit /> ایجاد کارزار جدید</>}
      </button>
      </div>
      {open && (
        <div className="new-campaign-form">
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
                />
              </div>
              
              {error && <div className="new-campaign-error-message"><FaExclamationTriangle /> {error}</div>}
              
              <button 
                type="submit" 
                className={`new-campaign-submit-button ${loading ? 'new-campaign-submit-button-loading' : ''}`}
                disabled={loading}
              >
                {loading ? <><FaSpinner className="fa-spin" /> در حال ارسال...</> : <><FaPaperPlane /> ارسال به نمایندگان صنف جهت بررسی</>}
              </button>
              
              {success && <div className="new-campaign-success-message"><FaCheckCircle /> کارزار با موفقیت ثبت شد و جهت بررسی ارسال شد.</div>}
            </form>
        </div>
      )}
    </>
  );
}

export default NewCampaignForm; 