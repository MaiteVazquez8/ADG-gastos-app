/**
 * Logic checks for the pure-utility modules, run directly on the TS sources
 * with Node's native type stripping. Run with: npm run test:logic
 */
import {
  MAX_AMOUNT,
  formatCompactCurrency,
  formatCurrency,
  normalizeAmountText,
  parseAmount,
  sanitizeAmountInput,
  toCents,
} from '../utils/currency.ts';
import {
  addMonths,
  daysInMonth,
  formatDayLabel,
  formatISODate,
  formatISODateLong,
  formatISODateShort,
  formatMonthKeyTiny,
  formatMonthLabel,
  formatMonthLabelShort,
  formatRelativeDay,
  fromISODate,
  getMonthKey,
  isSameMonthKey,
  isValidISODate,
  monthKeyOf,
  monthKeyStartDate,
  monthKeyStartISO,
  defaultDateForMonth,
  toISODate,
  todayISO,
} from '../utils/date.ts';
import {
  dailyTotals,
  filterByCategory,
  filterByMonth,
  filterByNote,
  groupByDay,
  percentDifference,
  sortExpensesByDateDesc,
  sumByMonth,
  sumTotal,
  totalsByCategory,
  trailingMonthlyTotals,
} from '../utils/aggregation.ts';
import {
  addCategoryToDistribution,
  allocatedForCategory,
  amountToPercentage,
  buildBudgetRows,
  budgetStatus,
  computeMonthSummary,
  distributionEditorValues,
  distributionIsComplete,
  distributionMap,
  distributionSum,
  incomesForMonth,
  resolveMonthDistribution,
  roundPercent,
  totalIncomeForMonth,
} from '../utils/budget.ts';
import type {
  CategoryDistribution,
  Expense,
  FinanceCategory,
  Income,
} from '../types/index.ts';
import {
  UNCATEGORIZED,
  countExpensesByCategory,
  findCategory,
  resolveCategory,
} from '../utils/categories.ts';
import { alpha } from '../utils/color.ts';
import { generateId } from '../utils/id.ts';
import {
  parsePercentageInput,
  sanitizePercentageInput,
  validateCategoryName,
  validateExpenseForm,
  validateIncomeForm,
} from '../utils/validation.ts';

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

function expense(
  id: string,
  amount: number,
  category: string,
  date: string,
  createdAt = `${date}T12:00:00.000Z`,
  note = '',
): Expense {
  return { id, amount, category, date, createdAt, note };
}

function income(id: string, amount: number, source: string, date: string, createdAt: string): Income {
  return { id, amount, source, date, createdAt };
}

function cat(id: string, name: string): FinanceCategory {
  return { id, name, icon: 'folder', color: '#123456', createdAt: '' };
}

// ---------- currency ----------
const parseCases: [string, number | null][] = [
  ['1500000', 1500000],
  ['1.500.000', 1500000],
  ['1.234,56', 1234.56],
  ['1234,56', 1234.56],
  ['1.500.000,50', 1500000.5],
  ['1234.56', 1234.56],
  ['1.234', 1234],
  ['12.34', 12.34],
  ['0,99', 0.99],
  ['0.99', 0.99],
  ['1000', 1000],
  ['', null],
  ['-5', null],
  ['999999.99', 999999.99],
  ['9999999', 9999999],
  ['abc', null],
  ['12,345', 12.35],
  ['0', null],
  ['0,00', null],
  ['.', null],
  ['  1.200  ', 1200],
  [String(MAX_AMOUNT), MAX_AMOUNT],
  [String(MAX_AMOUNT + 0.01), null],
];
for (const [input, expected] of parseCases) {
  check(`parseAmount("${input}")`, parseAmount(input), expected);
}

check('formatCurrency(1500000.5)', formatCurrency(1500000.5), '$1.500.000,50');
check('formatCurrency(1234.56)', formatCurrency(1234.56), '$1.234,56');
check('formatCurrency(-50)', formatCurrency(-50), '-$50,00');
check('formatCurrency(0)', formatCurrency(0), '$0,00');
check('formatCurrency(999999.99)', formatCurrency(999999.99), '$999.999,99');
check('formatCurrency(100000000)', formatCurrency(100000000), '$100.000.000,00');

