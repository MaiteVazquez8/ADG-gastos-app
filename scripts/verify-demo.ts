import AsyncStorageMock, { __reset } from './async-storage-mock.mjs';
import { useExpenseStore } from '../store/useExpenseStore.ts';
import { useFinanceStore } from '../store/useFinanceStore.ts';
import { useSettingsStore } from '../store/useSettingsStore.ts';
import { useMonthStore } from '../store/useMonthStore.ts';
import { seedDemoDataIfNeeded } from '../store/demoSeed.ts';
import { resolveMonthLimits, totalMonthLimit } from '../store/useBudgetStore.ts';
import { buildMovements, filterMovements, movementsInMonth } from '../utils/movements.ts';
import { sumByMonth, totalsByCategory } from '../utils/aggregation.ts';
import { totalIncomeForMonth } from '../utils/budget.ts';

await Promise.all([
  useExpenseStore.persist.rehydrate(),
  useFinanceStore.persist.rehydrate(),
  useSettingsStore.persist.rehydrate(),
  useMonthStore.persist.rehydrate(),
]);

function assert(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '  ok' : 'FAIL'}  ${label}${ok ? '' : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
  if (!ok) process.exitCode = 1;
}

// 1) Seeding from scratch injects the demo dataset.
assert('starts empty', [useExpenseStore.getState().expenses.length, useFinanceStore.getState().incomes.length], [0, 0]);
seedDemoDataIfNeeded();
seedDemoDataIfNeeded(); // idempotent
const expenses = useExpenseStore.getState().expenses;
const incomes = useFinanceStore.getState().incomes;
assert('demo expenses count', expenses.length, 62); // 12 nov + 24 sep + 26 oct
assert('demo incomes count', incomes.length, 5);
assert('nov expenses exact', sumByMonth(expenses, '2026-11'), 680000);
assert('oct expenses exact', sumByMonth(expenses, '2026-10'), 740000);
assert('sep expenses exact', sumByMonth(expenses, '2026-09'), 690000);
assert('3-month total', sumByMonth(expenses, '2026-11') + sumByMonth(expenses, '2026-10') + sumByMonth(expenses, '2026-09'), 2110000);
assert('nov income', totalIncomeForMonth(incomes, '2026-11'), 1250000);
assert('oct income', totalIncomeForMonth(incomes, '2026-10'), 1120000);
assert('sep income', totalIncomeForMonth(incomes, '2026-09'), 1100000);
assert('nov movement count (gastos+ingresos)', movementsInMonth(buildMovements(expenses, incomes, useFinanceStore.getState().categories), '2026-11').length, 14);
assert('oct movement count', movementsInMonth(buildMovements(expenses, incomes, useFinanceStore.getState().categories), '2026-10').length, 28);
assert('sep movement count', movementsInMonth(buildMovements(expenses, incomes, useFinanceStore.getState().categories), '2026-09').length, 25);

// 2) Demo budget numbers (static defaults): Alimentación 80%, total 1.000.000, 68%.
const limits = resolveMonthLimits({}, '2026-11');
assert('budget total', totalMonthLimit(limits), 1000000);
const foodSpent = expenses.filter((e) => e.date.startsWith('2026-11') && e.category === 'food').reduce((s, e) => s + e.amount, 0);
assert('alimentación spent', foodSpent, 240000);
assert('alimentación pct', Math.round((foodSpent / limits.food.amount) * 100), 80);
const hogarSpent = expenses.filter((e) => e.date.startsWith('2026-11') && e.category === 'hogar').reduce((s, e) => s + e.amount, 0);
assert('hogar spent', hogarSpent, 220000);
assert('hogar pct', Math.round((hogarSpent / limits.hogar.amount) * 100), 63);
const transportSpent = expenses.filter((e) => e.date.startsWith('2026-11') && e.category === 'transport').reduce((s, e) => s + e.amount, 0);
assert('transporte spent', transportSpent, 90000);
assert('transporte pct', Math.round((transportSpent / limits.transport.amount) * 100), 75);
const ocioSpent = expenses.filter((e) => e.date.startsWith('2026-11') && e.category === 'entertainment').reduce((s, e) => s + e.amount, 0);
assert('ocio spent', ocioSpent, 80000);
assert('ocio pct', Math.round((ocioSpent / limits.entertainment.amount) * 100), 62);
const otrosSpent = expenses.filter((e) => e.date.startsWith('2026-11') && e.category === 'other').reduce((s, e) => s + e.amount, 0);
assert('otros spent', otrosSpent, 50000);
assert('otros pct', Math.round((otrosSpent / limits.other.amount) * 100), 50);
assert('total spent pct', Math.round((680000 / 1000000) * 100), 68);

// 3) Donut shares (mock: 35,3 / 32,4 / 13,2 / 11,8 / 7,3)
const monthExpenses = expenses.filter((e) => e.date.startsWith('2026-11'));
const knownIds = useFinanceStore.getState().categories.map((c) => c.id);
const byCat = totalsByCategory(monthExpenses, knownIds);
const share = (id: string) => byCat.find((c) => c.category === id)?.percentage.toFixed(1);
assert('alimentación share', share('food'), '35.3');
assert('hogar share', share('hogar'), '32.4');
assert('transporte share', share('transport'), '13.2');
assert('ocio share', share('entertainment'), '11.8');
assert('otros share', share('other'), '7.3'); // mock: 7,3%

// 4) Comparison deltas (mock: Gastaste $60.000 menos, −8,1%)
const octSpent = sumByMonth(expenses, '2026-10');
const novSpent = sumByMonth(expenses, '2026-11');
assert('spend delta', octSpent - novSpent, 60000);
assert('spend delta pct', Math.round(((octSpent - novSpent) / octSpent) * 1000) / 10, 8.1);

// 5) Movements filter/chips summary behavior
const all = buildMovements(expenses, incomes, useFinanceStore.getState().categories);
const gastos = filterMovements(all, '2026-11', { tipo: 'gastos', period: 'mes', categoryId: null, paymentMethod: null, sort: 'recientes' });
assert('gastos chip count', gastos.length, 12);
const ingresos = filterMovements(all, '2026-11', { tipo: 'ingresos', period: 'mes', categoryId: null, paymentMethod: null, sort: 'recientes' });
assert('ingresos chip count', ingresos.length, 2);

// 6) Newest movements for Inicio (Supermercado 10 nov)
assert('newest movement is Supermercado', all[0].title, 'Supermercado');

console.log(process.exitCode ? '\nVERIFICATION FAILURES' : '\nDEMO DATA VERIFIED — mock coherence exact');
