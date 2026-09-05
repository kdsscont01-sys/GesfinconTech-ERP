'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

export default function CuentasPorCobrarPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [tipoDoc, setTipoDoc] = useState('RIF');
  const [numDoc, setNumDoc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [telefono, setTelefono] = useState('');

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('terceros')
      .select('*')
      .eq('es_cliente', true)
      .order('created_at', { ascending: false });

    if (!error && data) setClientes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numDoc || !razonSocial) return;

    const { error } = await supabase.from('terceros').insert([
      {
        tipo_documento: tipoDoc,
        numero_documento: numDoc,
        razon_social: razonSocial,
        telefono: telefono,
        es_cliente: true,
      },
    ]);

    if (!error) {
      setNumDoc('');
      setRazonSocial('');
      setTelefono('');
      fetchClientes();
    } else {
      alert('Error al guardar el cliente: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar</h1>
        <p className="text-sm text-slate-500">Gestión de clientes y facturación de ventas</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
          <UserPlus className="w-5 h-5 text-blue-600" /> Registrar Nuevo Cliente
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="RIF">RIF</option>
              <option value="V">V (Cédula)</option>
              <option value="E">E (Extranjero)</option>
              <option value="J">J (Jurídico)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Documento / RIF</label>
            <input
              type="text"
              placeholder="Ej: J-12345678-0"
              value={numDoc}
              onChange={(e) => setNumDoc(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Razón Social / Nombre</label>
            <input
              type="text"
              placeholder="Nombre de la empresa o persona"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
            <input
              type="text"
              placeholder="0412-0000000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Directorio de Clientes</h3>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Cargando datos...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="p-3">Documento</th>
                <th className="p-3">Razón Social</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400">
                    No hay clientes registrados aún.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">
                      {c.tipo_documento}-{c.numero_documento}
                    </td>
                    <td className="p-3 text-slate-600">{c.razon_social}</td>
                    <td className="p-3 text-slate-600">{c.telefono || '-'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}