check('formatCompactCurrency(1500000)', formatCompactCurrency(1500000), '$1,5m');
check('formatCompactCurrency(1234567.89)', formatCompactCurrency(1234567.89), '$1,2m');
check('formatCompactCurrency(1000)', formatCompactCurrency(1000), '$1,0k');
check('formatCompactCurrency(999)', formatCompactCurrency(999), '$999');
check('formatCompactCurrency(-2500)', formatCompactCurrency(-2500), '-$2,5k');
check('formatCompactCurrency(0)', formatCompactCurrency(0), '$0');

check('normalizeAmountText("1.234")', normalizeAmountText('1.234'), '1234');
check('normalizeAmountText("  1.234,56  ")', normalizeAmountText(' 1.234,56 '), '1234.56');
check('normalizeAmountText("abc")', normalizeAmountText('abc'), 'abc');
check('normalizeAmountText("10.5")', normalizeAmountText('10.5'), '10.5');

check('sanitizeAmountInput("1.500.000,50")', sanitizeAmountInput('1.500.000,50'), '1.500.000,50');
check('sanitizeAmountInput("12.34")', sanitizeAmountInput('12.34'), '12.34');
check('sanitizeAmountInput("abc1,23c")', sanitizeAmountInput('abc1,23c'), '1,23');
check('sanitizeAmountInput("1,2,3")', sanitizeAmountInput('1,2,3'), '1,23');
check('toCents(0.30000000000000004)', toCents(0.30000000000000004), 0.3);
check('toCents(1.005)', toCents(1.005), 1.01);

// ---------- date ----------
check('isValidISODate("2026-09-07")', isValidISODate('2026-09-07'), true);
check('isValidISODate("2026-02-28")', isValidISODate('2026-02-28'), true);
check('isValidISODate("2026-02-29")', isValidISODate('2026-02-29'), false);
check('isValidISODate("2026-13-01")', isValidISODate('2026-13-01'), false);
check('isValidISODate("2026-09-00")', isValidISODate('2026-09-00'), false);
check('isValidISODate("not-a-date")', isValidISODate('not-a-date'), false);
check('fromISODate("2026-09-07")', fromISODate('2026-09-07').getTime(), new Date(2026, 8, 7).getTime());
check('fromISODate("bad") NaN', Number.isNaN(fromISODate('bad').getTime()), true);
check('toISODate(new Date(2026,8,7))', toISODate(new Date(2026, 8, 7)), '2026-09-07');
check('getMonthKey("2026-09-30")', getMonthKey('2026-09-30'), '2026-09');
check('monthKeyStartDate("2026-09")', toISODate(monthKeyStartDate('2026-09')), '2026-09-01');
check('addMonths(jan,1)', monthKeyOf(addMonths(new Date(2026, 0, 15), 1)), '2026-02');
check('addMonths(dec,2)', monthKeyOf(addMonths(new Date(2025, 11, 1), 2)), '2026-02');
check('daysInMonth(2026,8)', daysInMonth(2026, 8), 30);
check('daysInMonth(2024,1)', daysInMonth(2024, 1), 29);
check('daysInMonth(2026,1)', daysInMonth(2026, 1), 28);
check('formatISODate("2026-09-07")', formatISODate('2026-09-07'), '7 sep 2026');
check('formatISODateLong("2026-09-07")', formatISODateLong('2026-09-07'), 'lun, 7 sep');
check('formatISODateShort("2026-09-07")', formatISODateShort('2026-09-07'), '7 sep');
check('formatMonthLabel("2026-09")', formatMonthLabel('2026-09'), 'Septiembre 2026');
check('formatMonthLabelShort("2026-09")', formatMonthLabelShort('2026-09'), 'sep 2026');
check('formatMonthKeyTiny("2026-09")', formatMonthKeyTiny('2026-09'), 'sep');
check('formatMonthKeyTiny("2026-00")', formatMonthKeyTiny('2026-00'), '2026-00');
check('formatDayLabel(1)', formatDayLabel(1), 'lun');
check('isSameMonthKey', isSameMonthKey('2026-09-01', '2026-09-30'), true);
check('isSameMonthKey(no)', isSameMonthKey('2026-09-01', '2026-10-01'), false);
check('formatRelativeDay(invalid)', formatRelativeDay('junk'), 'junk');

const today = todayISO();
check('formatRelativeDay(today)', formatRelativeDay(today), 'Hoy');
const yDate = new Date();
yDate.setDate(yDate.getDate() - 1);
check('formatRelativeDay(yesterday)', formatRelativeDay(toISODate(yDate)), 'Ayer');

