'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  FileText, 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

interface Tercero {
  id: string;
  numero_documento?: string;
  rif?: string;
  razon_social: string;
  direccion?: string;
  porcentaje_retencion_iva?: number;
}

interface FacturaCompra {
  id?: string;
  tercero_id?: string;
  tercero?: Tercero;
  numero_factura: string;
  numero_control: string;
  numero_nota_afectada?: string;
  numero_planilla_importacion?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  tasa_bcv: number;
  monto_exento: number;
  base_imponible: number;
  alicuota_iva: number;
  monto_iva: number;
  monto_total: number;
  porcentaje_retencion: number;
  monto_retencion: number;
  monto_neto_pagar: number;
  estatus_pago?: string;
}

export default function SubmoduloFacturasPage() {
  const [proveedores, setProveedores] = useState<Tercero[]>([]);
  const [facturas, setFacturas] = useState<FacturaCompra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    proveedor_id: '',
    numero_factura: '',
    numero_control: '',
    numero_nota_afectada: '',
    numero_planilla_importacion: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    tasa_bcv: 36.50,
    monto_exento: 0,
    base_imponible: 0,
    alicuota_iva: 16,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Cargar Proveedores
      const { data: provData, error: provErr } = await supabase
        .from('terceros')
        .select('*')
        .eq('tipo_tercero', 'proveedor');

      if (provErr) throw provErr;
      if (provData) setProveedores(provData as Tercero[]);

      // Cargar Facturas
      const { data: factData, error: factErr } = await supabase
        .from('compras')
        .select('*, tercero:terceros(*)');

      if (!factErr && factData) {
        setFacturas(factData as any[]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  // Cálculos dinámicos
  const selectedProveedor = proveedores.find((p) => p.id === form.proveedor_id);
  const pctRetencionIva = selectedProveedor?.porcentaje_retencion_iva ?? 75;

  const exentoNum = Number(form.monto_exento) || 0;
  const baseNum = Number(form.base_imponible) || 0;
  const alicuotaNum = Number(form.alicuota_iva) || 16;

  const montoIva = (baseNum * alicuotaNum) / 100;
  const montoTotal = exentoNum + baseNum + montoIva;
  const montoRetencion = (montoIva * pctRetencionIva) / 100;
  const montoNetoPagar = montoTotal - montoRetencion;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!form.proveedor_id) {
      setErrorMsg('Seleccione un proveedor registrado.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tercero_id: form.proveedor_id,
        numero_factura: form.numero_factura.trim(),
        numero_control: form.numero_control.trim(),
        numero_nota_afectada: form.numero_nota_afectada.trim() || null,
        numero_planilla_importacion: form.numero_planilla_importacion.trim() || null,
        fecha_emision: form.fecha_emision,
        fecha_vencimiento: form.fecha_vencimiento,
        tasa_bcv: Number(form.tasa_bcv),
        monto_exento: exentoNum,
        base_imponible: baseNum,
        alicuota_iva: alicuotaNum,
        monto_iva: montoIva,
        monto_total: montoTotal,
        porcentaje_retencion: pctRetencionIva,
        monto_retencion: montoRetencion,
        monto_neto_pagar: montoNetoPagar,
        estatus_pago: 'pendiente',
      };

      const { error } = await supabase.from('compras').insert([payload]);
      if (error) throw error;

      setSuccessMsg('Factura registrada con éxito según Providencia 0071.');
      setForm({
        proveedor_id: '',
        numero_factura: '',
        numero_control: '',
        numero_nota_afectada: '',
        numero_planilla_importacion: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        tasa_bcv: 36.50,
        monto_exento: 0,
        base_imponible: 0,
        alicuota_iva: 16,
      });

      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la factura de compra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/cuentas-por-pagar"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <ArrowLeft size={14} /> Volver a Proveedores
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={28} />
              Sub-módulo: Registro de Facturas de Compra (Prov. 0071)
            </h1>
            <p className="text-sm text-gray-500">
              Cumplimiento de requisitos tributarios SENIAT para Crédito Fiscal y CxP
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition border border-gray-200 bg-white"
            title="Recargar datos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <div className="text-sm">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0" />
            <div className="text-sm font-medium">{successMsg}</div>
          </div>
        )}

        {/* FORMULARIO FISCAL 0071 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b pb-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Cargar Documento de Compra / Gastos
            </h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
              SENIAT Providencia 0071
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECCIÓN 1: PROVEEDOR Y TASA BCV */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Proveedor *
                </label>
                <select
                  value={form.proveedor_id}
                  onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  required
                >
                  <option value="">-- Seleccionar Proveedor --</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.numero_documento || p.rif)?.toUpperCase()} - {p.razon_social} (% Ret. IVA: {p.porcentaje_retencion_iva ?? 75}%)
                    </option>
                  ))}
                </select>
                {selectedProveedor && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-semibold">Dir. Fiscal:</span> {selectedProveedor.direccion || 'Sin dirección fiscal'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tasa BCV del Día (Bs./USD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={form.tasa_bcv}
                    onChange={(e) => setForm({ ...form, tasa_bcv: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono font-semibold text-blue-900"
                    required
                  />
                  <DollarSign size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CAMPOS PROVIDENCIA 0071 */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Datos del Comprobante Fiscal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Factura *</label>
                  <input
                    placeholder="ej. 00012345"
                    value={form.numero_factura}
                    onChange={(e) => setForm({ ...form, numero_factura: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    N° Control * <span className="text-blue-600 text-[10px]">(Exigido SENIAT)</span>
                  </label>
                  <input
                    placeholder="ej. 00-001234"
                    value={form.numero_control}
                    onChange={(e) => setForm({ ...form, numero_control: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Nota Débito / Crédito Afectada</label>
                  <input
                    placeholder="Opcional"
                    value={form.numero_nota_afectada}
                    onChange={(e) => setForm({ ...form, numero_nota_afectada: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Planilla Importación (C-80/C-81)</label>
                  <input
                    placeholder="Opcional"
                    value={form.numero_planilla_importacion}
                    onChange={(e) => setForm({ ...form, numero_planilla_importacion: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Emisión *</label>
                  <input
                    type="date"
                    value={form.fecha_emision}
                    onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Vencimiento (CxP) *</label>
                  <input
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-medium text-red-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: MONTOS Y TRIBUTOS */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Montos de la Operación (Bs.)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto Exento / No Sujeto (Bs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.monto_exento}
                    onChange={(e) => setForm({ ...form, monto_exento: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Base Imponible General (Bs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.base_imponible}
                    onChange={(e) => setForm({ ...form, base_imponible: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alícuota IVA (%)</label>
                  <select
                    value={form.alicuota_iva}
                    onChange={(e) => setForm({ ...form, alicuota_iva: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={16}>16% (Alícuota General)</option>
                    <option value={8}>8% (Alícuota Reducida)</option>
                    <option value={31}>31% (Alícuota Suntuaria / Adicional)</option>
                    <option value={0}>0% (Sin IVA)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RESUMEN FINANCIERO / RETENCIÓN */}
            <div className="bg-slate-900 text-white p-5 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <span className="block text-[11px] text-slate-400 uppercase">Monto IVA ({alicuotaNum}%)</span>
                <span className="text-base font-mono font-semibold text-blue-300">
                  Bs. {montoIva.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 uppercase">Monto Total Factura</span>
                <span className="text-base font-mono font-bold text-white">
                  Bs. {montoTotal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-amber-400 uppercase">Retención IVA ({pctRetencionIva}%)</span>
                <span className="text-base font-mono font-bold text-amber-300">
                  - Bs. {montoRetencion.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-emerald-400 uppercase">Neto a Pagar</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  Bs. {montoNetoPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-700 pt-2 md:pt-0">
                <span className="block text-[11px] text-slate-400 uppercase">Equivalente USD</span>
                <span className="text-base font-mono font-bold text-slate-200">
                  $ {(montoTotal / (form.tasa_bcv || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm transition shadow-sm disabled:opacity-50"
              >
                <PlusCircle size={18} />
                {saving ? 'Guardando...' : 'Registrar Factura en Libro de Compras'}
              </button>
            </div>
          </form>
        </section>

        {/* TABLA DE FACTURAS REGISTRADAS */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Facturas Registradas en CxP</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              Registros: {facturas.length}
            </span>
          </div>

          {facturas.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay facturas de compra registradas aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Emisión / Venc.</th>
                    <th className="p-3">Proveedor</th>
                    <th className="p-3">N° Factura</th>
                    <th className="p-3">N° Control</th>
                    <th className="p-3 text-right">Base Imponible</th>
                    <th className="p-3 text-right">IVA</th>
                    <th className="p-3 text-right">Monto Total</th>
                    <th className="p-3 text-right">Ret. IVA</th>
                    <th className="p-3 text-right">Neto Pagar</th>
                    <th className="p-3 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {facturas.map((f, idx) => (
                    <tr key={f.id || idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div>{f.fecha_emision}</div>
                        <div className="text-[10px] text-red-500">Venc: {f.fecha_vencimiento}</div>
                      </td>
                      <td className="p-3 font-sans font-medium text-gray-900">
                        {f.tercero?.razon_social || 'Proveedor'}
                      </td>
                      <td className="p-3 font-bold text-blue-900">{f.numero_factura}</td>
                      <td className="p-3 text-gray-600">{f.numero_control}</td>
                      <td className="p-3 text-right">Bs. {f.base_imponible?.toFixed(2)}</td>
                      <td className="p-3 text-right">Bs. {f.monto_iva?.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-gray-900">Bs. {f.monto_total?.toFixed(2)}</td>
                      <td className="p-3 text-right text-amber-600">Bs. {f.monto_retencion?.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">Bs. {f.monto_neto_pagar?.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-sans font-semibold bg-amber-100 text-amber-800">
                          {f.estatus_pago || 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}