import React, { useEffect, useMemo, useState } from 'react';
import { Plus, LayoutGrid, X, ChevronDown } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const parseApiError = async (response, fallback = 'Request failed.') => {
  const data = await response.json().catch(() => null);
  if (!data) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data) && data.length > 0) return String(data[0]);
  if (typeof data === 'object') {
    const firstEntry = Object.entries(data)[0];
    if (firstEntry) {
      const [, value] = firstEntry;
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string') return value;
    }
  }
  return fallback;
};

const BlockSectionsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    program: '',
    year_level: '',
    block_name: '',
  });

  const loadData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const [programRes, blockRes] = await Promise.all([
        fetch(`${API_BASE_URL}/programs/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/blocks/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const programData = await programRes.json().catch(() => []);
      const blockData = await blockRes.json().catch(() => []);

      if (!programRes.ok) {
        const msg = await parseApiError(programRes, 'Unable to load programs.');
        throw new Error(msg);
      }
      if (!blockRes.ok) {
        const msg = await parseApiError(blockRes, 'Unable to load block/sections.');
        throw new Error(msg);
      }

      setPrograms(Array.isArray(programData) ? programData : programData?.results || []);
      setBlocks(Array.isArray(blockData) ? blockData : blockData?.results || []);
    } catch (err) {
      setError(err.message || 'Unable to load block/sections.');
      setPrograms([]);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const programMap = useMemo(() => {
    const map = new Map();
    programs.forEach((program) => {
      map.set(program.id, {
        code: program.program_code,
        name: program.program_name,
      });
    });
    return map;
  }, [programs]);

  const displayBlocks = useMemo(() => {
    return blocks.map((block, index) => {
      const programInfo = programMap.get(block.program) || {};
      return {
        id: block.id || `${block.block_name}-${index}`,
        block_name: block.block_name || 'N/A',
        year_level: block.year_level || 'N/A',
        program_code: programInfo.code || 'N/A',
        program_name: programInfo.name || 'Unknown Program',
      };
    });
  }, [blocks, programMap]);

  const isFormComplete = Boolean(
    String(formData.program).trim() &&
    String(formData.year_level).trim() &&
    String(formData.block_name).trim()
  );

  const handleCreate = async () => {
    setCreateError('');
    if (!isFormComplete) {
      setCreateError('Please complete all required fields.');
      return;
    }

    const token = getToken();
    if (!token) {
      setCreateError('Session expired. Please login again.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        program: Number(formData.program),
        year_level: formData.year_level,
        block_name: formData.block_name.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/blocks/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await parseApiError(res, 'Unable to create block/section.');
        setCreateError(msg);
        return;
      }

      setIsCreateOpen(false);
      setFormData({
        program: '',
        year_level: '',
        block_name: '',
      });
      await loadData();
    } catch {
      setCreateError('Unable to reach the server.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="block-sections" />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#1f2937]">Block/Sections</h1>
              <p className="text-slate-500 mt-1">Manage block and section assignments per program</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateError('');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#020824] text-white rounded-lg text-sm font-semibold hover:bg-[#0b1238]"
            >
              <Plus size={15} />
              Create Block/Section
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-500">Loading block/sections...</div>
          ) : error ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-rose-600">{error}</div>
          ) : displayBlocks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-500">No block/sections found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayBlocks.map((block) => (
                <article key={block.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
                    <LayoutGrid size={14} className="text-slate-400" />
                    {block.program_code}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{block.block_name}</h2>
                  <p className="text-slate-600 mt-1">{block.program_name}</p>
                  <p className="text-slate-500 text-sm mt-3">Year Level: {block.year_level}</p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-slate-800">Create Block/Section</h3>
                <p className="text-sm text-slate-500 mt-1">Add a new block/section under a program.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Program</label>
                <div className="relative">
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none"
                  >
                    <option value="">Select program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_code} - {program.program_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year Level</label>
                <div className="relative">
                  <select
                    value={formData.year_level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year_level: e.target.value }))}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none"
                  >
                    <option value="">Select year level</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                    <option value="5th">5th</option>
                  </select>
                  <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Block/Section Name</label>
                <input
                  type="text"
                  value={formData.block_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, block_name: e.target.value }))}
                  placeholder="e.g., BSIT3-01"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              {createError && <p className="text-sm text-rose-600 font-medium">{createError}</p>}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creating || !isFormComplete}
                  onClick={handleCreate}
                  className="px-5 py-2.5 rounded-lg bg-[#020824] text-white font-semibold hover:bg-[#0b1238] disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Block/Section'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockSectionsPage;