check('monthKeyStartISO("2026-10")', monthKeyStartISO('2026-10'), '2026-10-01');
check('defaultDateForMonth past month', defaultDateForMonth('2026-10'), '2026-10-01');
check('defaultDateForMonth current month', defaultDateForMonth(monthKeyOf(new Date())), today);
check('defaultDateForMonth garbage', defaultDateForMonth('nope'), today);

// ---------- aggregation ----------
const aggrExpenses: Expense[] = [
  expense('a', 12.5, 'food', '2026-09-01'),
  expense('b', 30.25, 'transport', '2026-09-07'),
  expense('c', 7.75, 'food', '2026-09-07'),
  expense('d', 50, 'fun', '2026-10-03'),
  expense('e', 10, 'food', '2026-09-01', '2026-09-01T12:00:00.000Z', 'SUPERMERCADO'),
];
check('sumTotal()', sumTotal(aggrExpenses), 110.5);
check('sumTotal([])', sumTotal([]), 0);
check('sumByMonth(sep)', sumByMonth(aggrExpenses, '2026-09'), 60.5);
check('sumByMonth(oct)', sumByMonth(aggrExpenses, '2026-10'), 50);
check('sumByMonth(empty)', sumByMonth(aggrExpenses, '2026-08'), 0);

const totals = totalsByCategory(aggrExpenses.filter((e) => getMonthKey(e.date) === '2026-09'), ['food', 'transport', 'fun']);
check('totals length', totals.length, 2);
check('totals[0]', totals[0], { category: 'food', total: 30.25, percentage: 50, count: 3 });
check('totals[1]', totals[1], { category: 'transport', total: 30.25, percentage: 50, count: 1 });

const daily = dailyTotals(aggrExpenses, '2026-09');
check('dailyTotals length', daily.length, 30);
check('dailyTotals[0]', daily[0], { iso: '2026-09-01', total: 22.5 });
check('dailyTotals[6]', daily[6], { iso: '2026-09-07', total: 38 });
check('dailyTotals[7]', daily[7], { iso: '2026-09-08', total: 0 });

const now = new Date(2026, 8, 15);
const trailing = trailingMonthlyTotals(aggrExpenses, 3, now);
check('trailing keys', trailing.map((m) => m.monthKey), ['2026-07', '2026-08', '2026-09']);
check('trailing totals', trailing.map((m) => m.total), [0, 0, 60.5]);

check('percentDifference(120,100)', percentDifference(120, 100), 20);
check('percentDifference(90,100)', percentDifference(90, 100), -10);
check('percentDifference(x,0)', percentDifference(5, 0), null);
check('percentDifference(x,null)', percentDifference(5, null), null);
check('percentDifference(x,undefined)', percentDifference(5, undefined), null);

const groups = groupByDay(aggrExpenses.slice(0, 3));
check('groups order', groups.map((g) => g.date), ['2026-09-07', '2026-09-01']);
check('groups[0] items', groups[0].items.map((e) => e.id), ['b', 'c']);
check('groups[1] total', groups[1].total, 12.5);

check('sortExpensesByDateDesc', sortExpensesByDateDesc(aggrExpenses).map((e) => e.id), ['d', 'b', 'c', 'a', 'e']);
const tie = [expense('late', 1, 'x', '2026-09-07', '2026-09-07T12:00:00.000Z'), expense('early', 1, 'x', '2026-09-07', '2026-09-07T09:00:00.000Z')];
check('sort tie-break', sortExpensesByDateDesc(tie).map((e) => e.id), ['late', 'early']);

check('filterByMonth', filterByMonth(aggrExpenses, '2026-10').map((e) => e.id), ['d']);
check('filterByCategory(null) copy', filterByCategory(aggrExpenses, null).length, aggrExpenses.length);
check('filterByCategory', filterByCategory(aggrExpenses, 'food').length, 3);
check('filterByNote empty', filterByNote(aggrExpenses, '   ').length, aggrExpenses.length);
check('filterByNote case-insensitive', filterByNote(aggrExpenses, 'super').map((e) => e.id), ['e']);
check('filterByNote no match', filterByNote(aggrExpenses, 'zzz').length, 0);

// ---------- history navigation ----------
// Mirrors the History screen month navigator: relative steps built with the
// shared date utils (monthKeyStartDate + addMonths + monthKeyOf), with NO cap
// on future months — future-dated expenses must stay reachable like in the
// tabs' MonthSelector.
const navStep = (from: string, offset: number) =>
  monthKeyOf(addMonths(monthKeyStartDate(from), offset));

check('nav step back', navStep('2026-09', -1), '2026-08');
check('nav step forward', navStep('2026-09', 1), '2026-10');
check('nav future month reachable', navStep('2026-09', 3), '2026-12');
check('nav multi-year forward', navStep('2026-12', 1), '2027-01');
check('nav multi-year back', navStep('2026-01', -1), '2025-12');
check('nav cycle returns to same month', navStep('2026-09', 12), '2027-09');
check('nav switch and come back', navStep(navStep('2026-09', 1), -1), '2026-09');

const navExpenses: Expense[] = [
  expense('nav-past', 100, 'food', '2026-07-10'),
  expense('nav-current', 200, 'transport', '2026-09-05'),
  expense('nav-future', 300, 'shopping', '2026-12-15'),
];
const navCurrent = '2026-09';
const navPast = navStep(navCurrent, -2);
const navFuture = navStep(navCurrent, 3);
const navEmpty = navStep(navCurrent, -1);

check('nav A: current month shows its expense', filterByMonth(navExpenses, navCurrent).map((e) => e.id), ['nav-current']);
check('nav B: past month shows its expense', filterByMonth(navExpenses, navPast).map((e) => e.id), ['nav-past']);
check('nav C: future month shows its expense', filterByMonth(navExpenses, navFuture).map((e) => e.id), ['nav-future']);
check('nav E: month without data is empty', filterByMonth(navExpenses, navEmpty).length, 0);
check('nav F: past is isolated', filterByMonth(navExpenses, navPast).length, 1);
check('nav F: current is isolated', filterByMonth(navExpenses, navCurrent).length, 1);
check('nav F: future is isolated', filterByMonth(navExpenses, navFuture).length, 1);
check('nav F: no mixing across months', filterByMonth(navExpenses, navCurrent).every((e) => e.id === 'nav-current'), true);
check('nav totals per month', [sumByMonth(navExpenses, navPast), sumByMonth(navExpenses, navCurrent), sumByMonth(navExpenses, navFuture)], [100, 200, 300]);

// ---------- budget ----------
check('roundPercent(33.333333)', roundPercent(33.333333), 33.33);
check('roundPercent(100)', roundPercent(100), 100);
check('distributionSum', distributionSum([{ categoryId: 'a', percentage: 33.33 }, { categoryId: 'b', percentage: 66.67 }]), 100);
check('distributionIsComplete(true)', distributionIsComplete([{ categoryId: 'a', percentage: 60 }, { categoryId: 'b', percentage: 40 }]), true);
check('distributionIsComplete(false)', distributionIsComplete([{ categoryId: 'a', percentage: 60 }]), false);
check(
  'distributionMap',
  distributionMap([{ categoryId: 'a', percentage: 60 }, { categoryId: 'b', percentage: 40 }]).get('a'),
  60,
);

// distributionEditorValues (UI regression: a category added while the editor
// is open must never surface as undefined to the percentage parser).
const editorCats = [cat('c1', 'Comida'), cat('c2', 'Transporte'), cat('c3', 'Ocio')];
const editorDists: CategoryDistribution[] = [
  { categoryId: 'c1', percentage: 60 },
  { categoryId: 'c2', percentage: 40 },
];
const editorValues = distributionEditorValues(editorCats, editorDists);
check('distEditorValues keys', Object.keys(editorValues).sort(), ['c1', 'c2', 'c3']);
check('distEditorValues c1', editorValues.c1, '60');
check('distEditorValues c3 defaults to 0', editorValues.c3, '0');
check('distEditorValues all strings', Object.values(editorValues).every((v) => typeof v === 'string'), true);
const editorAfterReturn = distributionEditorValues(
  editorCats,
  [...editorDists, { categoryId: 'c3', percentage: 5 }],
);
check('distEditorValues new category seed', editorAfterReturn.c3, '5');
check('distEditorValues no undefined after growth', Object.values(editorAfterReturn).every((v) => typeof v === 'string' && v !== undefined), true);
check('allocatedForCategory', allocatedForCategory(2000, 33.33), 666.6);
check('amountToPercentage 10%', amountToPercentage(50000, 500000), 10);
check('amountToPercentage 12.5%', amountToPercentage(62500, 500000), 12.5);
check('amountToPercentage 100%', amountToPercentage(500000, 500000), 100);
check('amountToPercentage rounded', amountToPercentage(123456.78, 500000), 24.69);
check('amountToPercentage zero amount', amountToPercentage(0, 500000), null);
check('amountToPercentage no income', amountToPercentage(50000, 0), null);
check('amountToPercentage exceeds income', amountToPercentage(500001, 500000), null);
// Boundary from the audit: an amount strictly below the income is valid even
// when its exact percentage rounds up to 100 at 2-decimal precision. The
// "does it exceed the income?" decision never relies on that rounding.
check('amountToPercentage exactly income is 100', amountToPercentage(100000, 100000), 100);
check('amountToPercentage just below income valid', amountToPercentage(99999, 100000) !== null, true);

