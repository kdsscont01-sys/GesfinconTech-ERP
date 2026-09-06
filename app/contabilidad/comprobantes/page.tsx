'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Save, 
  Search, 
  AlertCircle, 
  BookOpen
} from 'lucide-react';

interface AsientoLinea {
  id: string;
  codigoCuenta: string;
  nombreCuenta: string;
  concepto: string;
  debe: number;
  haber: number;
}

interface Comprobante {
  id: string;
  numero: string;
  fecha: string;
  tipo: 'Diario' | 'Ingreso' | 'Egreso' | 'Ajuste';
  concepto: string;
  lineas: AsientoLinea[];
  estado: 'Borrador' | 'Aprobado';
  totalDebe: number;
  totalHaber: number;
}

export default function ComprobantesPage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([
    {
      id: '1',
      numero: 'CMP-2026-0001',
      fecha: '2026-09-01',
      tipo: 'Ingreso',
      concepto: 'Cobro de factura F-0012 a cliente SACK Consulting',
      estado: 'Aprobado',
      totalDebe: 1500.00,
      totalHaber: 1500.00,
      lineas: [
        { id: 'l1', codigoCuenta: '1.1.1.01.001', nombreCuenta: 'Bancos - Banco de Venezuela', concepto: 'Ingreso por transferencia', debe: 1500.00, haber: 0 },
        { id: 'l2', codigoCuenta: '1.1.2.01.001', nombreCuenta: 'Cuentas por Cobrar Comerciales', concepto: 'Cancelación F-0012', debe: 0, haber: 1500.00 },
      ]
    },
    {
      id: '2',
      numero: 'CMP-2026-0002',
      fecha: '2026-09-03',
      tipo: 'Egreso',
      concepto: 'Pago de alquiler de oficina Los Teques',
      estado: 'Borrador',
      totalDebe: 450.00,
      totalHaber: 450.00,
      lineas: [
        { id: 'l3', codigoCuenta: '6.1.1.02.001', nombreCuenta: 'Gastos de Alquiler', concepto: 'Alquiler mes de Septiembre', debe: 450.00, haber: 0 },
        { id: 'l4', codigoCuenta: '1.1.1.01.002', nombreCuenta: 'Bancos - Banesco', concepto: 'Pago por transferencia', debe: 0, haber: 450.00 },
      ]
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'Diario' | 'Ingreso' | 'Egreso' | 'Ajuste'>('Diario');
  const [conceptoGeneral, setConceptoGeneral] = useState('');
  const [lineas, setLineas] = useState<AsientoLinea[]>([
    { id: '1', codigoCuenta: '', nombreCuenta: '', concepto: '', debe: 0, haber: 0 },
    { id: '2', codigoCuenta: '', nombreCuenta: '', concepto: '', debe: 0, haber: 0 }
  ]);

  const totalDebe = lineas.reduce((acc, l) => acc + (Number(l.debe) || 0), 0);
  const totalHaber = lineas.reduce((acc, l) => acc + (Number(l.haber) || 0), 0);
  const estaCuadrado = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      { id: Date.now().toString(), codigoCuenta: '', nombreCuenta: '', concepto: '', debe: 0, haber: 0 }
    ]);
  };

  const eliminarLinea = (id: string) => {
    if (lineas.length <= 2) return;
    setLineas(lineas.filter(l => l.id !== id));
  };

  const actualizarLinea = (id: string, campo: keyof AsientoLinea, valor: any) => {
    setLineas(lineas.map(l => l.id === id ? { ...l, [campo]: valor } : l));
  };

  const guardarComprobante = (estado: 'Borrador' | 'Aprobado') => {
    if (!estaCuadrado && estado === 'Aprobado') {
      alert('El comprobante debe estar cuadrado (Debe = Haber) para poder ser aprobado.');
      return;
    }

    const nuevo: Comprobante = {
      id: Date.now().toString(),
      numero: `CMP-2026-${(comprobantes.length + 1).toString().padStart(4, '0')}`,
      fecha,
      tipo,
      concepto: conceptoGeneral,
      lineas,
      estado,
      totalDebe,
      totalHaber
    };

    setComprobantes([nuevo, ...comprobantes]);
    setModalAbierto(false);
    setConceptoGeneral('');
    setLineas([
      { id: '1', codigoCuenta: '', nombreCuenta: '', concepto: '', debe: 0, haber: 0 },
      { id: '2', codigoCuenta: '', nombreCuenta: '', concepto: '', debe: 0, haber: 0 }
    ]);
  };

  const comprobantesFiltrados = comprobantes.filter(c => 
    c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.concepto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Comprobantes Contables (Asientos)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro diario de transacciones, ingresos, egresos y ajustes contables VEN-NIF.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo Comprobante
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nro. comprobante o concepto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Nº Comprobante</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Concepto</th>
              <th className="p-4 text-right">Debe ($)</th>
              <th className="p-4 text-right">Haber ($)</th>
              <th className="p-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {comprobantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No se encontraron comprobantes contables registrados.
                </td>
              </tr>
            ) : (
              comprobantesFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-medium text-blue-600">{item.numero}</td>
                  <td className="p-4 text-slate-600">{item.fecha}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {item.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-slate-800 max-w-md truncate">{item.concepto}</td>
                  <td className="p-4 text-right font-mono text-slate-700">{item.totalDebe.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono text-slate-700">{item.totalHaber.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      item.estado === 'Aprobado' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Nuevo Comprobante Contable</h2>
                <p className="text-xs text-slate-500">Asegúrate de balancear la partida doble (Debe = Haber).</p>
              </div>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Comprobante</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Diario">Diario</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Egreso">Egreso</option>
                    <option value="Ajuste">Ajuste</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estado de Cuadre</label>
                  <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                    estaCuadrado 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {estaCuadrado ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        Partida Doble Cuadrada
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        Diferencia: ${(totalDebe - totalHaber).toFixed(2)}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Concepto / Descripción General</label>
                <input
                  type="text"
                  placeholder="Ej. Registro de servicio de transporte corporativo"
                  value={conceptoGeneral}
                  onChange={(e) => setConceptoGeneral(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">Detalle del Asiento</h3>
                  <button
                    onClick={agregarLinea}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Añadir Fila
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <tr>
                        <th className="p-2.5 w-1/4">Código / Cuenta</th>
                        <th className="p-2.5">Detalle / Leyenda</th>
                        <th className="p-2.5 w-28 text-right">Debe ($)</th>
                        <th className="p-2.5 w-28 text-right">Haber ($)</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {lineas.map((linea) => (
                        <tr key={linea.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="1.1.1.01.001"
                              value={linea.codigoCuenta}
                              onChange={(e) => actualizarLinea(linea.id, 'codigoCuenta', e.target.value)}
                              className="w-full p-1.5 border border-slate-300 rounded font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Descripción del movimiento..."
                              value={linea.concepto}
                              onChange={(e) => actualizarLinea(linea.id, 'concepto', e.target.value)}
                              className="w-full p-1.5 border border-slate-300 rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={linea.debe || ''}
                              onChange={(e) => actualizarLinea(linea.id, 'debe', parseFloat(e.target.value) || 0)}
                              className="w-full p-1.5 border border-slate-300 rounded text-right font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={linea.haber || ''}
                              onChange={(e) => actualizarLinea(linea.id, 'haber', parseFloat(e.target.value) || 0)}
                              className="w-full p-1.5 border border-slate-300 rounded text-right font-mono"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => eliminarLinea(linea.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Eliminar fila"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-right text-slate-700">Totales:</td>
                        <td className="p-2.5 text-right font-mono text-slate-900">${totalDebe.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono text-slate-900">${totalHaber.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => guardarComprobante('Borrador')}
                className="px-4 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
              >
                Guardar Borrador
              </button>
              <button
                onClick={() => guardarComprobante('Aprobado')}
                disabled={!estaCuadrado}
                className={`px-4 py-2 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 ${
                  estaCuadrado ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-3.5 w-3.5" />
                Aprobar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}