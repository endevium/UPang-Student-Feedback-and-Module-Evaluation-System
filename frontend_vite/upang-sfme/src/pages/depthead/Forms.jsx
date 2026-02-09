import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  FileEdit, 
  BarChart3, 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2,
  HelpCircle
} from 'lucide-react';

const EvaluationForms = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const [formsList, setFormsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Modal & Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formValues, setFormValues] = useState({
    title: '',
    form_type: 'Module',
    description: '',
    status: 'Draft',
  });

  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${API_BASE_URL}/evaluation-forms/`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setLoadError(data?.detail || 'Unable to load forms.');
          return;
        }
        const list = Array.isArray(data) ? data : [];
        setFormsList(list);
      } catch {
        setLoadError('Unable to reach the server. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormValues({
      title: '',
      form_type: 'Module',
      description: '',
      status: 'Draft',
    });
    setErrorMessage('');
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsPreviewOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedForm(null);
    resetForm();
  };

  const handleAddForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Validation
    const required = ['title', 'form_type'];
    const missing = required.find(key => !formValues[key].trim());
    if (missing) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/evaluation-forms/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data?.detail || 'Unable to create form. Please check details.');
        return;
      }

      setFormsList((prev) => [data, ...prev]);
      closeModal();
    } catch {
      setErrorMessage('Server connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Validation
    const required = ['title', 'form_type'];
    const missing = required.find(key => !formValues[key].trim());
    if (missing) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/evaluation-forms/${selectedForm.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data?.detail || 'Unable to update form. Please check details.');
        return;
      }

      setFormsList((prev) => prev.map(f => f.id === selectedForm.id ? data : f));
      closeModal();
    } catch {
      setErrorMessage('Server connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (form) => {
    setSelectedForm(form);
    setIsPreviewOpen(true);
  };

  const handleEdit = (form) => {
    setSelectedForm(form);
    setFormValues({
      title: form.title,
      form_type: form.form_type,
      description: form.description || '',
      status: form.status,
    });
    setIsEditOpen(true);
  };

  const handleDuplicate = (form) => {
    setFormValues({
      title: `${form.title} (Copy)`,
      form_type: form.form_type,
      description: form.description || '',
      status: 'Draft',
    });
    setIsAddOpen(true);
  };

  const handleDelete = (form) => {
    setSelectedForm(form);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/evaluation-forms/${selectedForm.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        setErrorMessage('Unable to delete form.');
        return;
      }

      setFormsList((prev) => prev.filter(f => f.id !== selectedForm.id));
      closeModal();
    } catch {
      setErrorMessage('Server connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalForms = formsList.length;
  const activeForms = formsList.filter((f) => f.status === 'Active').length;
  const draftForms = formsList.filter((f) => f.status === 'Draft').length;
  const totalUsage = formsList.reduce((sum, f) => sum + (f.usage_count || 0), 0);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="forms" />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#1f2937]">Evaluation Forms</h1>
              <p className="text-slate-500 mt-1">Create and manage evaluation forms for students</p>
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1f474d] text-white rounded-lg font-bold text-sm hover:bg-[#163539] transition-all shadow-md"
            >
              <Plus size={18} /> Create new Form
            </button>
          </div>

          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Forms", value: totalForms, icon: <FileText className="text-amber-500" />, sub: "All evaluation forms", bg: "bg-amber-50" },
              { label: "Active Forms", value: activeForms, icon: <CheckCircle className="text-emerald-500" />, sub: "Currently in use", bg: "bg-emerald-50" },
              { label: "Draft Forms", value: draftForms, icon: <FileEdit className="text-orange-500" />, sub: "Not yet published", bg: "bg-orange-50" },
              { label: "Total Usage", value: totalUsage, icon: <BarChart3 className="text-slate-700" />, sub: "Times used", bg: "bg-slate-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</h3>
                    <p className="text-3xl font-black mt-1 text-[#1f2937]">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 ${stat.bg} rounded-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Forms List Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">All Forms</h2>
                <p className="text-slate-400 text-sm">Manage your evaluation forms</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search forms..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {formsList.map((form, idx) => (
                <div key={idx} className="group p-5 border border-slate-100 rounded-xl hover:border-teal-100 hover:bg-teal-50/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-slate-800">{form.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${form.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {form.status}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-100 text-slate-600">
                        {form.form_type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{form.description}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-orange-400" /> {form.questions_count || 0} questions</span>
                      <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-blue-400" /> Used {form.usage_count || 0} times</span>
                      <span className="flex items-center gap-1.5"><FileEdit size={14} className="text-purple-400" /> Created {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePreview(form)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button 
                      onClick={() => handleEdit(form)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDuplicate(form)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(form)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {(isLoading || loadError || formsList.length === 0) && (
              <div className="p-6 text-sm text-slate-500">
                {isLoading && 'Loading forms...'}
                {!isLoading && loadError}
                {!isLoading && !loadError && formsList.length === 0 && 'No forms found.'}
              </div>
            )}
          </div>

          {/* Quick Tips Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="font-black text-blue-600 not-italic">Active forms</span> are available for students to use in evaluations
              </li>
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span className="font-black text-orange-600 not-italic">Draft forms</span> are not visible to students until published
              </li>
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Duplicate existing forms to create variations quickly
              </li>
            </ul>
          </div>
        </main>
      </div>

      {/* INTEGRATED MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">{isEditOpen ? 'Edit Evaluation Form' : 'Create Evaluation Form'}</h3>
                <p className="text-sm text-slate-400">{isEditOpen ? 'Update form details' : 'Add a new form for student evaluations'}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-700 text-2xl" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={isEditOpen ? handleEditForm : handleAddForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                  <input
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Standard Module Evaluation Form"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Form Type</label>
                  <select
                    name="form_type"
                    value={formValues.form_type}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="Module">Module</option>
                    <option value="Instructor">Instructor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    name="status"
                    value={formValues.status}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the form..."
                    rows={3}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="text-sm text-rose-600 font-semibold" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="px-4 py-2 text-sm font-bold text-slate-500" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-[#1f474d] text-white rounded-lg hover:bg-[#18393e] disabled:opacity-70"
                >
                  {isSubmitting ? (isEditOpen ? 'Updating...' : 'Creating...') : (isEditOpen ? 'Update Form' : 'Create Form')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {isPreviewOpen && selectedForm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Preview: {selectedForm.title}</h3>
                <p className="text-sm text-slate-400">Form details and configuration</p>
              </div>
              <button className="text-slate-400 hover:text-slate-700 text-2xl" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                  <p className="mt-2 text-sm text-slate-800">{selectedForm.title}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Form Type</label>
                  <p className="mt-2 text-sm text-slate-800">{selectedForm.form_type}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <span className={`mt-2 inline-block px-2 py-1 text-xs font-bold uppercase rounded ${selectedForm.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedForm.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Created</label>
                  <p className="mt-2 text-sm text-slate-800">{selectedForm.created_at ? new Date(selectedForm.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <p className="mt-2 text-sm text-slate-800">{selectedForm.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Questions</label>
                  <p className="mt-2 text-sm text-slate-800">{selectedForm.questions_count || 0} questions</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Usage</label>
                  <p className="mt-2 text-sm text-slate-800">Used {selectedForm.usage_count || 0} times</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => { closeModal(); handleEdit(selectedForm); }}
                  className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Edit Form
                </button>
                <button className="px-4 py-2 text-sm font-bold text-slate-500" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && selectedForm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">Delete Form</h3>
              <p className="text-sm text-slate-400 mt-1">This action cannot be undone</p>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <strong>"{selectedForm.title}"</strong>? This will permanently remove the form and cannot be undone.
              </p>

              {errorMessage && (
                <div className="text-sm text-rose-600 font-semibold mb-4" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-bold text-slate-500" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Form'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationForms;