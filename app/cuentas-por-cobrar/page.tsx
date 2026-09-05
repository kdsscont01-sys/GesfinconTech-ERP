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
        <h2 className="text-lg font-semibold mb-3">Clientes Registrados</h2>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">RIF</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {terceros.map((t, idx) => (
                <tr key={t.id || idx} className="border-b">
                  <td className="p-2">{t.rif}</td>
                  <td className="p-2">{t.razon_social}</td>
                  <td className="p-2">{t.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}