// Changing the income after a distribution was set recomputes the amounts from
// the stored percentages (only percentages are persisted).
check('Caso A 30% of 100k', allocatedForCategory(100000, 30), 30000);
check('Caso A 30% of 200k', allocatedForCategory(200000, 30), 60000);

// Mixed percentage + amount distributions (income 100k).
const mixed90 = [
  { categoryId: 'a', percentage: 40 },
  { categoryId: 'b', percentage: amountToPercentage(20000, 100000) ?? 0 },
  { categoryId: 'c', percentage: 30 },
];
check('mixed 40+20+30 sums 90', distributionSum(mixed90), 90);
check('mixed 90 not complete', distributionIsComplete(mixed90), false);
const mixed100 = [
  { categoryId: 'a', percentage: 40 },
  { categoryId: 'b', percentage: amountToPercentage(20000, 100000) ?? 0 },
  { categoryId: 'c', percentage: 40 },
];
check('mixed 40+20+40 sums 100', distributionSum(mixed100), 100);
check('mixed 100 complete', distributionIsComplete(mixed100), true);
const mixed110 = [
  { categoryId: 'a', percentage: 40 },
  { categoryId: 'b', percentage: amountToPercentage(70000, 100000) ?? 0 },
];
check('mixed 40+70 sums 110', distributionSum(mixed110), 110);
check('mixed 110 not complete', distributionIsComplete(mixed110), false);

// addCategoryToDistribution: a category added with a share scales the rest so
// the total stays at 100 instead of silently exceeding it.
const base333 = [{ categoryId: 'a', percentage: 40 }, { categoryId: 'b', percentage: 30 }, { categoryId: 'c', percentage: 30 }];
const withNew = addCategoryToDistribution(base333, 'new', 10);
check('addCat keeps 100 total', distributionSum(withNew), 100);
check('addCat scaled entries', withNew.map((d) => [d.categoryId, d.percentage]), [['a', 36], ['b', 27], ['c', 27], ['new', 10]]);
const partial = addCategoryToDistribution([{ categoryId: 'a', percentage: 60 }, { categoryId: 'b', percentage: 30 }], 'new', 10);
check('addCat partial base keeps 100', distributionSum(partial), 100);
check('addCat partial entries', partial.map((d) => [d.categoryId, d.percentage]), [['a', 60], ['b', 30], ['new', 10]]);
const drift = addCategoryToDistribution([{ categoryId: 'a', percentage: 33.33 }, { categoryId: 'b', percentage: 33.33 }, { categoryId: 'c', percentage: 33.34 }], 'new', 10);
check('addCat rounding drift absorbed', distributionSum(drift), 100);
check('addCat drift entries', drift.map((d) => [d.categoryId, d.percentage]), [['a', 30], ['b', 30], ['c', 30], ['new', 10]]);
const full = addCategoryToDistribution([{ categoryId: 'a', percentage: 60 }, { categoryId: 'b', percentage: 40 }], 'new', 100);
check('addCat 100% new zeros others', full.map((d) => [d.categoryId, d.percentage]), [['a', 0], ['b', 0], ['new', 100]]);
const zeroOthers = addCategoryToDistribution([{ categoryId: 'a', percentage: 0 }], 'new', 20);
check('addCat zero others stays honest', distributionSum(zeroOthers), 20);
const replaceExisting = addCategoryToDistribution(base333, 'b', 20);
check('addCat replacing existing keeps 100', distributionSum(replaceExisting), 100);
check('addCat replacing existing entries', replaceExisting.map((d) => [d.categoryId, d.percentage]), [['a', 45.71], ['c', 34.29], ['b', 20]]);
check('resolveMonthDistribution specific', resolveMonthDistribution({ '2026-09': [{ categoryId: 'z', percentage: 100 }] }, [{ categoryId: 'a', percentage: 100 }], '2026-09')[0].categoryId, 'z');
check('resolveMonthDistribution default', resolveMonthDistribution({}, [{ categoryId: 'a', percentage: 100 }], '2026-09')[0].categoryId, 'a');

