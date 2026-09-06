'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  Download, 
  Printer, 
  Calendar,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export default function EstadosFinancierosPage() {
  const [tabActiva, setTabActiva] = useState<'situacion' | 'resultados'>('situacion');

  // Datos mock - Estado de Situación Financiera
  const activosCorrientes = [
    { codigo: '1.1.1', nombre: 'Efectivo y Equivalentes de Efectivo', monto: 1150.00 },
    { codigo: '1.1.2', nombre: 'Cuentas por Cobrar Comerciales', monto: 1700.00 },
  ];
  const totalActivoCorriente = activosCorrientes.reduce((acc, item) => acc + item.monto, 0);

  const activosNoCorrientes = [
    { codigo: '1.2.1', nombre: 'Mobiliario y Equipo de Oficina', monto: 2500.00 },
    { codigo: '1.2.2', nombre: 'Depreciación Acumulada', monto: -300.00 },
  ];
  const totalActivoNoCorriente = activosNoCorrientes.reduce((acc, item) => acc + item.monto, 0);
  const totalActivo = totalActivoCorriente + totalActivoNoCorriente;

  const pasivosCorrientes = [
    { codigo: '2.1.1', nombre: 'Cuentas por Pagar Comerciales', monto: 1700.00 },
    { codigo: '2.1.2', nombre: 'Retenciones ISLR por Pagar', monto: 150.00 },
  ];
  const totalPasivoCorriente = pasivosCorrientes.reduce((acc, item) => acc + item.monto, 0);

  const patrimonio = [
    { codigo: '3.1.1', nombre: 'Capital Social Suscrito y Pagado', monto: 1000.00 },
    { codigo: '3.2.1', nombre: 'Reserva Legal', monto: 100.00 },
    { codigo: '3.3.1', nombre: 'Utilidad Neta del Ejercicio', monto: 2200.00 },
  ];
  const totalPatrimonio = patrimonio.reduce((acc, item) => acc + item.monto, 0);
  const totalPasivoYPatrimonio = totalPasivoCorriente + totalPatrimonio;

  // Datos mock - Estado de Resultados
  const ingresos = [
    { codigo: '4.1.1', nombre: 'Ingresos por Servicios de Consultoría', monto: 3500.00 },
  ];
  const totalIngresos = ingresos.reduce((acc, item) => acc + item.monto, 0);

  const costos = [
    { codigo: '5.1.1', nombre: 'Costo de Servicios Prestados', monto: 0.00 },
  ];
  const totalCostos = costos.reduce((acc, item) => acc + item.monto, 0);
  const utilidadBruta = totalIngresos - totalCostos;

  const gastosOperativos = [
    { codigo: '6.1.1.01', nombre: 'Gastos de Sueldos y Salarios', monto: 850.00 },
    { codigo: '6.1.1.02', nombre: 'Gastos de Alquiler de Oficina', monto: 450.00 },
  ];
  const totalGastos = gastosOperativos.reduce((acc, item) => acc + item.monto, 0);
  const utilidadNeta = utilidadBruta - totalGastos;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-blue-600" />
            Estados Financieros VEN-NIF
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Presentación formal bajo NIIF para PYMES (Estado de Situación Financiera y Estado de Resultados).
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
            onClick={() => alert('Generando informe financiero compilado en PDF...')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl shadow-sm">
        <button
          onClick={() => setTabActiva('situacion')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
            tabActiva === 'situacion'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Estado de Situación Financiera (Balance General)
        </button>
        <button
          onClick={() => setTabActiva('resultados')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
            tabActiva === 'resultados'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Estado de Resultados (P&G)
        </button>
      </div>

      {/* Vista 1: Estado de Situación Financiera */}
      {tabActiva === 'situacion' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Ecuación Patrimonial Cuadrada: Activo ($ {totalActivo.toFixed(2)}) = Pasivo + Patrimonio ($ {totalPasivoYPatrimonio.toFixed(2)})
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold">
              Corte: 30/09/2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección ACTIVOS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 font-bold text-sm uppercase tracking-wider flex justify-between items-center">
                <span>ACTIVO</span>
                <span className="font-mono text-base">${totalActivo.toFixed(2)}</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-2 border-b border-slate-100 pb-1">Activo Corriente</h4>
                  {activosCorrientes.map((a) => (
                    <div key={a.codigo} className="flex justify-between text-sm py-1 font-mono text-slate-600">
                      <span>{a.codigo} - {a.nombre}</span>
                      <span>${a.monto.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200 mt-2">
                    <span>Total Activo Corriente</span>
                    <span>${totalActivoCorriente.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-2 border-b border-slate-100 pb-1">Activo No Corriente</h4>
                  {activosNoCorrientes.map((a) => (
                    <div key={a.codigo} className="flex justify-between text-sm py-1 font-mono text-slate-600">
                      <span>{a.codigo} - {a.nombre}</span>
                      <span>${a.monto.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200 mt-2">
                    <span>Total Activo No Corriente</span>
                    <span>${totalActivoNoCorriente.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección PASIVO Y PATRIMONIO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 font-bold text-sm uppercase tracking-wider flex justify-between items-center">
                <span>PASIVO Y PATRIMONIO</span>
                <span className="font-mono text-base">${totalPasivoYPatrimonio.toFixed(2)}</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-2 border-b border-slate-100 pb-1">Pasivo Corriente</h4>
                  {pasivosCorrientes.map((p) => (
                    <div key={p.codigo} className="flex justify-between text-sm py-1 font-mono text-slate-600">
                      <span>{p.codigo} - {p.nombre}</span>
                      <span>${p.monto.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200 mt-2">
                    <span>Total Pasivo Corriente</span>
                    <span>${totalPasivoCorriente.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-2 border-b border-slate-100 pb-1">Patrimonio Neto</h4>
                  {patrimonio.map((pat) => (
                    <div key={pat.codigo} className="flex justify-between text-sm py-1 font-mono text-slate-600">
                      <span>{pat.codigo} - {pat.nombre}</span>
                      <span>${pat.monto.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200 mt-2">
                    <span>Total Patrimonio</span>
                    <span>${totalPatrimonio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista 2: Estado de Resultados */}
      {tabActiva === 'resultados' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Estado de Resultados Integral</h3>
              <p className="text-xs text-slate-400 mt-0.5">Período: 01/09/2026 al 30/09/2026</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 block">Utilidad Neta</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">${utilidadNeta.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Ingresos */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-emerald-600" /> Ingresos Operacionales</span>
              <span className="font-mono text-slate-900">${totalIngresos.toFixed(2)}</span>
            </div>

            {/* Costos */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2"><ArrowDownLeft className="h-4 w-4 text-rose-600" /> Costos Operacionales</span>
              <span className="font-mono text-slate-900">(${totalCostos.toFixed(2)})</span>
            </div>

            {/* Utilidad Bruta */}
            <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg font-bold text-sm text-slate-900">
              <span>UTILIDAD BRUTA EN VENTAS</span>
              <span className="font-mono">${utilidadBruta.toFixed(2)}</span>
            </div>

            {/* Gastos Operativos */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase text-slate-500">Gastos de Operación y Administración</span>
              {gastosOperativos.map((g) => (
                <div key={g.codigo} className="flex justify-between text-sm py-1 font-mono text-slate-600 pl-4">
                  <span>{g.nombre}</span>
                  <span>${g.monto.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-200">
                <span>Total Gastos Operativos</span>
                <span className="font-mono">(${totalGastos.toFixed(2)})</span>
              </div>
            </div>

            {/* Utilidad Neta Final */}
            <div className="flex justify-between items-center py-4 bg-emerald-50 text-emerald-900 px-4 rounded-xl font-extrabold text-base border border-emerald-200 mt-6">
              <span>UTILIDAD NETA DEL EJERCICIO</span>
              <span className="font-mono text-xl">${utilidadNeta.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}