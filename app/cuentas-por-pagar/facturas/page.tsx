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
  tipo_documento: string;
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
    tipo_documento: 'factura',
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
      const { data: provData, error: provErr } = await supabase
        .from('terceros')
        .select('*')
        .eq('tipo_tercero', 'proveedor');

      if (provErr) throw new Error(`Error Proveedores: ${provErr.message}`);
      
      const provs = (provData as Tercero[]) || [];
      setProveedores(provs);

      const { data: factData, error: factErr } = await supabase
        .from('compras')
        .select('*')
        .order('created_at', { ascending: false });

      if (factErr) {
        throw new Error(`Error al leer tabla 'compras': ${factErr.message}`);
      }

      if (factData) {
        const facturasConProveedor = factData.map((f: any) => {
          const provEncontrado = provs.find((p) => p.id === f.tercero_id);
          return {
            ...f,
            tercero: provEncontrado || { razon_social: 'Proveedor no identificado' },
          };
        });
        setFacturas(facturasConProveedor);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  const selectedProveedor = proveedores.find((p) => p.id === form.proveedor_id);
  const pctRetencionIva = selectedProveedor?.porcentaje_retencion_iva ?? 75;

  const exentoNum = Number(form.monto_exento) || 0;
  const baseNum = Number(form.base_imponible) || 0;
  const alicuotaNum = Number(form.alicuota_iva) || 16;
  const tasaBcvNum = Number(form.tasa_bcv) > 0 ? Number(form.tasa_bcv) : 1;

  const montoIvaBs = (baseNum * alicuotaNum) / 100;
  const montoTotalBs = exentoNum + baseNum + montoIvaBs;
  const montoRetencionBs = (montoIvaBs * pctRetencionIva) / 100;
  const montoNetoPagarBs = montoTotalBs - montoRetencionBs;

  const fmtBs = (val: number) => `Bs. ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUSD = (valBs: number) => `$ ${(valBs / tasaBcvNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        tipo_documento: form.tipo_documento,
        tercero_id: form.proveedor_id,
        numero_factura: form.numero_factura.trim(),
        numero_control: form.numero_control.trim(),
        numero_nota_afectada: form.numero_nota_afectada.trim() || null,
        numero_planilla_importacion: form.numero_planilla_importacion.trim() || null,
        fecha_emision: form.fecha_emision,
        fecha_vencimiento: form.fecha_vencimiento,
        tasa_bcv: tasaBcvNum,
        monto_exento: exentoNum,
        base_imponible: baseNum,
        alicuota_iva: alicuotaNum,
        monto_iva: montoIvaBs,
        monto_total: montoTotalBs,
        porcentaje_retencion: pctRetencionIva,
        monto_retencion: montoRetencionBs,
        monto_neto_pagar: montoNetoPagarBs,
        estatus_pago: 'pendiente',
      };

      const { error } = await supabase.from('compras').insert([payload]);

      if (error) {
        throw new Error(`Error en Supabase: ${error.message}`);
      }

      setSuccessMsg('¡Factura guardada e ingresada al Libro de Compras con éxito!');
      
      setForm({
        tipo_documento: 'factura',
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

      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
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
              Sub-módulo: Facturas y Comprobantes de Compra
            </h1>
            <p className="text-sm text-gray-500">
              Registro fiscal de compras, notas de crédito/débito y retenciones (Prov. 0071)
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
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0" />
            <div className="text-sm font-medium">{successMsg}</div>
          </div>
        )}

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b pb-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Cargar Documento de Compra / Gastos
            </h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
              SENIAT Prov. 0071
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={form.tipo_documento}
                  onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  required
                >
                  <option value="factura">Factura de Compra</option>
                  <option value="nota_credito">Nota de Crédito</option>
                  <option value="nota_debito">Nota de Débito</option>
                </select>
              </div>

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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tasa BCV (Bs. / USD) *
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

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Identificación del Comprobante Fiscal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Documento / Factura *</label>
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
                    N° Control * <span className="text-blue-600 text-[10px]">(SENIAT)</span>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Factura Afectada</label>
                  <input
                    placeholder="Requerido si es Nota C/D"
                    value={form.numero_nota_afectada}
                    onChange={(e) => setForm({ ...form, numero_nota_afectada: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Planilla Importación</label>
                  <input
                    placeholder="C-80 / C-81 (Opcional)"
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

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Importes de la Operación
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Base Imponible (Bs.) *</label>
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
                    <option value={31}>31% (Alícuota Adicional)</option>
                    <option value={0}>0% (Sin IVA)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Resumen de Cierre Tributario y Financiero (Doble Moneda)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="block text-[11px] text-slate-400 uppercase font-sans">Monto Exento</span>
                  <div className="text-sm font-bold text-slate-200 mt-1">{fmtBs(exentoNum)}</div>
                  <div className="text-xs text-slate-400 font-sans">{fmtUSD(exentoNum)}</div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="block text-[11px] text-slate-400 uppercase font-sans">Base Imponible</span>
                  <div className="text-sm font-bold text-slate-200 mt-1">{fmtBs(baseNum)}</div>
                  <div className="text-xs text-slate-400 font-sans">{fmtUSD(baseNum)}</div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="block text-[11px] text-blue-400 uppercase font-sans">Monto IVA ({alicuotaNum}%)</span>
                  <div className="text-sm font-bold text-blue-300 mt-1">{fmtBs(montoIvaBs)}</div>
                  <div className="text-xs text-blue-400/80 font-sans">{fmtUSD(montoIvaBs)}</div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="block text-[11px] text-slate-300 uppercase font-sans">Monto Total Documento</span>
                  <div className="text-sm font-bold text-white mt-1">{fmtBs(montoTotalBs)}</div>
                  <div className="text-xs text-slate-300/80 font-sans">{fmtUSD(montoTotalBs)}</div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="block text-[11px] text-amber-400 uppercase font-sans">Retención IVA ({pctRetencionIva}%)</span>
                  <div className="text-sm font-bold text-amber-300 mt-1">- {fmtBs(montoRetencionBs)}</div>
                  <div className="text-xs text-amber-400/80 font-sans">- {fmtUSD(montoRetencionBs)}</div>
                </div>

                <div className="bg-emerald-950/60 p-3 rounded-lg border border-emerald-700/60">
                  <span className="block text-[11px] text-emerald-400 uppercase font-sans font-bold">Neto a Pagar (CxP)</span>
                  <div className="text-base font-bold text-emerald-300 mt-1">{fmtBs(montoNetoPagarBs)}</div>
                  <div className="text-xs text-emerald-400/80 font-sans font-semibold">{fmtUSD(montoNetoPagarBs)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm transition shadow-sm disabled:opacity-50"
              >
                <PlusCircle size={18} />
                {saving ? 'Guardando...' : 'Registrar en Libro de Compras'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Documentos Registrados en CxP</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              Registros: {facturas.length}
            </span>
          </div>

          {facturas.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay documentos de compra registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Tipo / Emisión</th>
                    <th className="p-3">Proveedor</th>
                    <th className="p-3">N° Doc. / Control</th>
                    <th className="p-3 text-right">Base Imponible</th>
                    <th className="p-3 text-right">IVA</th>
                    <th className="p-3 text-right">Monto Total</th>
                    <th className="p-3 text-right">Ret. IVA</th>
                    <th className="p-3 text-right">Neto Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {facturas.map((f, idx) => (
                    <tr key={f.id || idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-sans font-bold rounded bg-slate-100 text-slate-700 mb-1">
                          {f.tipo_documento?.replace('_', ' ') || 'Factura'}
                        </span>
                        <div className="text-[11px] text-gray-500">{f.fecha_emision}</div>
                      </td>
                      <td className="p-3 font-sans font-medium text-gray-900">
                        {f.tercero?.razon_social || 'Proveedor'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-blue-900">{f.numero_factura}</div>
                        <div className="text-[10px] text-gray-500">Ctrl: {f.numero_control}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div>Bs. {f.base_imponible?.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">$ {(f.base_imponible / (f.tasa_bcv || 1)).toFixed(2)}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div>Bs. {f.monto_iva?.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">$ {(f.monto_iva / (f.tasa_bcv || 1)).toFixed(2)}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        <div>Bs. {f.monto_total?.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 font-normal">$ {(f.monto_total / (f.tasa_bcv || 1)).toFixed(2)}</div>
                      </td>
                      <td className="p-3 text-right text-amber-600">
                        <div>Bs. {f.monto_retencion?.toFixed(2)}</div>
                        <div className="text-[10px] text-amber-500/70">$ {(f.monto_retencion / (f.tasa_bcv || 1)).toFixed(2)}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        <div>Bs. {f.monto_neto_pagar?.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-500 font-normal">$ {(f.monto_neto_pagar / (f.tasa_bcv || 1)).toFixed(2)}</div>
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