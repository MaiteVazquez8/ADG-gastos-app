import type { Expense, Income } from '@/types';

/**
 * Datos de demostración de ADG — noviembre de 2026.
 *
 * Están organizados y centralizados acá (no dispersos por las pantallas) para
 * que puedan reemplazarse por una integración real sin rehacer las vistas.
 * Se cargan una sola vez, al abrir la app por primera vez con los stores
 * vacíos (ver store/demoSeed.ts). Números coherentes con el mock:
 *
 *   Noviembre 2026: ingresos $1.250.000 (Sueldo $1.100.000 + Freelance $150.000),
 *     gastos $680.000 en 12 movimientos, 14 movimientos en total.
 *   Octubre 2026:   ingresos $1.120.000, gastos $740.000, 28 movimientos.
 *   Septiembre 2026: ingresos $1.100.000, gastos $690.000, 25 movimientos.
 *
 * Total gastos últimos 3 meses: $2.110.000.
 */

/** Etiqueta neutra del perfil (sin identidad inventada). */
export const PROFILE_LABEL = 'Perfil personal';
export const PROFILE_CURRENCY_NOTE = 'Moneda principal · Peso argentino';

export const DEMO_DEVELOPER_NOTE = 'ADG · Administración Digital de Gastos';

type Row = [id: string, date: string, amount: number, category: string, note: string, paymentMethod: string, time: string];

function d(id: string, date: string, amount: number, category: string, note: string, paymentMethod: string, time: string): Row {
  return [id, date, amount, category, note, paymentMethod, time];
}

