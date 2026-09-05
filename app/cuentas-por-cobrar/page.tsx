'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

interface Tercero {
  id?: string;
  rif: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  tipo_tercero?: string;
}

export default function CuentasPorCobrarPage() {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    fetchTerceros();
  }, []);

  async function fetchTerceros() {
    const { data } = await supabase.from('terceros').select('*');
    if (data) setTerceros(data as Tercero[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from('terceros')
      .insert([{ ...formData, tipo_tercero: 'cliente' }]);

    if (!error) {
      setFormData({ rif: '', razon_social: '', telefono: '', email: '' });
      fetchTerceros();
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cuentas por Cobrar</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="RIF"
            value={formData.rif}
            onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Razón Social"
            value={formData.razon_social}
            onChange={(e) =>
              setFormData({ ...formData, razon_social: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <UserPlus size={18} /> Guardar Cliente
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Clientes 'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

interface Tercero {
  id?: string;
  rif: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  tipo_tercero?: string;
}

export default function CuentasPorCobrarPage() {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    fetchTerceros();
  }, []);

  async function fetchTerceros() {
    const { data } = await supabase.from('terceros').select('*');
    if (data) setTerceros(data as Tercero[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from('terceros')
      .insert([{ ...formData, tipo_tercero: 'cliente' }]);

    if (!error) {
      setFormData({ rif: '', razon_social: '', telefono: '', email: '' });
      fetchTerceros();
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Cuentas por Cobrar</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="RIF"
            value={formData.rif}
            onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
            className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg outline-none"
            required
          />
          <input
            placeholder="Razón Social"
            value={formData.razon_social}
            onChange={(e) =>
              setFormData({ ...formData, razon_social: e.target.value })
            }
            className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg outline-none"
            required
          />
          <input
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg outline-none"
          />
          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} /> Guardar Cliente
        </button>
      </form>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Clientes Registrados</h2>
        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="p-3 font-semibold">RIF</th>
                <th className="p-3 font-semibold">Nombre</th>
                <th className="p-3 font-semibold">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {terceros.map((t, idx) => (
                <tr key={t.id || idx} className="border-b border-slate-700/50 text-slate-200">
                  <td className="p-3">{t.rif}</td>
                  <td className="p-3">{t.razon_social}</td>
                  <td className="p-3">{t.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}