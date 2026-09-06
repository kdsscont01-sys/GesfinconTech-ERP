'use client';

import React, { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar
} from 'lucide-react';

interface MovimientoMayor {
  id: string;
  fecha: string;
  comprobante: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
}

interface CuentaMayor {
  codigo: string;
  nombre: string;
  saldoInicial: number;
  movimientos: MovimientoMayor[];
}

export default function LibroMayorPage() {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string>('1.1.1.01.001');
  const [busqueda, setBusqueda] = useState('');

  const cuentas: Record<string, CuentaMayor> = {
    '1.1.1.01.001': {
      codigo: '1.1.1.01.001',
      nombre: 'Bancos - Banco de Venezuela',
      saldoInicial: 5000.00,
      movimientos: [
        { id: 'm1', fecha: '2026-09-01', comprobante: 'CMP-2026-0001', concepto: 'Cobro de factura F-0012 a cliente SACK Consulting', debe: 1500.00, haber: 0, saldo: 6500.00 },
        { id: 'm2', fecha: '2026-09-02', comprobante: 'CMP-2026-0003', concepto: 'Pago de nómina quincenal personal operativo', debe: 0, haber: 1200.00, saldo: 5300.00 },
        { id: 'm3', fecha: '2026-09-04', comprobante: 'CMP-2026-0005', concepto: 'Transferencia por liquidación de ventas', debe: 800.00, haber: 0, saldo: 6100.00 },
      ]
    },
    '1.1.2.01.001': {
      codigo: '1.1.2.01.001',
      nombre: 'Cuentas por Cobrar Comerciales',
      saldoInicial: 3200.00,
      movimientos: [
        { id: 'm4', fecha: '2026-09-01', comprobante: 'CMP-2026-0001', concepto: 'Cancelación F-0012 por cobro en banco', debe: 0, haber: 1500.00, saldo: 1700.00 },
      ]
    },
    '6.1.1.02.001': {
      codigo: '6.1.1.02.001',
      nombre: 'Gastos de Alquiler',
      saldoInicial: 0.00,
      movimientos: [
        { id: 'm5', fecha: '2026-09-03', comprobante: 'CMP-2026-0002', concepto: 'Alquiler mes de Septiembre oficina Los Teques', debe: 450.00, haber: 0, saldo: 450.00 },
      ]
    }
  };

  const cuentaActual = cuentas[cuentaSeleccionada] || {
    codigo: cuentaSeleccionada,
    nombre: 'Selecciona una cuenta',
    saldoInicial: 0,
    movimientos: []
  };

  const totalDebe = cuentaActual.movimientos.reduce((acc, m) => acc + m.debe, 0);
  const totalHaber = cuentaActual.movimientos.reduce((acc, m) => acc + m.haber, 0);
  const saldoFinal = cuentaActual.saldoInicial + totalDebe - totalHaber;

  const movimientosFiltrados = cuentaActual.movimientos.filter(m =>
    m.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.comprobante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-blue-600" />
            Libro Mayor Contable
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta detallada del historial de movimientos y saldos por cuenta VEN-NIF.
          </p>
        </div>
        <button 
          onClick={() => alert('Generando reporte PDF del Libro Mayor...')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-lg text-sm font-medium transition border border-slate-300"
        >
          <Download className="h-4 w-4" />
          Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Seleccionar Cuenta Contable
            </label>
            <select
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            >
              <option value="1.1.1.01.001">1.1.1.01.001 - Bancos - Banco de Venezuela</option>
              <option value="1.1.2.01.001">1.1.2.01.001 - Cuentas por Cobrar Comerciales</option>
              <option value="6.1.1.02.001">6.1.1.02.001 - Gastos de Alquiler</option>
            </select>
          </div>

          <div className="w-full md:w-1/2 relative">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Filtrar Movimientos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por concepto o comprobante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-medium text-blue-300 uppercase tracking-wider">
            Saldo Actual de la Cuenta
          </div>
          <div className="text-3xl font-extrabold font-mono mt-2">
            ${saldoFinal.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex justify-between border-t border-slate-800 pt-2">
            <span>Inicial: ${cuentaActual.saldoInicial.toFixed(2)}</span>
            <span>Movs: {cuentaActual.movimientos.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Debe (Cargos)</div>
            <div className="text-lg font-bold font-mono text-slate-900">${totalDebe.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Haber (Abonos)</div>
            <div className="text-lg font-bold font-mono text-slate-900">${totalHaber.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Período Activo</div>
            <div className="text-sm font-semibold text-slate-800">Septiembre 2026</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800 font-mono">
            {cuentaActual.codigo} - {cuentaActual.nombre}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Saldo Inicial: ${cuentaActual.saldoInicial.toFixed(2)}
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Fecha</th>
              <th className="p-4">Nº Comprobante</th>
              <th className="p-4">Concepto / Leyenda</th>
              <th className="p-4 text-right">Debe ($)</th>
              <th className="p-4 text-right">Haber ($)</th>
              <th className="p-4 text-right">Saldo ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No hay movimientos registrados para esta cuenta contable.
                </td>
              </tr>
            ) : (
              movimientosFiltrados.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-600">{m.fecha}</td>
                  <td className="p-4 font-mono font-medium text-blue-600">{m.comprobante}</td>
                  <td className="p-4 text-slate-800">{m.concepto}</td>
                  <td className="p-4 text-right font-mono text-slate-700">
                    {m.debe > 0 ? `$${m.debe.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-700">
                    {m.haber > 0 ? `$${m.haber.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-slate-900">
                    ${m.saldo.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}