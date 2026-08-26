import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Smartphone,
  Monitor,
  Loader2,
  RefreshCw,
  Tag,
  Plus,
} from 'lucide-react';
import notificationService from '../../services/notificationService';

const CAMPAIGN_TYPES = [
  { id: 'NEW_PRODUCT', label: 'New Slipper Drop', badge: 'Fresh Arrival' },
  { id: 'FESTIVAL_DEAL', label: 'Festival Offer', badge: 'Festival Sale' },
  { id: 'COUPON', label: 'VIP Coupon Code', badge: 'Special Coupon' },
  { id: 'FLASH_SALE', label: 'Flash Sale Alert', badge: 'Flash Sale' },
  { id: 'SPECIAL_OFFER', label: 'Special Announcement', badge: 'Exclusive' },
];

const AdminEmailCenter = () => {
  const [activeSubTab, setActiveSubTab] = useState('campaigns'); // 'campaigns' | 'create' | 'logs' | 'subscribers'
  const [campaigns, setCampaigns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Campaign Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'NEW_PRODUCT',
    subject: '',
    headline: '',
    message: '',
    imageUrl: '',
    ctaText: 'Explore Slipper Collection',
    ctaUrl: '',
    targetAudience: 'ALL_SUBSCRIBERS',
  });

  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeSubTab === 'campaigns') {
        const res = await notificationService.getCampaigns();
        setCampaigns(res.data || []);
      } else if (activeSubTab === 'logs') {
        const res = await notificationService.getEmailLogs();
        setLogs(res.data || []);
      } else if (activeSubTab === 'subscribers') {
        const res = await notificationService.getSubscribers();
        setSubscribers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load email data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.message) {
      setFeedback({ type: 'error', text: 'Please fill in Title, Subject, and Message.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);
    try {
      await notificationService.createCampaign({ ...formData, sendNow: true });
      setFeedback({ type: 'success', text: 'Campaign queued and dispatched successfully!' });
      setFormData({
        title: '',
        type: 'NEW_PRODUCT',
        subject: '',
        headline: '',
        message: '',
        imageUrl: '',
        ctaText: 'Explore Slipper Collection',
        ctaUrl: '',
        targetAudience: 'ALL_SUBSCRIBERS',
      });
      setActiveSubTab('campaigns');
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to dispatch campaign.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setFeedback({ type: 'error', text: 'Please enter a valid test recipient email.' });
      return;
    }

    setIsSendingTest(true);
    setFeedback(null);
    try {
      await notificationService.sendTestEmail(testEmailAddress);
      setFeedback({ type: 'success', text: `Test email dispatched to ${testEmailAddress}` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to send test email.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-xl text-luxury-dark">
              Email Notification & Campaign Center
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage transactional order emails, promotional campaigns, and customer newsletter subscriptions.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'campaigns'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Campaigns
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('create')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'create'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-luxury-accent" /> New Campaign
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'subscribers'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscribers
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'logs'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TAB 1: CAMPAIGN LIST */}
      {activeSubTab === 'campaigns' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-luxury-dark">
              Dispatched Broadcast Campaigns
            </h3>
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-gray-400 hover:text-luxury-dark hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-luxury-dark" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No promotional email campaigns dispatched yet. Click "New Campaign" to create your first broadcast!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Campaign Title</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Subject Line</th>
                    <th className="pb-3">Recipients</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 font-bold text-gray-900">{c.title}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-luxury-warmWhite text-luxury-dark border border-luxury-accent/30 font-semibold text-[10px]">
                          {c.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-600 max-w-xs truncate">{c.subject}</td>
                      <td className="py-3.5">
                        <span className="font-semibold text-emerald-600">{c.successCount}</span> /{' '}
                        <span className="text-gray-500">{c.recipientCount}</span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.status === 'SENDING'
                              ? 'bg-blue-50 text-blue-700 animate-pulse'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE CAMPAIGN */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-luxury-dark">
              Compose Slipper Broadcast
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Internal Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Cloud Slides Drop 2026"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Campaign Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent"
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent"
                  >
                    <option value="ALL_SUBSCRIBERS">All Subscribed Customers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. ⚡ Fresh Slipper Drop: Pure Cloud Comfort Is Here!"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Headline / Banner Title
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Experience The AuraCloud Dual-Density Slide"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Message Content (Markdown & linebreaks supported)
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell customers what makes this footwear release or offer special..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Shop New Collection"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-3.5 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-luxury-accent" />
                      <span>Dispatch Broadcast Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-luxury-dark flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-luxury-accent" /> Live HTML Preview
                </h3>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg ${
                      previewDevice === 'desktop' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg ${
                      previewDevice === 'mobile' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mock Email Frame */}
              <div
                className={`mx-auto bg-stone-50 border border-gray-200 rounded-2xl p-4 overflow-hidden transition-all text-left ${
                  previewDevice === 'mobile' ? 'max-w-[280px]' : 'w-full'
                }`}
              >
                <div className="bg-luxury-dark text-white p-3 rounded-t-xl text-center">
                  <span className="font-display font-black text-sm text-luxury-accent">AuraSole</span>
                </div>
                <div className="bg-white p-4 space-y-3 rounded-b-xl border-x border-b border-gray-200">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9px] font-bold uppercase">
                    {formData.type.replace(/_/g, ' ')}
                  </span>
                  <h4 className="font-bold text-xs text-gray-900">
                    {formData.headline || formData.subject || 'Subject Headline Here'}
                  </h4>
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-28 object-cover rounded-xl"
                    />
                  )}
                  <p className="text-[11px] text-gray-600 line-clamp-3">
                    {formData.message || 'Your personalized slipper announcement message will render here.'}
                  </p>
                  <button
                    type="button"
                    className="w-full py-2 bg-luxury-dark text-white font-bold text-[10px] uppercase rounded-xl"
                  >
                    {formData.ctaText || 'Shop Now'}
                  </button>
                </div>
              </div>

              {/* Test Email Dispatcher */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <label className="block text-[11px] font-bold uppercase text-gray-500">
                  Send Test Broadcast
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="admin@example.com"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSendingTest}
                    onClick={handleSendTestEmail}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
                  >
                    {isSendingTest ? 'Sending...' : 'Test'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIBERS */}
      {activeSubTab === 'subscribers' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-luxury-dark">
              Active VIP Newsletter Subscribers ({subscribers.length})
            </h3>
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-gray-400 hover:text-luxury-dark hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Promos</th>
                  <th className="pb-3">New Drops</th>
                  <th className="pb-3">Deals</th>
                  <th className="pb-3">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">{s.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.subscribed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-3">{s.promoEmails ? '✓' : '—'}</td>
                    <td className="py-3">{s.newProducts ? '✓' : '—'}</td>
                    <td className="py-3">{s.festivalDeals ? '✓' : '—'}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(s.subscribedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-luxury-dark">
              Email Dispatch Audit Logs
            </h3>
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-gray-400 hover:text-luxury-dark hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Subject Line</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-900">{l.recipient}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                        {l.emailType}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 max-w-xs truncate">{l.subject}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          l.status === 'SENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(l.sentAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailCenter;
