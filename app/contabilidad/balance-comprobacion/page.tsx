'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Printer,
  Calendar
} from 'lucide-react';

interface CuentaBalance {
  codigo: string;
  nombre: string;
  debitos: number;
  creditos: number;
  saldoDeudor: number;
  saldoAcreedor: number;
}

export default function BalanceComprobacionPage() {
  const [busqueda, setBusqueda] = useState('');

  const cuentasBalance: CuentaBalance[] = [
    { codigo: '1.1.1.01.001', nombre: 'Bancos - Banco de Venezuela', debitos: 2300.00, creditos: 1200.00, saldoDeudor: 1100.00, saldoAcreedor: 0.00 },
    { codigo: '1.1.1.01.002', nombre: 'Bancos - Banesco', debitos: 500.00, creditos: 450.00, saldoDeudor: 50.00, saldoAcreedor: 0.00 },
    { codigo: '1.1.2.01.001', nombre: 'Cuentas por Cobrar Comerciales', debitos: 3200.00, creditos: 1500.00, saldoDeudor: 1700.00, saldoAcreedor: 0.00 },
    { codigo: '2.1.1.01.001', nombre: 'Cuentas por Pagar Proveedores', debitos: 800.00, creditos: 2500.00, saldoDeudor: 0.00, saldoAcreedor: 1700.00 },
    { codigo: '3.1.1.01.001', nombre: 'Capital Social Suscrito y Pagado', debitos: 0.00, creditos: 1000.00, saldoDeudor: 0.00, saldoAcreedor: 1000.00 },
    { codigo: '4.1.1.01.001', nombre: 'Ventas de Servicios / Honorarios', debitos: 0.00, creditos: 1500.00, saldoDeudor: 0.00, saldoAcreedor: 1500.00 },
    { codigo: '6.1.1.02.001', nombre: 'Gastos de Alquiler', debitos: 450.00, creditos: 0.00, saldoDeudor: 450.00, saldoAcreedor: 0.00 },
    { codigo: '6.1.1.01.001', nombre: 'Gastos de Sueldos y Salarios', debitos: 900.00, creditos: 0.00, saldoDeudor: 900.00, saldoAcreedor: 0.00 },
  ];

  const totalDebitos = cuentasBalance.reduce((acc, c) => acc + c.debitos, 0);
  const totalCreditos = cuentasBalance.reduce((acc, c) => acc + c.creditos, 0);
  const totalSaldoDeudor = cuentasBalance.reduce((acc, c) => acc + c.saldoDeudor, 0);
  const totalSaldoAcreedor = cuentasBalance.reduce((acc, c) => acc + c.saldoAcreedor, 0);

  const sumaSumasCuadrada = Math.abs(totalDebitos - totalCreditos) < 0.01;
  const sumaSaldosCuadrada = Math.abs(totalSaldoDeudor - totalSaldoAcreedor) < 0.01;
  const estaCuadradoCompletamente = sumaSumasCuadrada && sumaSaldosCuadrada;

  const cuentasFiltradas = cuentasBalance.filter(c =>
    c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-7 w-7 text-blue-600" />
            Balance de Comprobación (Sumas y Saldos)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verificación de la partida doble y consistencia de saldos para estados financieros VEN-NIF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition border border-slate-300"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button 
            onClick={() => alert('Exportando Balance de Comprobación a Excel...')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Corte al Período</div>
              <div className="text-base font-bold text-slate-900">30 de Septiembre de 2026</div>
            </div>
          </div>
          <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
            Moneda: USD ($)
          </span>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          estaCuadradoCompletamente 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {estaCuadradoCompletamente ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-8 w-8 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="text-xs font-bold uppercase">Estado de Consistencia</div>
            <div className="text-sm font-semibold">
              {estaCuadradoCompletamente 
                ? 'Balance Cuadrado y Verificado' 
                : 'Descuadre en Sumas o Saldos'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código de cuenta o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="p-4" rowSpan={2}>Código</th>
              <th className="p-4" rowSpan={2}>Nombre de la Cuenta</th>
              <th className="p-2 border-l border-slate-200 text-center" colSpan={2}>Sumas / Movimientos</th>
              <th className="p-2 border-l border-slate-200 text-center" colSpan={2}>Saldos Finales</th>
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-2 text-right border-l border-slate-200">Débitos ($)</th>
              <th className="p-2 text-right">Créditos ($)</th>
              <th className="p-2 text-right border-l border-slate-200">Deudor ($)</th>
              <th className="p-2 text-right">Acreedor ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {cuentasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No se encontraron cuentas contables registradas.
                </td>
              </tr>
            ) : (
              cuentasFiltradas.map((cuenta) => (
                <tr key={cuenta.codigo} className="hover:bg-slate-50 transition font-mono text-xs md:text-sm">
                  <td className="p-4 font-bold text-blue-600">{cuenta.codigo}</td>
                  <td className="p-4 font-sans font-medium text-slate-800">{cuenta.nombre}</td>
                  <td className="p-4 text-right border-l border-slate-100 text-slate-700">
                    {cuenta.debitos > 0 ? cuenta.debitos.toFixed(2) : '-'}
                  </td>
                  <td className="p-4 text-right text-slate-700">
                    {cuenta.creditos > 0 ? cuenta.creditos.toFixed(2) : '-'}
                  </td>
                  <td className="p-4 text-right border-l border-slate-100 text-slate-900 font-semibold">
                    {cuenta.saldoDeudor > 0 ? cuenta.saldoDeudor.toFixed(2) : '-'}
                  </td>
                  <td className="p-4 text-right text-slate-900 font-semibold">
                    {cuenta.saldoAcreedor > 0 ? cuenta.saldoAcreedor.toFixed(2) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900">
            <tr>
              <td colSpan={2} className="p-4 text-right font-sans uppercase text-xs">Totales Generales:</td>
              <td className="p-4 text-right border-l border-slate-200 text-blue-700">${totalDebitos.toFixed(2)}</td>
              <td className="p-4 text-right text-blue-700">${totalCreditos.toFixed(2)}</td>
              <td className="p-4 text-right border-l border-slate-200 text-emerald-700">${totalSaldoDeudor.toFixed(2)}</td>
              <td className="p-4 text-right text-emerald-700">${totalSaldoAcreedor.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}