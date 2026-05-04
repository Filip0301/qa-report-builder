'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { FolderOpen, Trash2, Clock, FileText, X, Search, CheckCircle, FileEdit } from 'lucide-react';

interface ReportMeta {
  id: string;
  title: string;
  client: string;
  created_at: string;
  report_status?: 'draft' | 'final';
}

type StatusFilter = 'all' | 'draft' | 'final';

interface Props {
  onLoad: (id: string, data: any) => void;
  onClose: () => void;
}

export default function ReportsManager({ onLoad, onClose }: Props) {
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Error cargando reportes');
      const data = await res.json();
      setReports(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (id: string) => {
    try {
      toast.loading('Cargando reporte...', { id: 'load' });
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) throw new Error('No se pudo cargar el reporte');
      const json = await res.json();
      onLoad(id, json.data);
      toast.success('Reporte cargado', { id: 'load' });
    } catch (error: any) {
      toast.error(error.message, { id: 'load' });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que quieres borrar este reporte?')) return;

    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al borrar');
      toast.success('Reporte eliminado');
      fetchReports();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Client-side filtering
  const filteredReports = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reports.filter(r => {
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.client.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'draft' && (!r.report_status || r.report_status === 'draft')) ||
        (statusFilter === 'final' && r.report_status === 'final');
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'final', label: 'Finalizado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            Mis Reportes
            {!loading && (
              <span className="text-xs font-medium bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                {reports.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 pt-4 pb-3 space-y-3 border-b border-slate-800">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o cliente..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  statusFilter === btn.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {btn.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === btn.value ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {btn.value === 'all'
                    ? reports.length
                    : reports.filter(r =>
                        btn.value === 'draft'
                          ? (!r.report_status || r.report_status === 'draft')
                          : r.report_status === 'final'
                      ).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p>Cargando reportes de la nube...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium">
                {search || statusFilter !== 'all' ? 'No hay reportes que coincidan.' : 'Aún no hay reportes guardados.'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {search || statusFilter !== 'all'
                  ? 'Intenta con otro término o filtro.'
                  : 'El sistema guardará automáticamente tu reporte cuando empieces a escribir.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredReports.map((report) => {
                const isFinal = report.report_status === 'final';
                return (
                  <div
                    key={report.id}
                    onClick={() => handleOpen(report.id)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white truncate">
                          {report.title}
                        </h3>
                        {/* Status badge */}
                        <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isFinal
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                          {isFinal
                            ? <><CheckCircle className="w-2.5 h-2.5" /> Finalizado</>
                            : <><FileEdit className="w-2.5 h-2.5" /> Borrador</>
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                          {report.client}
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Eliminar reporte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
