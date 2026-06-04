const API_URL = 'http://localhost:3000/transactions';

let transactions = [];

const themeToggleBtn = document.getElementById('themeToggleBtn');
const addTransactionForm = document.getElementById('addTransactionForm');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const filterMonth = document.getElementById('filterMonth');
const dynamicContainer = document.getElementById('dynamicContainer');

const userTotalDeposits = document.getElementById('userTotalDeposits');
const userTotalExpenses = document.getElementById('userTotalExpenses');
const userNetSavings = document.getElementById('userNetSavings');

const txnTitle = document.getElementById('txnTitle');
const txnAmount = document.getElementById('txnAmount');
const txnType = document.getElementById('txnType');
const txnCategory = document.getElementById('txnCategory');
const txnDate = document.getElementById('txnDate');
const txnDescription = document.getElementById('txnDescription');

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const inputs = [txnTitle, txnAmount, txnType, txnCategory, txnDate];

inputs.forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
  });

  input.addEventListener('change', () => {
    input.classList.remove('is-invalid');
  });
});

function validateForm() {
  let isValid = true;

  if (!txnTitle.value.trim() || txnTitle.value.trim().length < 3) {
    txnTitle.classList.add('is-invalid');
    isValid = false;
  } else {
    txnTitle.classList.remove('is-invalid');
  }

  const amountVal = parseFloat(txnAmount.value);

  if (isNaN(amountVal) || amountVal <= 0) {
    txnAmount.classList.add('is-invalid');
    isValid = false;
  } else {
    txnAmount.classList.remove('is-invalid');
  }

  if (!txnType.value) {
    txnType.classList.add('is-invalid');
    isValid = false;
  } else {
    txnType.classList.remove('is-invalid');
  }

  if (!txnCategory.value) {
    txnCategory.classList.add('is-invalid');
    isValid = false;
  } else {
    txnCategory.classList.remove('is-invalid');
  }

  if (!txnDate.value) {
    txnDate.classList.add('is-invalid');
    isValid = false;
  } else {
    txnDate.classList.remove('is-invalid');
  }

  return isValid;
}

async function loadTransactions() {
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    transactions = await response.json();
    applyFilters();
  } catch (error) {
    showErrorState();
  }
}

function applyFilters() {
  const selectedType = filterType.value;
  const selectedCategory = filterCategory.value;
  const selectedMonth = filterMonth.value;

  let depositsTotal = 0;
  let expensesTotal = 0;

  transactions.forEach(txn => {
    const txnMonth = txn.date.substring(5, 7);
    const matchesMonth =
      selectedMonth === 'all' || txnMonth === selectedMonth;

    if (matchesMonth) {
      const amount = parseFloat(txn.amount);

      if (txn.type === 'income') {
        depositsTotal += amount;
      } else if (txn.type === 'expense') {
        expensesTotal += amount;
      }
    }
  });

  const netSavingsVal = depositsTotal - expensesTotal;

  userTotalDeposits.textContent = `Rs. ${depositsTotal.toLocaleString()}`;
  userTotalExpenses.textContent = `Rs. ${expensesTotal.toLocaleString()}`;

  userNetSavings.textContent =
    netSavingsVal >= 0
      ? `Rs. ${netSavingsVal.toLocaleString()}`
      : `-Rs. ${Math.abs(netSavingsVal).toLocaleString()}`;

  if (netSavingsVal >= 0) {
    userNetSavings.style.color = 'var(--text-color)';
  } else {
    userNetSavings.style.color = 'var(--danger-color)';
  }
}
