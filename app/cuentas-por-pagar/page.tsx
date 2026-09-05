'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Truck, AlertCircle, RefreshCw, Pencil, Trash2, X, Check } from 'lucide-react';

interface Tercero {
  id?: string;
  numero_documento?: string;
  rif?: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  tipo_tercero?: string;
  porcentaje_retencion_iva?: number;
  porcentaje_retencion_islr?: number;
}

export default function CuentasPorPagarPage() {
  const [proveedores, setProveedores] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    numero_documento: '',
    razon_social: '',
    telefono: '',
    email: '',
    porcentaje_retencion_iva: 75,
    porcentaje_retencion_islr: 2,
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  async function fetchProveedores() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('terceros')
        .select('*')
        .eq('tipo_tercero', 'proveedor');

      if (error) throw error;
      if (data) setProveedores(data as Tercero[]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(p: Tercero) {
    if (!p.id) return;
    setEditingId(p.id);
    setFormData({
      numero_documento: p.numero_documento || p.rif || '',
      razon_social: p.razon_social || '',
      telefono: p.telefono || '',
      email: p.email || '',
      porcentaje_retencion_iva: p.porcentaje_retencion_iva ?? 75,
      porcentaje_retencion_islr: p.porcentaje_retencion_islr ?? 2,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData({
      numero_documento: '',
      razon_social: '',
      telefono: '',
      email: '',
      porcentaje_retencion_iva: 75,
      porcentaje_retencion_islr: 2,
    });
  }

  async function handleDelete(id: string, razon_social: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el proveedor "${razon_social}"?`)) return;

    setErrorMsg(null);
    try {
      const { error } = await supabase.from('terceros').delete().eq('id', id);
      if (error) throw error;

      if (editingId === id) handleCancelEdit();
      fetchProveedores();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar el proveedor.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        numero_documento: formData.numero_documento.trim(),
        rif: formData.numero_documento.trim(),
        razon_social: formData.razon_social.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        tipo_tercero: 'proveedor',
        porcentaje_retencion_iva: Number(formData.porcentaje_retencion_iva),
        porcentaje_retencion_islr: Number(formData.porcentaje_retencion_islr),
      };

      if (editingId) {
        const { error } = await supabase
          .from('terceros')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('terceros')
          .insert([payload]);

        if (error) throw error;
      }

      handleCancelEdit();
      fetchProveedores();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el proveedor en Supabase.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b pb-4 border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="text-blue-600" size={28} />
              Cuentas por Pagar
            </h1>
            <p className="text-sm text-gray-500">Gestión de proveedores y registros de terceros</p>
          </div>
          <button
            onClick={fetchProveedores}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
            title="Recargar datos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Detalle del problema: </span>
              {errorMsg}
            </div>
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingId ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 border px-2 py-1 rounded"
              >
                <X size={14} /> Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">RIF / Cédula / Doc. Identidad *</label>
                <input
                  placeholder="ej. J300123456 o V12345678"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Razón Social / Nombre *</label>
                <input
                  placeholder="Nombre de la empresa proveedora o firma"
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                <input
                  placeholder="ej. 02129998877 / 04141234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ventas@proveedor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">% Retención de IVA a Aplicar</label>
                <select
                  value={formData.porcentaje_retencion_iva}
                  onChange={(e) => setFormData({ ...formData, porcentaje_retencion_iva: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={75}>75% (Retención Estándar - Agente Especial)</option>
                  <option value={100}>100% (Retención Total)</option>
                  <option value={0}>0% (Sin Retención IVA)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">% Retención ISLR Sugerido</label>
                <select
                  value={formData.porcentaje_retencion_islr}
                  onChange={(e) => setFormData({ ...formData, porcentaje_retencion_islr: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={2}>2% (Servicios PJ)</option>
                  <option value={3}>3% (Honorarios Profesionales PN)</option>
                  <option value={1}>1% (Venta de Bienes Muebles / Mercancía PJ)</option>
                  <option value={5}>5% (Comisiones / Arrendamiento PJ)</option>
                  <option value={0}>0% (Sin Retención ISLR)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50"
              >
                {editingId ? <Check size={16} /> : <UserPlus size={16} />}
                {saving ? 'Guardando...' : editingId ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Proveedores Registrados</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              Total: {proveedores.length}
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Cargando proveedores...</div>
          ) : proveedores.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No hay proveedores registrados.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="p-3 pl-4">RIF / Doc. Identidad</th>
                  <th className="p-3">Razón Social / Nombre</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-center">% Ret. IVA</th>
                  <th className="p-3 text-center">% Ret. ISLR</th>
                  <th className="p-3 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proveedores.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 pl-4 font-mono font-medium text-gray-700">
                      {p.numero_documento || p.rif}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{p.razon_social}</td>
                    <td className="p-3 text-gray-600">{p.telefono || '-'}</td>
                    <td className="p-3 text-gray-600">{p.email || '-'}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {p.porcentaje_retencion_iva ?? 75}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {p.porcentaje_retencion_islr ?? 2}%
                      </span>
                    </td>
                    <td className="p-3 text-right pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Editar proveedor"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => p.id && handleDelete(p.id, p.razon_social)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Eliminar proveedor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}