check('budgetStatus ok', budgetStatus(50, 100), 'ok');
check('budgetStatus warning', budgetStatus(70, 100), 'warning');
check('budgetStatus alert', budgetStatus(91, 100), 'alert');
check('budgetStatus exceeded', budgetStatus(101, 100), 'exceeded');
check('budgetStatus zero budget+spent', budgetStatus(0, 0), 'ok');
check('budgetStatus zero budget spend', budgetStatus(10, 0), 'exceeded');

const cats = [cat('c1', 'Comida'), cat('c2', 'Transporte'), cat('c3', 'Ocio')];
const dists: CategoryDistribution[] = [
  { categoryId: 'c1', percentage: 60 },
  { categoryId: 'c2', percentage: 40 },
];
const budgetExpenses = [expense('e1', 20, 'c1', '2026-09-05'), expense('e2', 10, 'c1', '2026-09-06'), expense('e3', 15, 'c2', '2026-09-07')];
const rows = buildBudgetRows(cats, dists, 100, budgetExpenses);
check('rows count', rows.length, 3);
check('row c1 budget', rows[0].budget, 60);
check('row c1 spent', rows[0].spent, 30);
check('row c1 available', rows[0].available, 30);
check('row c1 status', rows[0].status, 'ok');
check('row c1 progress', rows[0].progress, 50);
check('row c1 count', rows[0].count, 2);
check('row c2 available', rows[1].available, 25);
check('row c3 all zero', rows[2].budget + rows[2].spent + rows[2].available + rows[2].count, 0);
check('row c3 progress zero', rows[2].progress, 0);
check('row c3 status ok', rows[2].status, 'ok');

const incomes = [
  income('i1', 100, 'sueldo', '2026-09-01', '2026-09-01T08:00:00.000Z'),
  income('i2', 50, 'freelance', '2026-10-01', '2026-10-01T08:00:00.000Z'),
];
check('totalIncomeForMonth(sep)', totalIncomeForMonth(incomes, '2026-09'), 100);
check('incomesForMonth order', incomesForMonth(incomes, '2026-09').map((i) => i.id), ['i1']);

const summary = computeMonthSummary(cats, dists, incomes, budgetExpenses, '2026-09');
check('summary.incomeTotal', summary.incomeTotal, 100);
check('summary.budgetedTotal', summary.budgetedTotal, 100);
check('summary.spentTotal', summary.spentTotal, 45);
check('summary.available', summary.available, 55);
check('summary.spentPercentOfIncome', summary.spentPercentOfIncome, 45);
check('summary.remainingPercent', summary.remainingPercent, 55);
check('summary.expenseCount', summary.expenseCount, 3);
check('summary.topCategory', summary.topCategory, { id: 'c1', name: 'Comida', color: '#123456' });
check('summary.lowestAvailable', summary.lowestAvailable, { id: 'c2', name: 'Transporte', color: '#123456', available: 25 });
check('summary.distributionValid', summary.distributionValid, true);

const incomplete = computeMonthSummary(cats, [{ categoryId: 'c1', percentage: 50 }], incomes, budgetExpenses, '2026-09');
check('summary incomplete distributionValid', incomplete.distributionValid, false);

// ---------- categories ----------
check('findCategory found', findCategory(cats, 'c1')?.name, 'Comida');
check('findCategory missing', findCategory(cats, 'nope'), undefined);
check('resolveCategory fallback', resolveCategory(cats, 'nope').id, UNCATEGORIZED.id);
check('countExpensesByCategory', countExpensesByCategory(budgetExpenses, 'c1'), 2);

// ---------- color ----------
check('alpha 0.08', alpha('#F97316', 0.08), '#F9731614');
check('alpha 0.5', alpha('#F97316', 0.5), '#F9731680');
check('alpha 0', alpha('#F97316', 0), '#F9731600');
check('alpha 1', alpha('#F97316', 1), '#F97316ff');
check('alpha clamps low', alpha('#000000', -3), '#00000000');
check('alpha clamps high', alpha('#000000', 5), '#000000ff');

// ---------- id ----------
const idA = generateId();
const idB = generateId();
check('generateId non-empty', typeof idA === 'string' && idA.length > 0, true);
check('generateId unique', idA !== idB, true);
check('generateId pattern', /^[0-9a-z-]+$/.test(idA), true);

