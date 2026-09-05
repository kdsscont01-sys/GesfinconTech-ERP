'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Building2, AlertCircle, RefreshCw } from 'lucide-react';

interface Tercero {
  id?: string;
  numero_documento?: string;
  rif?: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  tipo_tercero?: string;
  porcentaje_retencion_iva?: number;
}

export default function CuentasPorCobrarPage() {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    numero_documento: '',
    razon_social: '',
    telefono: '',
    email: '',
    porcentaje_retencion_iva: 0,
  });

  useEffect(() => {
    fetchTerceros();
  }, []);

  async function fetchTerceros() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.from('terceros').select('*');
      if (error) throw error;
      if (data) setTerceros(data as Tercero[]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los clientes.');
    } finally {
      setLoading(false);
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
        tipo_tercero: 'cliente',
        porcentaje_retencion_iva: Number(formData.porcentaje_retencion_iva),
      };

      const { error } = await supabase
        .from('terceros')
        .insert([payload]);

      if (error) throw error;

      setFormData({
        numero_documento: '',
        razon_social: '',
        telefono: '',
        email: '',
        porcentaje_retencion_iva: 0,
      });
      fetchTerceros();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el cliente en Supabase.');
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
              <Building2 className="text-blue-600" size={28} />
              Cuentas por Cobrar
            </h1>
            <p className="text-sm text-gray-500">Gestión de clientes y registros de terceros</p>
          </div>
          <button
            onClick={fetchTerceros}
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
          <h2 className="text-lg font-semibold text-gray-800">Registrar Nuevo Cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">RIF / Cédula / Doc. Identidad *</label>
                <input
                  placeholder="ej. V295114149, J123456780 o 29511414"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Razón Social / Nombre *</label>
                <input
                  placeholder="Nombre de la empresa o cliente"
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                <input
                  placeholder="ej. 04121234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">% Retención de IVA Aplicable</label>
                <select
                  value={formData.porcentaje_retencion_iva}
                  onChange={(e) => setFormData({ ...formData, porcentaje_retencion_iva: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={0}>0% (No es agente de retención / Ordinario)</option>
                  <option value={75}>75% (Retención Estándar - Agente Especial)</option>
                  <option value={100}>100% (Retención Total)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50"
            >
              <UserPlus size={16} />
              {saving ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Clientes Registrados</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Cargando clientes...</div>
          ) : terceros.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No hay clientes registrados en la base de datos.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="p-3 pl-4">Doc. Identidad / RIF</th>
                  <th className="p-3">Razón Social / Nombre</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-center">% Ret. IVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terceros.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 pl-4 font-mono font-medium text-gray-700">
                      {t.numero_documento || t.rif}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{t.razon_social}</td>
                    <td className="p-3 text-gray-600">{t.telefono || '-'}</td>
                    <td className="p-3 text-gray-600">{t.email || '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        t.porcentaje_retencion_iva && t.porcentaje_retencion_iva > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.porcentaje_retencion_iva ?? 0}%
                      </span>
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