const EXPENSE_ROWS: readonly Row[] = [
  // Noviembre 2026 — 12 movimientos, $680.000
  d('demo-exp-nov-001', '2026-11-10', 42500, 'food', 'Supermercado', 'tarjeta-debito', '12:35'),
  d('demo-exp-nov-002', '2026-11-10', 1500, 'transport', 'Colectivo', 'efectivo', '08:15'),
  d('demo-exp-nov-003', '2026-11-09', 34000, 'food', 'Panadería', 'efectivo', '09:10'),
  d('demo-exp-nov-004', '2026-11-08', 38500, 'food', 'Verdulería', 'tarjeta-debito', '11:30'),
  d('demo-exp-nov-005', '2026-11-07', 80000, 'entertainment', 'Cine con amigos', 'tarjeta-credito', '21:00'),
  d('demo-exp-nov-006', '2026-11-06', 45000, 'food', 'Carnicería', 'efectivo', '12:40'),
  d('demo-exp-nov-007', '2026-11-05', 220000, 'hogar', 'Alquiler', 'transferencia', '07:30'),
  d('demo-exp-nov-008', '2026-11-04', 52000, 'food', 'Almacén de barrio', 'tarjeta-debito', '19:15'),
  d('demo-exp-nov-009', '2026-11-03', 52000, 'transport', 'Uber', 'tarjeta-credito', '23:00'),
  d('demo-exp-nov-010', '2026-11-02', 28000, 'food', 'Minimercado', 'efectivo', '13:00'),
  d('demo-exp-nov-011', '2026-11-01', 36500, 'transport', 'Nafta', 'tarjeta-credito', '08:30'),
  d('demo-exp-nov-012', '2026-11-01', 50000, 'other', 'Regalo de cumpleaños', 'efectivo', '18:00'),
  // Septiembre 2026 — 24 movimientos, $690.000
  d('demo-exp-sep-001', '2026-09-05', 220000, 'hogar', 'Alquiler', 'transferencia', '07:30'),
  d('demo-exp-sep-002', '2026-09-08', 38000, 'food', 'Supermercado', 'tarjeta-debito', '11:20'),
  d('demo-exp-sep-003', '2026-09-06', 27500, 'food', 'Panadería', 'efectivo', '09:10'),
  d('demo-exp-sep-004', '2026-09-04', 35500, 'food', 'Carnicería', 'efectivo', '12:40'),
  d('demo-exp-sep-005', '2026-09-03', 24200, 'food', 'Verdulería', 'tarjeta-debito', '10:30'),
  d('demo-exp-sep-006', '2026-09-02', 42000, 'food', 'Almacén de barrio', 'tarjeta-debito', '19:15'),
  d('demo-exp-sep-007', '2026-09-09', 1500, 'transport', 'Colectivo', 'efectivo', '08:05'),
  d('demo-exp-sep-008', '2026-09-03', 37600, 'transport', 'Nafta', 'tarjeta-credito', '10:00'),
  d('demo-exp-sep-009', '2026-09-10', 38000, 'bills', 'Internet y telefonía', 'debito-automatico', '09:00'),
  d('demo-exp-sep-010', '2026-09-10', 21800, 'bills', 'Expensas', 'debito-automatico', '09:05'),
  d('demo-exp-sep-011', '2026-09-08', 15000, 'bills', 'Electricidad', 'debito-automatico', '09:10'),
  d('demo-exp-sep-012', '2026-09-06', 38000, 'entertainment', 'Cena con amigos', 'tarjeta-credito', '21:30'),
  d('demo-exp-sep-013', '2026-09-02', 21500, 'health', 'Farmacia', 'tarjeta-debito', '17:45'),
  d('demo-exp-sep-014', '2026-09-07', 19500, 'other', 'Regalo', 'efectivo', '18:30'),
  d('demo-exp-sep-015', '2026-09-09', 17600, 'food', 'Mercado', 'efectivo', '12:10'),
  d('demo-exp-sep-016', '2026-09-05', 13800, 'food', 'Verdulería', 'efectivo', '10:45'),
  d('demo-exp-sep-017', '2026-09-08', 10500, 'transport', 'Taxi', 'tarjeta-debito', '23:10'),
  d('demo-exp-sep-018', '2026-09-01', 12500, 'bills', 'Agua', 'debito-automatico', '09:20'),
  d('demo-exp-sep-019', '2026-09-10', 12700, 'entertainment', 'Streaming', 'tarjeta-credito', '20:00'),
  d('demo-exp-sep-020', '2026-09-05', 12100, 'health', 'Farmacia', 'efectivo', '16:20'),
  d('demo-exp-sep-021', '2026-09-09', 10100, 'other', 'Varios', 'efectivo', '11:05'),
  d('demo-exp-sep-022', '2026-09-04', 3800, 'transport', 'Colectivo', 'efectivo', '08:11'),
  d('demo-exp-sep-023', '2026-09-02', 7800, 'food', 'Kiosco', 'efectivo', '08:15'),
  d('demo-exp-sep-024', '2026-09-01', 9000, 'food', 'Minimercado', 'efectivo', '13:00'),
  // Octubre 2026 — 26 movimientos, $740.000
  d('demo-exp-oct-001', '2026-10-05', 220000, 'hogar', 'Alquiler', 'transferencia', '07:30'),
  d('demo-exp-oct-002', '2026-10-08', 38000, 'food', 'Supermercado', 'tarjeta-debito', '11:20'),
  d('demo-exp-oct-003', '2026-10-07', 28500, 'food', 'Panadería', 'efectivo', '09:10'),
  d('demo-exp-oct-004', '2026-10-06', 35200, 'food', 'Carnicería', 'efectivo', '12:40'),
  d('demo-exp-oct-005', '2026-10-04', 26800, 'food', 'Verdulería', 'tarjeta-debito', '10:30'),
  d('demo-exp-oct-006', '2026-10-02', 41000, 'food', 'Almacén de barrio', 'tarjeta-debito', '19:15'),
  d('demo-exp-oct-007', '2026-10-09', 1500, 'transport', 'Colectivo', 'efectivo', '08:05'),
  d('demo-exp-oct-008', '2026-10-03', 26300, 'transport', 'Nafta', 'tarjeta-credito', '10:00'),
  d('demo-exp-oct-009', '2026-10-10', 38500, 'bills', 'Internet y telefonía', 'debito-automatico', '09:00'),
  d('demo-exp-oct-010', '2026-10-10', 22500, 'bills', 'Expensas', 'debito-automatico', '09:05'),
  d('demo-exp-oct-011', '2026-10-08', 15800, 'bills', 'Electricidad', 'debito-automatico', '09:10'),
  d('demo-exp-oct-012', '2026-10-04', 42500, 'entertainment', 'Cine con amigos', 'tarjeta-credito', '21:30'),
  d('demo-exp-oct-013', '2026-10-02', 24500, 'health', 'Farmacia', 'tarjeta-debito', '17:45'),
  d('demo-exp-oct-014', '2026-10-08', 18000, 'other', 'Regalo de cumpleaños', 'efectivo', '18:30'),
  d('demo-exp-oct-015', '2026-10-09', 19200, 'food', 'Mercado', 'efectivo', '12:10'),
  d('demo-exp-oct-016', '2026-10-06', 15400, 'food', 'Verdulería', 'efectivo', '10:45'),
  d('demo-exp-oct-017', '2026-10-07', 11500, 'transport', 'Taxi', 'tarjeta-debito', '23:10'),
  d('demo-exp-oct-018', '2026-10-01', 13100, 'bills', 'Agua', 'debito-automatico', '09:20'),
  d('demo-exp-oct-019', '2026-10-09', 13200, 'entertainment', 'Streaming', 'tarjeta-credito', '20:00'),
  d('demo-exp-oct-020', '2026-10-06', 10800, 'health', 'Farmacia', 'efectivo', '16:20'),
  d('demo-exp-oct-021', '2026-10-04', 21000, 'other', 'Imprevistos', 'efectivo', '14:00'),
  d('demo-exp-oct-022', '2026-10-02', 22600, 'shopping', 'Ropa de trabajo', 'tarjeta-credito', '15:30'),
  d('demo-exp-oct-023', '2026-10-07', 8800, 'other', 'Varios', 'efectivo', '11:05'),
  d('demo-exp-oct-024', '2026-10-09', 9500, 'bills', 'Gas', 'debito-automatico', '09:15'),
  d('demo-exp-oct-025', '2026-10-05', 6000, 'transport', 'Colectivo', 'efectivo', '08:11'),
  d('demo-exp-oct-026', '2026-10-01', 9800, 'food', 'Minimercado', 'efectivo', '13:00'),
];

