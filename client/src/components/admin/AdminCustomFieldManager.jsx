import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Eye,
  Settings,
  Shield,
  HelpCircle,
  X,
  ListOrdered,
  FileText,
} from 'lucide-react';
import adminService from '../../services/adminService';

const FIELD_TYPES = [
  { id: 'TEXT', label: 'Single Line Text' },
  { id: 'TEL', label: 'Phone / Mobile (Tel)' },
  { id: 'NUMBER', label: 'Numeric (Digits only)' },
  { id: 'DATE', label: 'Date Picker (e.g. Birthday)' },
  { id: 'SELECT', label: 'Dropdown Options (Select)' },
  { id: 'TEXTAREA', label: 'Multi-line Paragraph (Textarea)' },
];

const AdminCustomFieldManager = () => {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldKey: '',
    fieldType: 'TEXT',
    placeholder: '',
    options: '',
    isRequired: false,
    isEnabled: true,
    isCustomerEditable: true,
  });

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.getCustomRegistrationFields();
      if (res?.data) {
        setFields(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load registration fields.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentFieldId(null);
    setFormData({
      fieldName: '',
      fieldKey: '',
      fieldType: 'TEXT',
      placeholder: '',
      options: '',
      isRequired: false,
      isEnabled: true,
      isCustomerEditable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field) => {
    setIsEditing(true);
    setCurrentFieldId(field.id);
    setFormData({
      fieldName: field.fieldName,
      fieldKey: field.fieldKey,
      fieldType: field.fieldType || 'TEXT',
      placeholder: field.placeholder || '',
      options: field.options || '',
      isRequired: Boolean(field.isRequired),
      isEnabled: Boolean(field.isEnabled),
      isCustomerEditable: Boolean(field.isCustomerEditable),
    });
    setIsModalOpen(true);
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!formData.fieldName.trim() || (!isEditing && !formData.fieldKey.trim())) {
      showNotification('Field Name and Field Key are required.', true);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await adminService.updateCustomRegistrationField(currentFieldId, formData);
        showNotification(`Custom field "${formData.fieldName}" updated successfully.`);
      } else {
        await adminService.createCustomRegistrationField(formData);
        showNotification(`Custom field "${formData.fieldName}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchFields();
    } catch (err) {
      showNotification(err.message || 'Failed to save field.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteField = async (id) => {
    try {
      await adminService.deleteCustomRegistrationField(id);
      showNotification('Custom registration field deleted.');
      setDeleteConfirmId(null);
      fetchFields();
    } catch (err) {
      showNotification(err.message || 'Failed to delete field.', true);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    setFields(newFields);

    try {
      const orderedIds = newFields.map((f) => f.id);
      await adminService.reorderCustomRegistrationFields(orderedIds);
      showNotification('Field order updated.');
    } catch (err) {
      showNotification(err.message || 'Failed to reorder fields.', true);
      fetchFields();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-6 rounded-3xl text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-luxury-accent/20 text-luxury-accent text-[10px] font-black uppercase tracking-wider border border-luxury-accent/30">
              Registration Architecture
            </span>
            <span className="text-xs text-stone-400">Total Fields: {fields.length}</span>
          </div>
          <h2 className="font-display font-black text-2xl text-white mt-1">
            Dynamic Registration & Profile Fields
          </h2>
          <p className="text-xs text-stone-400 max-w-xl mt-1">
            Configure custom fields collected during customer registration and displayed in profiles.
            Required fields are strictly enforced on both frontend and backend.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-luxury-accent hover:bg-luxury-accentHover text-stone-950 rounded-2xl text-xs font-black tracking-wide uppercase transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Field</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Fields List Table / Cards */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-luxury-accent" />
            <h3 className="font-display font-bold text-sm text-white">Active Form Fields</h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Standard compulsory fields: Full Name, Email, Password
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-luxury-accent mx-auto mb-2" />
            <p className="text-xs">Loading registration fields...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <FolderTree className="w-10 h-10 text-stone-700 mx-auto" />
            <p className="text-xs font-bold text-stone-400">No custom fields created yet.</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Add custom fields like WhatsApp Number, Alternate Mobile, Shoe Size Preference, or City to collect detailed customer data.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Create First Custom Field
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-800">
            {fields.map((f, index) => (
              <div
                key={f.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-850 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === fields.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Field Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-sm text-white">{f.fieldName}</h4>
                      <code className="px-2 py-0.5 rounded bg-stone-950 text-luxury-accent text-[10px] font-mono border border-stone-800">
                        {f.fieldKey}
                      </code>

                      {f.isRequired ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 text-[10px] font-black border border-rose-800">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-bold">
                          OPTIONAL
                        </span>
                      )}

                      {!f.isEnabled && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 text-[10px] font-bold border border-amber-800">
                          DISABLED
                        </span>
                      )}

                      {!f.isCustomerEditable && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-800">
                          READ ONLY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                      <span>Type: <strong className="text-stone-200">{f.fieldType}</strong></span>
                      {f.placeholder && <span>• Placeholder: "{f.placeholder}"</span>}
                      {f.options && <span>• Options: [{f.options}]</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditModal(f)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                    title="Edit Field"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(f.id)}
                    className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 transition-colors"
                    title="Delete Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
              <h3 className="font-display font-black text-xl text-white">
                {isEditing ? 'Edit Custom Field' : 'Create Custom Field'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Field Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fieldName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      fieldName: name,
                      ...(!isEditing && { fieldKey: name.toLowerCase().replace(/[^a-z0-9]/g, '_') }),
                    });
                  }}
                  placeholder="e.g. WhatsApp Number, City, Slipper Size"
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-luxury-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Field Identifier Key *
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.fieldKey}
                  onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  placeholder="e.g. whatsapp_number"
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:border-luxury-accent outline-none disabled:opacity-50"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Unique programmatic key stored in database JSON structure.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Input Control Type *
                  </label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:border-luxury-accent outline-none font-bold"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    placeholder="Enter placeholder..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>

              {formData.fieldType === 'SELECT' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Dropdown Options (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required={formData.fieldType === 'SELECT'}
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="e.g. UK 6, UK 7, UK 8, UK 9, UK 10"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-luxury-accent outline-none"
                  />
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="w-4 h-4 accent-luxury-accent rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Compulsory / Required Field</p>
                    <p className="text-[10px] text-stone-400">
                      Customers cannot create an account without filling this field.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCustomerEditable}
                    onChange={(e) => setFormData({ ...formData, isCustomerEditable: e.target.checked })}
                    className="w-4 h-4 accent-luxury-accent rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Customer Editable in Profile</p>
                    <p className="text-[10px] text-stone-400">
                      If unchecked, customers can view this field in their profile but cannot edit it.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="w-4 h-4 accent-luxury-accent rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Enabled / Active on Registration</p>
                    <p className="text-[10px] text-stone-400">
                      Turn off to hide from registration form without deleting existing customer data.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-luxury-accent hover:bg-luxury-accentHover text-stone-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isEditing ? 'Save Changes' : 'Create Field'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-white">Delete Custom Field?</h3>
            <p className="text-xs text-stone-400 mt-1 mb-5">
              This field will be removed from future registration forms. Existing customer records will not be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteField(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomFieldManager;