// ---------- validation ----------
check('parsePercentageInput("12.5")', parsePercentageInput('12.5'), 12.5);
check('parsePercentageInput("")', parsePercentageInput(''), null);
check('parsePercentageInput("101")', parsePercentageInput('101'), null);
check('parsePercentageInput("-1")', parsePercentageInput('-1'), null);
check('parsePercentageInput("0")', parsePercentageInput('0'), 0);
check('parsePercentageInput("100")', parsePercentageInput('100'), 100);
check('parsePercentageInput("33.333")', parsePercentageInput('33.333'), 33.33);
check('sanitizePercentageInput("12.567")', sanitizePercentageInput('12.567'), '12.56');
check('sanitizePercentageInput("9999")', sanitizePercentageInput('9999'), '999');
check('sanitizePercentageInput("333.3.3")', sanitizePercentageInput('333.3.3'), '333.33');
check('validateCategoryName("")', validateCategoryName(''), 'Ingresá un nombre');
check('validateCategoryName("  ")', validateCategoryName('  '), 'Ingresá un nombre');
check('validateCategoryName(too long)', validateCategoryName('x'.repeat(25)), 'Máximo 24 caracteres');
check('validateCategoryName(ok)', validateCategoryName('Comida'), null);

const validForm = { amount: '1.500,50', category: 'c1', date: '2026-09-07', note: '' };
const badForm = { amount: '', category: 'nope', date: 'bad', note: '' };
check('validateExpenseForm ok', validateExpenseForm(validForm, cats), null);
const errors = validateExpenseForm(badForm, cats);
check('validateExpenseForm amount error', errors?.amount, 'Ingresá un monto');
check('validateExpenseForm category error', errors?.category, 'Elegí una categoría');
check('validateExpenseForm date error', errors?.date, 'Elegí una fecha válida');

const goodIncome = { amount: '1000', source: 'sueldo', date: '2026-09-07', note: '' };
const badIncome = { amount: '', source: '', date: '2026-13-01', note: '' };
check('validateIncomeForm ok', validateIncomeForm(goodIncome), null);
const incomeErrors = validateIncomeForm(badIncome);
check('validateIncomeForm amount error', incomeErrors?.amount, 'Ingresá un monto');
check('validateIncomeForm source error', incomeErrors?.source, 'Elegí una fuente');
check('validateIncomeForm date error', incomeErrors?.date, 'Elegí una fecha válida');

// ---------- ADG additions ----------
import {
  formatArs,
  formatArsSpaced,
  formatPercentEs,
  formatSignedArs,
  formatThousandsOnly,
} from '../utils/currency.ts';
import { formatISODateFullEs } from '../utils/date.ts';
import {
  buildMovements,
  filterMovements,
  movementsInMonth,
} from '../utils/movements.ts';
import { buildMovementsCsv } from '../utils/csv.ts';
import { resolveMonthLimits, totalMonthLimit } from '../store/useBudgetStore.ts';
import { DEFAULT_BUDGET_SHARES } from '../constants/finance.ts';

check('formatArs(570000)', formatArs(570000), '$570.000');
check('formatArs(1250000)', formatArs(1250000), '$1.250.000');
check('formatArsSpaced(570000)', formatArsSpaced(570000), '$ 570.000');
check('formatSignedArs(150000)', formatSignedArs(150000), '+ $ 150.000');
check('formatSignedArs(-42500)', formatSignedArs(-42500), '− $ 42.500');
check('formatPercentEs(35.29)', formatPercentEs(35.294), '35,3%');
check('formatPercentEs(68, 0)', formatPercentEs(68, 0), '68%');
check('formatThousandsOnly(1120)', formatThousandsOnly(1120), '1.120');
check('formatISODateFullEs', formatISODateFullEs('2026-11-10'), '10 de noviembre de 2026');

const adgCategories: FinanceCategory[] = [
  cat('food', 'Alimentación'),
  cat('hogar', 'Hogar'),
  cat('transport', 'Transporte'),
];
const adgExpenses: Expense[] = [
  expense('e1', 42500, 'food', '2026-11-10', '2026-11-10T12:35:00.000Z', 'Supermercado'),
  expense('e2', 1500, 'transport', '2026-11-10', '2026-11-10T08:15:00.000Z', 'Colectivo'),
  expense('e3', 220000, 'hogar', '2026-11-05', '2026-11-05T07:30:00.000Z', 'Alquiler'),
  expense('e4', 740000, 'food', '2026-10-05', '2026-10-05T12:00:00.000Z', 'Octubre grande'),
];
const adgIncomes: Income[] = [
  income('i1', 1100000, 'sueldo', '2026-11-01', '2026-11-01T09:00:00.000Z'),
];

