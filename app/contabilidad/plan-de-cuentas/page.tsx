"use client";

import React, { useState, useMemo } from "react";

// Tipo de dato para las Cuentas Contables
export interface CuentaContable {
  id: string;
  codigo: string;       // Ej: 1.1.01.01.001
  nombre: string;       // Ej: Banco Banesco
  nivel: number;        // Nivel del 1 al 5
  clasificacion: "ACTIVO" | "PASIVO" | "PATRIMONIO" | "INGRESOS" | "COSTOS" | "GASTOS";
  naturaleza: "DEUDORA" | "ACREEDORA";
  tipo: "TITULO" | "IMPUTABLE"; // TITULO = Grupo (Padre), IMPUTABLE = Detalle (Recibe asientos)
  padreId?: string;
  activa: boolean;
  saldo?: number;       // Saldo de referencia opcional
}

// Plan de Cuentas Base preconfigurado para Venezuela (VEN-NIF)
const PLAN_BASE_INICIAL: CuentaContable[] = [
  // --- 1. ACTIVO ---
  { id: "1", codigo: "1", nombre: "ACTIVO", nivel: 1, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", activa: true },
  { id: "1.1", codigo: "1.1", nombre: "ACTIVO CORRIENTE", nivel: 2, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1", activa: true },
  { id: "1.1.01", codigo: "1.1.01", nombre: "EFECTIVO Y EQUIVALENTES DE EFECTIVO", nivel: 3, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1", activa: true },
  { id: "1.1.01.01", codigo: "1.1.01.01", nombre: "Caja Principal y Cajas Chicas", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1.01", activa: true },
  { id: "1.1.01.01.001", codigo: "1.1.01.01.001", nombre: "Caja Chica General", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.01.01", activa: true, saldo: 1500.00 },
  { id: "1.1.01.01.002", codigo: "1.1.01.01.002", nombre: "Caja Principal Bs.", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.01.01", activa: true, saldo: 0.00 },
  { id: "1.1.01.02", codigo: "1.1.01.02", nombre: "Bancos Nacionales", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1.01", activa: true },
  { id: "1.1.01.02.001", codigo: "1.1.01.02.001", nombre: "Banesco Banco Universal (Bs.)", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.01.02", activa: true, saldo: 450000.00 },
  { id: "1.1.01.02.002", codigo: "1.1.01.02.002", nombre: "Banco de Venezuela (Bs.)", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.01.02", activa: true, saldo: 125000.00 },
  { id: "1.1.01.02.003", codigo: "1.1.01.02.003", nombre: "Cuenta Custodia Divisas (USD)", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.01.02", activa: true, saldo: 3200.00 },
  
  { id: "1.1.02", codigo: "1.1.02", nombre: "CUENTAS Y DOCUMENTOS POR COBRAR", nivel: 3, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1", activa: true },
  { id: "1.1.02.01", codigo: "1.1.02.01", nombre: "Cuentas por Cobrar Comerciales", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1.02", activa: true },
  { id: "1.1.02.01.001", codigo: "1.1.02.01.001", nombre: "Clientes Nacionales", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.02.01", activa: true, saldo: 89000.00 },
  { id: "1.1.02.02", codigo: "1.1.02.02", nombre: "Tributos A Favor / Retenciones por Cobrar", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1.02", activa: true },
  { id: "1.1.02.02.001", codigo: "1.1.02.02.001", nombre: "Retenciones de IVA por Cobrar", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.02.02", activa: true, saldo: 12400.00 },
  { id: "1.1.02.02.002", codigo: "1.1.02.02.002", nombre: "Retenciones de ISLR por Cobrar", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.02.02", activa: true, saldo: 4500.00 },

  { id: "1.1.03", codigo: "1.1.03", nombre: "INVENTARIOS", nivel: 3, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1", activa: true },
  { id: "1.1.03.01", codigo: "1.1.03.01", nombre: "Inventario de Mercancía para la Venta", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.1.03", activa: true },
  { id: "1.1.03.01.001", codigo: "1.1.03.01.001", nombre: "Mercancía General Almacén", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.1.03.01", activa: true, saldo: 320000.00 },

  { id: "1.2", codigo: "1.2", nombre: "ACTIVO NO CORRIENTE", nivel: 2, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1", activa: true },
  { id: "1.2.01", codigo: "1.2.01", nombre: "PROPIEDAD, PLANTA Y EQUIPO", nivel: 3, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.2", activa: true },
  { id: "1.2.01.01", codigo: "1.2.01.01", nombre: "Equipos de Computación y Sistemas", nivel: 4, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "1.2.01", activa: true },
  { id: "1.2.01.01.001", codigo: "1.2.01.01.001", nombre: "Laptops y Equipos de Oficina", nivel: 5, clasificacion: "ACTIVO", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "1.2.01.01", activa: true, saldo: 85000.00 },

  // --- 2. PASIVO ---
  { id: "2", codigo: "2", nombre: "PASIVO", nivel: 1, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", activa: true },
  { id: "2.1", codigo: "2.1", nombre: "PASIVO CORRIENTE", nivel: 2, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2", activa: true },
  { id: "2.1.01", codigo: "2.1.01", nombre: "CUENTAS POR PAGAR COMERCIALES", nivel: 3, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2.1", activa: true },
  { id: "2.1.01.01", codigo: "2.1.01.01", nombre: "Proveedores Nacionales", nivel: 4, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2.1.01", activa: true },
  { id: "2.1.01.01.001", codigo: "2.1.01.01.001", nombre: "Proveedores de Mercancía y Servicios", nivel: 5, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "2.1.01.01", activa: true, saldo: 443968.00 },
  
  { id: "2.1.02", codigo: "2.1.02", nombre: "OBLIGACIONES TRIBUTARIAS POR PAGAR", nivel: 3, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2.1", activa: true },
  { id: "2.1.02.01", codigo: "2.1.02.01", nombre: "Débito Fiscal IVA por Pagar", nivel: 4, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2.1.02", activa: true },
  { id: "2.1.02.01.001", codigo: "2.1.02.01.001", nombre: "IVA Débito Fiscal General (16%)", nivel: 5, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "2.1.02.01", activa: true, saldo: 74168.00 },
  { id: "2.1.02.02", codigo: "2.1.02.02", nombre: "Retenciones de IVA por Enterar SENIAT", nivel: 4, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "2.1.02", activa: true },
  { id: "2.1.02.02.001", codigo: "2.1.02.02.001", nombre: "Retenciones IVA Proveedores por Enterar", nivel: 5, clasificacion: "PASIVO", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "2.1.02.02", activa: true, saldo: 0.00 },

  // --- 3. PATRIMONIO ---
  { id: "3", codigo: "3", nombre: "PATRIMONIO", nivel: 1, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "TITULO", activa: true },
  { id: "3.1", codigo: "3.1", nombre: "CAPITAL CONTABLE", nivel: 2, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "3", activa: true },
  { id: "3.1.01", codigo: "3.1.01", nombre: "Capital Social Suscrito y Pagado", nivel: 3, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "3.1", activa: true },
  { id: "3.1.01.01.001", codigo: "3.1.01.01.001", nombre: "Capital Social Nominativo", nivel: 5, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "3.1.01", activa: true, saldo: 100000.00 },
  { id: "3.2", codigo: "3.2", nombre: "RESULTADOS", nivel: 2, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "3", activa: true },
  { id: "3.2.01.01.001", codigo: "3.2.01.01.001", nombre: "Utilidades / Pérdidas Acumuladas", nivel: 5, clasificacion: "PATRIMONIO", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "3.2", activa: true, saldo: 85000.00 },

  // --- 4. INGRESOS ---
  { id: "4", codigo: "4", nombre: "INGRESOS", nivel: 1, clasificacion: "INGRESOS", naturaleza: "ACREEDORA", tipo: "TITULO", activa: true },
  { id: "4.1", codigo: "4.1", nombre: "INGRESOS OPERACIONALES", nivel: 2, clasificacion: "INGRESOS", naturaleza: "ACREEDORA", tipo: "TITULO", padreId: "4", activa: true },
  { id: "4.1.01.01.001", codigo: "4.1.01.01.001", nombre: "Ventas de Mercancías Generales", nivel: 5, clasificacion: "INGRESOS", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "4.1", activa: true, saldo: 950000.00 },
  { id: "4.1.01.01.002", codigo: "4.1.01.01.002", nombre: "Servicios de Asesoría y Consultoría", nivel: 5, clasificacion: "INGRESOS", naturaleza: "ACREEDORA", tipo: "IMPUTABLE", padreId: "4.1", activa: true, saldo: 230000.00 },

  // --- 5. COSTOS ---
  { id: "5", codigo: "5", nombre: "COSTOS", nivel: 1, clasificacion: "COSTOS", naturaleza: "DEUDORA", tipo: "TITULO", activa: true },
  { id: "5.1", codigo: "5.1", nombre: "COSTO DE VENTAS Y SERVICIOS", nivel: 2, clasificacion: "COSTOS", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "5", activa: true },
  { id: "5.1.01.01.001", codigo: "5.1.01.01.001", nombre: "Costo de Ventas Mercancía", nivel: 5, clasificacion: "COSTOS", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "5.1", activa: true, saldo: 540000.00 },

  // --- 6. GASTOS ---
  { id: "6", codigo: "6", nombre: "GASTOS", nivel: 1, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "TITULO", activa: true },
  { id: "6.1", codigo: "6.1", nombre: "GASTOS OPERACIONALES", nivel: 2, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "6", activa: true },
  { id: "6.1.01", codigo: "6.1.01", nombre: "Gastos de Administración", nivel: 3, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "6.1", activa: true },
  { id: "6.1.01.01.001", codigo: "6.1.01.01.001", nombre: "Sueldos y Salarios Personal Administrativo", nivel: 5, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "6.1.01", activa: true, saldo: 120000.00 },
  { id: "6.1.01.01.002", codigo: "6.1.01.01.002", nombre: "Honorarios Profesionales y Asesorías", nivel: 5, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "6.1.01", activa: true, saldo: 45000.00 },
  { id: "6.1.01.01.003", codigo: "6.1.01.01.003", nombre: "Alquiler de Oficina / Local Comercial", nivel: 5, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "6.1.01", activa: true, saldo: 38000.00 },
  { id: "6.2", codigo: "6.2", nombre: "GASTOS FINANCIEROS Y DIVERSOS", nivel: 2, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "TITULO", padreId: "6.2", activa: true },
  { id: "6.2.01.01.001", codigo: "6.2.01.01.001", nombre: "Comisiones y Gastos Bancarios", nivel: 5, clasificacion: "GASTOS", naturaleza: "DEUDORA", tipo: "IMPUTABLE", padreId: "6.2", activa: true, saldo: 8400.00 }
];

export default function PlanDeCuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>(PLAN_BASE_INICIAL);
  const [busqueda, setBusqueda] = useState("");
  const [filtroClasificacion, setFiltroClasificacion] = useState<string>("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
  const [nodosColapsados, setNodosColapsados] = useState<Record<string, boolean>>({});

  // Estado para el modal de Crear/Editar Cuenta
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaPadreSel, setCuentaPadreSel] = useState<string>("");
  const [nuevaCuenta, setNuevaCuenta] = useState({
    codigo: "",
    nombre: "",
    clasificacion: "ACTIVO" as CuentaContable["clasificacion"],
    naturaleza: "DEUDORA" as CuentaContable["naturaleza"],
    tipo: "IMPUTABLE" as CuentaContable["tipo"],
    nivel: 5
  });

  // Alternar expansión/colapso de ramas
  const toggleColapso = (id: string) => {
    setNodosColapsados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandirTodos = () => setNodosColapsados({});
  const colapsarTodos = () => {
    const todos: Record<string, boolean> = {};
    cuentas.forEach((c) => {
      if (c.tipo === "TITULO") todos[c.id] = true;
    });
    setNodosColapsados(todos);
  };

  // Filtrado dinámico
  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      // Coincidencia de texto (Código o Nombre)
      const matchBusqueda =
        cuenta.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuenta.nombre.toLowerCase().includes(busqueda.toLowerCase());

      // Clasificación
      const matchClasificacion =
        filtroClasificacion === "TODAS" || cuenta.clasificacion === filtroClasificacion;

      // Tipo
      const matchTipo =
        filtroTipo === "TODOS" || cuenta.tipo === filtroTipo;

      // Nivel
      const matchNivel =
        filtroNivel === "TODOS" || cuenta.nivel.toString() === filtroNivel;

      return matchBusqueda && matchClasificacion && matchTipo && matchNivel;
    });
  }, [cuentas, busqueda, filtroClasificacion, filtroTipo, filtroNivel]);

  // Contadores estadísticos
  const stats = useMemo(() => {
    const total = cuentas.length;
    const imputables = cuentas.filter((c) => c.tipo === "IMPUTABLE").length;
    const titulos = cuentas.filter((c) => c.tipo === "TITULO").length;
    return { total, imputables, titulos };
  }, [cuentas]);

  // Manejar creación de nueva cuenta
  const abrirModalCrearSubcuenta = (padre?: CuentaContable) => {
    if (padre) {
      setCuentaPadreSel(padre.id);
      setNuevaCuenta({
        codigo: padre.codigo + ".",
        nombre: "",
        clasificacion: padre.clasificacion,
        naturaleza: padre.naturaleza,
        tipo: padre.nivel === 4 ? "IMPUTABLE" : "TITULO",
        nivel: Math.min(padre.nivel + 1, 5)
      });
    } else {
      setCuentaPadreSel("");
      setNuevaCuenta({
        codigo: "",
        nombre: "",
        clasificacion: "ACTIVO",
        naturaleza: "DEUDORA",
        tipo: "IMPUTABLE",
        nivel: 5
      });
    }
    setModalAbierto(true);
  };

  const guardarNuevaCuenta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCuenta.codigo || !nuevaCuenta.nombre) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }

    const existe = cuentas.some((c) => c.codigo === nuevaCuenta.codigo.trim());
    if (existe) {
      alert("Ya existe una cuenta registrada con este código.");
      return;
    }

    const nueva: CuentaContable = {
      id: nuevaCuenta.codigo.trim(),
      codigo: nuevaCuenta.codigo.trim(),
      nombre: nuevaCuenta.nombre.trim().toUpperCase(),
      nivel: nuevaCuenta.nivel,
      clasificacion: nuevaCuenta.clasificacion,
      naturaleza: nuevaCuenta.naturaleza,
      tipo: nuevaCuenta.tipo,
      padreId: cuentaPadreSel || undefined,
      activa: true,
      saldo: 0.00
    };

    setCuentas((prev) => [...prev, nueva].sort((a, b) => a.codigo.localeCompare(b.codigo)));
    setModalAbierto(false);
  };

  // Función de Impresión / PDF Nativo
  const handleImprimirPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      {/* Estilos específicos de Impresión / PDF */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            font-size: 10pt !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 4px 8px !important;
          }
          thead {
            background-color: #0f172a !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* ENCABEZADO PRINCIPAL (Pantalla e Impresión) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 print-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wide">
                Módulo Contable
              </span>
              <span className="text-slate-400 text-sm">GESFINCONTECH ERP v2.0</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Catálogo de Cuentas (Plan de Cuentas)
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Estructura financiera multinivel conforme a la normativa contable VEN-NIF.
            </p>
          </div>

          {/* Botones de Acción principales */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={expandirTodos}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Expandir Todo
            </button>
            <button
              onClick={colapsarTodos}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Colapsar Todo
            </button>
            <button
              onClick={() => abrirModalCrearSubcuenta()}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span> Nueva Cuenta
            </button>
            <button
              onClick={handleImprimirPDF}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              🖨️ Descargar PDF / Imprimir
            </button>
          </div>
        </div>

        {/* MÉTREDIS / ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Total Cuentas</span>
            <span className="text-xl font-black text-slate-800">{stats.total}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-600 font-medium block">Cuentas Imputables (Detalle)</span>
            <span className="text-xl font-black text-blue-700">{stats.imputables}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-700 font-medium block">Cuentas de Grupo (Títulos)</span>
            <span className="text-xl font-black text-amber-800">{stats.titulos}</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <span className="text-xs text-purple-700 font-medium block">Niveles de Jerarquía</span>
            <span className="text-xl font-black text-purple-800">5 Niveles</span>
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS Y BÚSQUEDA (No Imprimible) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Campo Búsqueda */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
              Buscar por Código o Nombre
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: 1.1.01 o Banco..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Clasificación */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
              Clasificación Contable
            </label>
            <select
              value={filtroClasificacion}
              onChange={(e) => setFiltroClasificacion(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">-- Todas las Clasificaciones --</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="PASIVO">PASIVO</option>
              <option value="PATRIMONIO">PATRIMONIO</option>
              <option value="INGRESOS">INGRESOS</option>
              <option value="COSTOS">COSTOS</option>
              <option value="GASTOS">GASTOS</option>
            </select>
          </div>

          {/* Filtro Tipo de Cuenta */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
              Tipo de Cuenta
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">-- Todos los Tipos --</option>
              <option value="IMPUTABLE">IMPUTABLE (Acepta Asientos)</option>
              <option value="TITULO">TÍTULO / GRUPO (Acumulativa)</option>
            </select>
          </div>

          {/* Filtro Nivel */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
              Nivel de Jerarquía
            </label>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">-- Todos los Niveles --</option>
              <option value="1">Nivel 1 (Rubro General)</option>
              <option value="2">Nivel 2 (Sub-rubro)</option>
              <option value="3">Nivel 3 (Cuenta Mayor)</option>
              <option value="4">Nivel 4 (Sub-cuenta)</option>
              <option value="5">Nivel 5 (Auxiliar / Detalle)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE CUENTAS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Código Contable</th>
                <th className="py-3.5 px-4">Nombre de la Cuenta</th>
                <th className="py-3.5 px-4 text-center">Nivel</th>
                <th className="py-3.5 px-4">Clasificación</th>
                <th className="py-3.5 px-4">Naturaleza</th>
                <th className="py-3.5 px-4 text-center">Tipo</th>
                <th className="py-3.5 px-4 text-right">Saldo Actual (Bs.)</th>
                <th className="py-3.5 px-4 text-center no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cuentasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron cuentas contables que coincidan con los filtros de búsqueda.
                  </td>
                </tr>
              ) : (
                cuentasFiltradas.map((cuenta) => {
                  const esTitulo = cuenta.tipo === "TITULO";
                  const indentacion = (cuenta.nivel - 1) * 20; // Sangría según nivel

                  return (
                    <tr
                      key={cuenta.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        esTitulo ? "bg-slate-50/70 font-bold text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {/* Código */}
                      <td className="py-2.5 px-4 font-mono font-medium whitespace-nowrap">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs ${
                            cuenta.nivel === 1
                              ? "bg-slate-800 text-white font-bold"
                              : cuenta.nivel === 2
                              ? "bg-slate-200 text-slate-800 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {cuenta.codigo}
                        </span>
                      </td>

                      {/* Nombre con sangría de árbol */}
                      <td className="py-2.5 px-4">
                        <div
                          style={{ paddingLeft: `${indentacion}px` }}
                          className="flex items-center gap-2"
                        >
                          {esTitulo && (
                            <button
                              onClick={() => toggleColapso(cuenta.id)}
                              className="text-slate-400 hover:text-slate-700 text-xs font-bold no-print"
                              title="Colapsar / Expandir"
                            >
                              {nodosColapsados[cuenta.id] ? "▶" : "▼"}
                            </button>
                          )}
                          <span className={esTitulo ? "uppercase text-slate-900 font-extrabold" : ""}>
                            {cuenta.nombre}
                          </span>
                        </div>
                      </td>

                      {/* Nivel */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          N{cuenta.nivel}
                        </span>
                      </td>

                      {/* Clasificación */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                            cuenta.clasificacion === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800"
                              : cuenta.clasificacion === "PASIVO"
                              ? "bg-amber-100 text-amber-800"
                              : cuenta.clasificacion === "PATRIMONIO"
                              ? "bg-purple-100 text-purple-800"
                              : cuenta.clasificacion === "INGRESOS"
                              ? "bg-blue-100 text-blue-800"
                              : cuenta.clasificacion === "COSTOS"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {cuenta.clasificacion}
                        </span>
                      </td>

                      {/* Naturaleza */}
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-600">
                        {cuenta.naturaleza}
                      </td>

                      {/* Tipo */}
                      <td className="py-2.5 px-4 text-center">
                        {esTitulo ? (
                          <span className="bg-slate-200 text-slate-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                            Título / Grupo
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                            Imputable
                          </span>
                        )}
                      </td>

                      {/* Saldo Actual */}
                      <td className="py-2.5 px-4 text-right font-mono font-medium">
                        {cuenta.saldo !== undefined
                          ? `Bs. ${cuenta.saldo.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                          : "-"}
                      </td>

                      {/* Acciones (No imprimible) */}
                      <td className="py-2.5 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          {esTitulo && cuenta.nivel < 5 && (
                            <button
                              onClick={() => abrirModalCrearSubcuenta(cuenta)}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded transition"
                              title="Añadir Sub-cuenta"
                            >
                              + Subcuenta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR NUEVA CUENTA (No Imprimible) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-base">Crear Nueva Cuenta Contable</h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarNuevaCuenta} className="p-6 space-y-4">
              {/* Código */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Código Contable *
                </label>
                <input
                  type="text"
                  required
                  value={nuevaCuenta.codigo}
                  onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, codigo: e.target.value })}
                  placeholder="Ej: 1.1.01.02.004"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Nombre de la Cuenta *
                </label>
                <input
                  type="text"
                  required
                  value={nuevaCuenta.nombre}
                  onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, nombre: e.target.value })}
                  placeholder="Ej: Banco Mercantil C.A."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Clasificación */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Clasificación *
                  </label>
                  <select
                    value={nuevaCuenta.clasificacion}
                    onChange={(e) =>
                      setNuevaCuenta({
                        ...nuevaCuenta,
                        clasificacion: e.target.value as CuentaContable["clasificacion"]
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="PASIVO">PASIVO</option>
                    <option value="PATRIMONIO">PATRIMONIO</option>
                    <option value="INGRESOS">INGRESOS</option>
                    <option value="COSTOS">COSTOS</option>
                    <option value="GASTOS">GASTOS</option>
                  </select>
                </div>

                {/* Naturaleza */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Naturaleza *
                  </label>
                  <select
                    value={nuevaCuenta.naturaleza}
                    onChange={(e) =>
                      setNuevaCuenta({
                        ...nuevaCuenta,
                        naturaleza: e.target.value as CuentaContable["naturaleza"]
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DEUDORA">DEUDORA</option>
                    <option value="ACREEDORA">ACREEDORA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de Cuenta */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Tipo de Cuenta *
                  </label>
                  <select
                    value={nuevaCuenta.tipo}
                    onChange={(e) =>
                      setNuevaCuenta({
                        ...nuevaCuenta,
                        tipo: e.target.value as CuentaContable["tipo"]
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IMPUTABLE">IMPUTABLE (Detalle)</option>
                    <option value="TITULO">TÍTULO / GRUPO</option>
                  </select>
                </div>

                {/* Nivel */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Nivel *
                  </label>
                  <select
                    value={nuevaCuenta.nivel}
                    onChange={(e) =>
                      setNuevaCuenta({ ...nuevaCuenta, nivel: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Nivel 1</option>
                    <option value={2}>Nivel 2</option>
                    <option value={3}>Nivel 3</option>
                    <option value={4}>Nivel 4</option>
                    <option value={5}>Nivel 5</option>
                  </select>
                </div>
              </div>

              {/* Pie de modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}