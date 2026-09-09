/**
 * Store/state integration checks. Runs the REAL zustand stores (persisted to
 * an in-memory AsyncStorage shim) and asserts the full financial flow:
 * incomes -> distribution -> budgets -> expenses -> remaining, month
 * independence, persistence/reload and v1->v2 migration.
 *
 * Run with: npm run test:stores
 */
import AsyncStorageMock, { __dump, __reset } from './async-storage-mock.mjs';
import { useExpenseStore, STORAGE_KEY } from '../store/useExpenseStore.ts';
import { useFinanceStore, FINANCE_STORAGE_KEY } from '../store/useFinanceStore.ts';
import type { CategoryDistribution, Expense, Income } from '../types/index.ts';
import {
  buildBudgetRows,
  computeMonthSummary,
  distributionIsComplete,
  distributionSum,
  resolveMonthDistribution,
  totalIncomeForMonth,
} from '../utils/budget.ts';
import { filterByMonth, sumByMonth } from '../utils/aggregation.ts';
import { resolveCategory, UNCATEGORIZED } from '../utils/categories.ts';
import type { BudgetCategoryRow } from '../utils/budget.ts';
import { MAX_AMOUNT } from '../utils/currency.ts';

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ok  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}\n      expected ${e}\n      actual   ${a}`);
  }
}

/** Ensures persistence has loaded before any mutation/assertion. */
await Promise.all([useFinanceStore.persist.rehydrate(), useExpenseStore.persist.rehydrate()]);

const FIN = () => useFinanceStore.getState();
const EXP = () => useExpenseStore.getState();

const seedCategories = FIN().categories.map((c) => ({ ...c }));
const seedDistribution = FIN().defaultDistribution.map((d) => ({ ...d }));

function resetStores() {
  useFinanceStore.setState({
    categories: seedCategories.map((c) => ({ ...c })),
    incomes: [],
    distributionsByMonth: {},
    defaultDistribution: seedDistribution.map((d) => ({ ...d })),
  });
  useExpenseStore.setState({ expenses: [] });
}

function rowOf(rows: BudgetCategoryRow[], id: string): BudgetCategoryRow {
  const row = rows.find((r) => r.categoryId === id);
  if (!row) {
    throw new Error(`row not found: ${id}`);
  }
  return row;
}

const JAN_DIST: CategoryDistribution[] = [
  { categoryId: 'ahorro', percentage: 10 },
  { categoryId: 'bills', percentage: 40 },
  { categoryId: 'food', percentage: 20 },
  { categoryId: 'transport', percentage: 10 },
  { categoryId: 'entertainment', percentage: 10 },
  { categoryId: 'other', percentage: 10 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
];

function builds(monthKey: string) {
  const state = FIN();
  const active = resolveMonthDistribution(
    state.distributionsByMonth,
    state.defaultDistribution,
    monthKey,
  );
  const incomeTotal = totalIncomeForMonth(state.incomes, monthKey);
  const monthExpenses = filterByMonth(EXP().expenses, monthKey);
  return {
    active,
    incomeTotal,
    monthExpenses,
    rows: buildBudgetRows(state.categories, active, incomeTotal, monthExpenses),
    summary: computeMonthSummary(state.categories, active, state.incomes, monthExpenses, monthKey),
  };
}

// ---------- A/B: múltiples ingresos + distribución 100% ----------
resetStores();
const inc1 = useFinanceStore.getState().addIncome({
  amount: 1500000,
  source: 'sueldo',
  date: '2026-01-10',
});
const inc2 = useFinanceStore.getState().addIncome({
  amount: 200000,
  source: 'freelance',
  date: '2026-01-15',
});
check('addIncome returns stored income', FIN().incomes.some((i) => i.id === inc1.id), true);
check('two incomes in same month', FIN().incomes.length, 2);
check('total january', totalIncomeForMonth(FIN().incomes, '2026-01'), 1700000);
check('february not affected', totalIncomeForMonth(FIN().incomes, '2026-02'), 0);
useFinanceStore.getState().setMonthDistributions('2026-01', JAN_DIST);
check('distribution sums to 100', distributionSum(FIN().distributionsByMonth['2026-01']), 100);
check('distribution complete', distributionIsComplete(FIN().distributionsByMonth['2026-01']), true);
{
  const b = builds('2026-01');
  check('budget ahorro', rowOf(b.rows, 'ahorro').budget, 170000);
  check('budget bills', rowOf(b.rows, 'bills').budget, 680000);
  check('budget food', rowOf(b.rows, 'food').budget, 340000);
  check('budget transport', rowOf(b.rows, 'transport').budget, 170000);
  check('budget ocio', rowOf(b.rows, 'entertainment').budget, 170000);
  check('budget otros', rowOf(b.rows, 'other').budget, 170000);
  check('budget shopping 0%', rowOf(b.rows, 'shopping').budget, 0);
  check('summary distributionValid', b.summary.distributionValid, true);
}

// ---------- montos inválidos / negativos en el store ----------
resetStores();
const badIncomeAdds = [
  { amount: -5, source: 'sueldo', date: '2026-01-10' },
  { amount: NaN, source: 'sueldo', date: '2026-01-10' },
  { amount: 0, source: 'sueldo', date: '2026-01-10' },
  { amount: MAX_AMOUNT + 0.01, source: 'sueldo', date: '2026-01-10' },
];
for (const bad of badIncomeAdds) {
  useFinanceStore.getState().addIncome(bad);
}
check('invalid incomes rejected', FIN().incomes.length, 0);
const okIncome = useFinanceStore.getState().addIncome({
  amount: 1000,
  source: 'sueldo',
  date: '2026-01-10',
});
check('valid income accepted', FIN().incomes.length, 1);
useFinanceStore.getState().updateIncome(okIncome.id, {
  amount: NaN,
  source: 'sueldo',
  date: '2026-01-10',
});
check('update keeps amount on invalid', FIN().incomes[0].amount, 1000);

const badExpenseAdds = [
  { amount: -1, category: 'food', date: '2026-01-10' },
  { amount: NaN, category: 'food', date: '2026-01-10' },
  { amount: 0, category: 'food', date: '2026-01-10' },
  { amount: MAX_AMOUNT + 0.01, category: 'food', date: '2026-01-10' },
];
for (const bad of badExpenseAdds) {
  useExpenseStore.getState().addExpense(bad);
}
check('invalid expenses rejected', EXP().expenses.length, 0);
const okExpense = useExpenseStore.getState().addExpense({
  amount: 500,
  category: 'food',
  date: '2026-01-10',
});
check('valid expense accepted', EXP().expenses.length, 1);
useExpenseStore.getState().updateExpense(okExpense.id, {
  amount: -3,
  category: 'food',
  date: '2026-01-10',
});
check('update keeps expense amount', EXP().expenses[0].amount, 500);

// ---------- C/D: gastos en una categoría ----------
resetStores();
useFinanceStore.getState().addIncome({ amount: 1700000, source: 'sueldo', date: '2026-01-05' });
useFinanceStore.getState().setMonthDistributions('2026-01', JAN_DIST);
for (const amount of [25000, 40000, 15000]) {
  useExpenseStore.getState().addExpense({ amount, category: 'food', date: '2026-01-10' });
}
{
  const b = builds('2026-01');
  check('food spent', rowOf(b.rows, 'food').spent, 80000);
  check('food available', rowOf(b.rows, 'food').available, 260000);
  check('food count', rowOf(b.rows, 'food').count, 3);
  check('food status ok', rowOf(b.rows, 'food').status, 'ok');
}

// ---------- E: sobregasto (disponible negativo conservado) ----------
useExpenseStore.getState().addExpense({ amount: 300000, category: 'food', date: '2026-01-15' });
{
  const b = builds('2026-01');
  check('food spent overspend', rowOf(b.rows, 'food').spent, 380000);
  check('food available negative', rowOf(b.rows, 'food').available, -40000);
  check('food status exceeded', rowOf(b.rows, 'food').status, 'exceeded');
  check('food progress above 100', rowOf(b.rows, 'food').progress, 111.76);
  check('summary spentTotal', b.summary.spentTotal, 380000);
  check('summary available', b.summary.available, 1320000);
}

// ---------- F: cambio de porcentaje después de gastos ----------
resetStores();
useFinanceStore.getState().addIncome({ amount: 1000000, source: 'sueldo', date: '2026-01-05' });
useFinanceStore.getState().setMonthDistributions('2026-01', [
  { categoryId: 'ahorro', percentage: 20 },
  { categoryId: 'bills', percentage: 20 },
  { categoryId: 'food', percentage: 20 },
  { categoryId: 'transport', percentage: 10 },
  { categoryId: 'entertainment', percentage: 10 },
  { categoryId: 'other', percentage: 20 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
]);
for (const amount of [25000, 40000, 15000]) {
  useExpenseStore.getState().addExpense({ amount, category: 'food', date: '2026-01-10' });
}
const foodEs = EXP().expenses.length;
{
  const b = builds('2026-01');
  check('F initial food budget', rowOf(b.rows, 'food').budget, 200000);
}
useFinanceStore.getState().setMonthDistributions('2026-01', [
  { categoryId: 'ahorro', percentage: 15 },
  { categoryId: 'bills', percentage: 20 },
  { categoryId: 'food', percentage: 30 },
  { categoryId: 'transport', percentage: 10 },
  { categoryId: 'entertainment', percentage: 10 },
  { categoryId: 'other', percentage: 15 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
]);
{
  const b = builds('2026-01');
  check('F food budget 30%', rowOf(b.rows, 'food').budget, 300000);
  check('F historical spent kept', rowOf(b.rows, 'food').spent, 80000);
  check('F available', rowOf(b.rows, 'food').available, 220000);
  check('F expenses untouched', EXP().expenses.length, foodEs);
}

// ---------- G: cambio de ingreso después de gastos ----------
useFinanceStore.getState().addIncome({ amount: 500000, source: 'bonificacion', date: '2026-01-20' });
{
  const b = builds('2026-01');
  check('G new income total', b.incomeTotal, 1500000);
  check('G food budget', rowOf(b.rows, 'food').budget, 450000);
  check('G spent kept', rowOf(b.rows, 'food').spent, 80000);
  check('G available', rowOf(b.rows, 'food').available, 370000);
  check('G expenses untouched', EXP().expenses.length, foodEs);
}

// ---------- H: meses independientes ----------
resetStores();
useFinanceStore.getState().addIncome({ amount: 1000000, source: 'sueldo', date: '2026-01-05' });
useFinanceStore.getState().addIncome({ amount: 2000000, source: 'sueldo', date: '2026-02-05' });
useFinanceStore.getState().setMonthDistributions('2026-01', [
  { categoryId: 'ahorro', percentage: 10 },
  { categoryId: 'bills', percentage: 25 },
  { categoryId: 'food', percentage: 30 },
  { categoryId: 'transport', percentage: 10 },
  { categoryId: 'entertainment', percentage: 10 },
  { categoryId: 'other', percentage: 15 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
]);
useExpenseStore.getState().addExpense({ amount: 100000, category: 'food', date: '2026-01-15' });
useExpenseStore.getState().addExpense({ amount: 500000, category: 'food', date: '2026-02-10' });
check('H january total', totalIncomeForMonth(FIN().incomes, '2026-01'), 1000000);
check('H february total', totalIncomeForMonth(FIN().incomes, '2026-02'), 2000000);
check('H january expenses', filterByMonth(EXP().expenses, '2026-01').length, 1);
check('H february expenses', filterByMonth(EXP().expenses, '2026-02').length, 1);
check('H january spent', sumByMonth(EXP().expenses, '2026-01'), 100000);
check('H february spent', sumByMonth(EXP().expenses, '2026-02'), 500000);
{
  const jan = builds('2026-01');
  const feb = builds('2026-02');
  check('H jan custom food 30%', rowOf(jan.rows, 'food').percentage, 30);
  check('H jan budget food', rowOf(jan.rows, 'food').budget, 300000);
  check('H jan summary spent', jan.summary.spentTotal, 100000);
  check('H jan available', jan.summary.available, 900000);
  check('H feb defaults food 20%', rowOf(feb.rows, 'food').percentage, 20);
  check('H feb budget food', rowOf(feb.rows, 'food').budget, 400000);
  check('H feb spentTotal', feb.summary.spentTotal, 500000);
}

// ---------- I: categoría con 0% ----------
resetStores();
useFinanceStore.getState().addIncome({ amount: 1000000, source: 'sueldo', date: '2026-01-05' });
useFinanceStore.getState().setMonthDistributions('2026-01', [
  { categoryId: 'ahorro', percentage: 0 },
  { categoryId: 'bills', percentage: 0 },
  { categoryId: 'food', percentage: 100 },
  { categoryId: 'transport', percentage: 0 },
  { categoryId: 'entertainment', percentage: 0 },
  { categoryId: 'other', percentage: 0 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
]);
{
  const b = builds('2026-01');
  check('I food 100%', rowOf(b.rows, 'food').budget, 1000000);
  check('I shopping 0% budget', rowOf(b.rows, 'shopping').budget, 0);
  check('I shopping available 0', rowOf(b.rows, 'shopping').available, 0);
  check('I single category 100% complete', distributionIsComplete(b.active), true);
  const visible = b.rows.filter((r) => r.percentage > 0 || r.spent > 0);
  check('I zero rows hidden', visible.length, 1);
}

// ---------- J: distribución inválida ----------
resetStores();
useFinanceStore.getState().addIncome({ amount: 1000000, source: 'sueldo', date: '2026-01-05' });
useFinanceStore.getState().setMonthDistributions('2026-01', [
  { categoryId: 'ahorro', percentage: 30 },
  { categoryId: 'bills', percentage: 40 },
  { categoryId: 'food', percentage: 20 },
  { categoryId: 'transport', percentage: 0 },
  { categoryId: 'entertainment', percentage: 0 },
  { categoryId: 'other', percentage: 0 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
]);
{
  const b = builds('2026-01');
  check('J sum 90', distributionSum(b.active), 90);
  check('J not complete', distributionIsComplete(b.active), false);
  check('J summary invalid', b.summary.distributionValid, false);
  check('J budgetedTotal 90%', b.summary.budgetedTotal, 900000);
}

// ---------- K: eliminar categoría con gastos ----------
resetStores();
useExpenseStore.getState().addExpense({ amount: 100, category: 'food', date: '2026-01-05' });
useExpenseStore.getState().addExpense({ amount: 200, category: 'food', date: '2026-01-06' });
useExpenseStore.getState().addExpense({ amount: 300, category: 'transport', date: '2026-01-07' });
useExpenseStore.getState().moveExpensesByCategory('food', 'other');
useFinanceStore.getState().deleteCategory('food');
{
  const cats = FIN().categories;
  check('K category removed', cats.some((c) => c.id === 'food'), false);
  check('K no expenses lost', EXP().expenses.length, 3);
  check('K expenses moved', EXP().expenses.filter((e) => e.category === 'other').length, 2);
  check('K other expenses untouched', EXP().expenses.filter((e) => e.category === 'transport').length, 1);
}

resetStores();
useExpenseStore.getState().addExpense({ amount: 500, category: 'food', date: '2026-01-05' });
useFinanceStore.getState().deleteCategory('food');
{
  const cats = FIN().categories;
  check('K2 dangling category removed', cats.some((c) => c.id === 'food'), false);
  check('K2 expense preserved', EXP().expenses.length, 1);
  check('K2 expense keeps id', EXP().expenses[0].category, 'food');
  check('K2 falls back to sin categoria', resolveCategory(FIN().categories, 'food').id, UNCATEGORIZED.id);
}

resetStores();
useExpenseStore.getState().addExpense({ amount: 50, category: 'health', date: '2026-01-05' });
useExpenseStore.getState().deleteExpense(EXP().expenses[0].id);
useFinanceStore.getState().deleteCategory('health');
check('K3 delete after expenses removed', FIN().categories.some((c) => c.id === 'health'), false);

// ---------- K4: reset de valores de ejemplo no reintroduce categorías eliminadas ----------
resetStores();
useFinanceStore.getState().deleteCategory('ahorro');
useFinanceStore.getState().resetDefaultDistribution();
check('K4 reset drops deleted id', FIN().defaultDistribution.some((d) => d.categoryId === 'ahorro'), false);
check('K4 reset keeps existing ids', FIN().defaultDistribution.some((d) => d.categoryId === 'food'), true);
check('K4 reset sum stays honest', distributionSum(FIN().defaultDistribution), 90);

// ---------- L: persistencia / reconstrucción ----------
__reset();
useFinanceStore.persist.clearStorage();
useExpenseStore.persist.clearStorage();
await useFinanceStore.persist.rehydrate();
await useExpenseStore.persist.rehydrate();
useFinanceStore.getState().addIncome({ amount: 1500000, source: 'sueldo', date: '2026-01-10' });
useFinanceStore.getState().addIncome({ amount: 200000, source: 'freelance', date: '2026-01-15' });
useFinanceStore.getState().setMonthDistributions('2026-01', JAN_DIST);
useExpenseStore.getState().addExpense({ amount: 25000, category: 'food', date: '2026-01-10' });
useExpenseStore.getState().addExpense({ amount: 40000, category: 'food', date: '2026-01-11' });
useExpenseStore.getState().addExpense({ amount: 15000, category: 'food', date: '2026-01-12' });
const snapshot = __dump();
check('L both keys persisted', Object.keys(snapshot).length, 2);

await useFinanceStore.persist.rehydrate();
const beforeReload = builds('2026-01');

__reset();
useFinanceStore.setState({
  categories: seedCategories.map((c) => ({ ...c })),
  incomes: [],
  distributionsByMonth: {},
  defaultDistribution: seedDistribution.map((d) => ({ ...d })),
});
useExpenseStore.setState({ expenses: [] });
await useFinanceStore.persist.rehydrate();
await useExpenseStore.persist.rehydrate();
check('L reload starts empty', FIN().incomes.length + EXP().expenses.length, 0);

for (const [key, value] of Object.entries(snapshot)) {
  await AsyncStorageMock.setItem(key, value);
}
await useFinanceStore.persist.rehydrate();
await useExpenseStore.persist.rehydrate();
{
  const b = builds('2026-01');
  check('L incomes restored', FIN().incomes.length, 2);
  check('L expenses restored', EXP().expenses.length, 3);
  check('L total restored', b.incomeTotal, 1700000);
  check('L food spent restored', rowOf(b.rows, 'food').spent, 80000);
  check('L jan dist restored', b.active.length, 8);
  check('L summary matches', b.summary.available, beforeReload.summary.available);
}

// ---------- v1 -> v2 migración (limpieza NaN/null) ----------
const corruptIncome: Income = {
  id: 'c1',
  amount: NaN,
  source: 'sueldo',
  date: '2026-01-10',
  createdAt: '2026-01-10T00:00:00.000Z',
};
const corruptedExpense: Expense = {
  id: 'x1',
  amount: NaN,
  category: 'food',
  date: '2026-01-10',
  createdAt: '2026-01-10T00:00:00.000Z',
};
__reset();
await AsyncStorageMock.setItem(
  FINANCE_STORAGE_KEY,
  JSON.stringify({
    state: {
      categories: [],
      incomes: [{ ...corruptIncome, amount: 1000000 }, { ...corruptIncome, id: 'c2', amount: null }],
      distributionsByMonth: {},
      defaultDistribution: [],
    },
    version: 1,
  }),
);
await AsyncStorageMock.setItem(
  STORAGE_KEY,
  JSON.stringify({
    state: {
      expenses: [{ ...corruptedExpense, amount: 25000 }, { ...corruptedExpense, id: 'x2', amount: null }],
    },
    version: 1,
  }),
);
await useFinanceStore.persist.rehydrate();
await useExpenseStore.persist.rehydrate();
check('M valid income migrated', FIN().incomes.length, 1);
check('M income amount kept', FIN().incomes[0].amount, 1000000);
check('M valid expense migrated', EXP().expenses.length, 1);
check('M expense amount kept', EXP().expenses[0].amount, 25000);

const financeDump = JSON.parse((await AsyncStorageMock.getItem(FINANCE_STORAGE_KEY)) ?? '');
const expenseDump = JSON.parse((await AsyncStorageMock.getItem(STORAGE_KEY)) ?? '');
check('M finance stored as v2', financeDump.version, 2);
check('M expense stored as v2', expenseDump.version, 2);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);