const movements = buildMovements(adgExpenses, adgIncomes, adgCategories);
check('movements length', movements.length, 5);
check('movements signed amounts', [...movements.map((m) => m.signedAmount)].sort((a, b) => a - b), [-740000, -220000, -42500, -1500, 1100000]);
check('movements income signed positive', movements.find((m) => m.id === 'i1')?.signedAmount, 1100000);
check('movements expense signed negative', movements.find((m) => m.id === 'e1')?.signedAmount, -42500);
check('movements title from note', movements.find((m) => m.id === 'e1')?.title, 'Supermercado');
check('movements ordered desc by date', movements.map((m) => m.id).slice(0, 3), ['e1', 'e2', 'e3']);

check('movementsInMonth nov', movementsInMonth(movements, '2026-11').map((m) => m.id), ['e1', 'e2', 'e3', 'i1']);

const novFilter = { tipo: 'todos' as const, period: 'mes' as const, categoryId: null, paymentMethod: null, sort: 'recientes' as const };
check('filterMovements todos', filterMovements(movements, '2026-11', novFilter).map((m) => m.id), ['e1', 'e2', 'e3', 'i1']);
check('filterMovements gastos', filterMovements(movements, '2026-11', { ...novFilter, tipo: 'gastos' }).map((m) => m.id), ['e1', 'e2', 'e3']);
check('filterMovements ingresos', filterMovements(movements, '2026-11', { ...novFilter, tipo: 'ingresos' }).map((m) => m.id), ['i1']);
check('filterMovements categoria', filterMovements(movements, '2026-11', { ...novFilter, categoryId: 'food' }).map((m) => m.id), ['e1']);
check('filterMovements query', filterMovements(movements, '2026-11', novFilter, 'super').map((m) => m.id), ['e1']);
check('filterMovements year period', filterMovements(movements, '2026-11', { ...novFilter, period: 'anio' }).length, 5);
check('filterMovements monto sort', filterMovements(movements, '2026-11', { ...novFilter, sort: 'monto' }).map((m) => m.id)[0], 'i1');

const csv = buildMovementsCsv(adgExpenses, adgIncomes, adgCategories);
check('csv has header', csv.split('\r\n')[0], 'Fecha;Tipo;Concepto;Categoría;Medio de pago;Monto (ARS);Nota');
check('csv row count', csv.split('\r\n').length, adgExpenses.length + adgIncomes.length + 1);
check('csv escapes semicolons', buildMovementsCsv([expense('x', 10, 'food', '2026-11-10', '2026-11-10T12:35:00.000Z', 'a;b')], [], adgCategories).includes('"a;b"'), true);
check('csv amounts signed', csv.includes('-42500,00'), true);

// Disponible del mes (tope dinámico): 570.000 de ejemplo (1.250.000 - 680.000).
const NOV_DISPONIBLE = 570_000;
const resolved = resolveMonthLimits({}, '2026-11', NOV_DISPONIBLE);
check('default limits scale to disponible', [resolved.food?.amount, resolved.hogar?.amount, resolved.transport?.amount, resolved.entertainment?.amount, resolved.other?.amount], [171000, 199500, 68400, 74100, 57000]);
check('default budget total equals disponible', totalMonthLimit(resolved), NOV_DISPONIBLE);
check('default shares sum to 1', Math.abs(Object.values(DEFAULT_BUDGET_SHARES).reduce((s, x) => s + x, 0) - 1) < 1e-9, true);
check('default limits scale for other months', resolveMonthLimits({}, '2026-10', 380_000).food?.amount, 114_000);
check('override wins over disponible scaling', resolveMonthLimits({ '2026-11': { food: { amount: 12345, notify80: false } } }, '2026-11', NOV_DISPONIBLE).food?.amount, 12345);
check('override keeps other defaults scaled', resolveMonthLimits({ '2026-11': { food: { amount: 12345, notify80: false } } }, '2026-11', NOV_DISPONIBLE).hogar?.amount, 199500);
check('other months unaffected by override elsewhere', resolveMonthLimits({ '2026-11': { food: { amount: 1, notify80: true } } }, '2026-10', 380_000).food?.amount, 114_000);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);