export function buildDemoExpenses(): Expense[] {
  return EXPENSE_ROWS.map(([id, date, amount, category, note, paymentMethod, time]) => ({
    id,
    date,
    amount,
    category,
    note,
    paymentMethod,
    createdAt: `${date}T${time}:00.000Z`,
  }));
}

type IncomeRow = [id: string, date: string, amount: number, source: string, note: string, paymentMethod: string, time: string];

function i(id: string, date: string, amount: number, source: string, note: string, paymentMethod: string, time: string): IncomeRow {
  return [id, date, amount, source, note, paymentMethod, time];
}

const INCOME_ROWS: readonly IncomeRow[] = [
  // Noviembre 2026 — 2 ingresos, $1.250.000
  i('demo-inc-nov-001', '2026-11-01', 1_100_000, 'sueldo', 'Sueldo', 'transferencia', '09:00'),
  i('demo-inc-nov-002', '2026-11-03', 150_000, 'freelance', 'Proyecto freelance', 'transferencia', '18:45'),
  // Octubre 2026 — 2 ingresos, $1.120.000
  i('demo-inc-oct-001', '2026-10-01', 1_020_000, 'sueldo', 'Sueldo', 'transferencia', '09:00'),
  i('demo-inc-oct-002', '2026-10-03', 100_000, 'freelance', 'Proyecto freelance', 'transferencia', '18:00'),
  // Septiembre 2026 — 1 ingreso, $1.100.000
  i('demo-inc-sep-001', '2026-09-01', 1_100_000, 'sueldo', 'Sueldo', 'transferencia', '09:00'),
];

export function buildDemoIncomes(): Income[] {
  return INCOME_ROWS.map(([id, date, amount, source, note, paymentMethod, time]) => ({
    id,
    date,
    amount,
    source,
    note,
    paymentMethod,
    createdAt: `${date}T${time}:00.000Z`,
  }));
}
