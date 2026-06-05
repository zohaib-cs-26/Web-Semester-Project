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
const filtered = transactions.filter(txn => {
  const txnMonth = txn.date.substring(5, 7);
  const matchesType = (selectedType === 'all' || txn.type === selectedType);
  const matchesCategory = (selectedCategory === 'all' || txn.category === selectedCategory);
  const matchesMonth = (selectedMonth === 'all' || txnMonth === selectedMonth);
  return matchesType && matchesCategory && matchesMonth;
});

renderList(filtered);
}

function renderList(list) {
  if (list.length === 0) {
    dynamicContainer.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍 No transactions found</p>
        <p>Try adjusting your search filters or add a new record to get started!</p>
      </div>
    `;
    return;
  }

  const listHTML = list.map(txn => {
    const isIncome = txn.type === 'income';
    const amountFormatted = isIncome
      ? `+ Rs. ${parseFloat(txn.amount).toLocaleString()}`
      : `- Rs. ${parseFloat(txn.amount).toLocaleString()}`;

    return `
      <article class="transaction-card" data-id="${txn.id}">
        <div class="transaction-info">
          <div class="transaction-header">
            <span class="transaction-title">${escapeHTML(txn.title)}</span>
            <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${txn.type}</span>
            <span class="badge badge-category">${escapeHTML(txn.category)}</span>
          </div>
          <div class="transaction-meta">
            <span>📅 ${txn.date}</span>
            ${txn.description ? `<span>📝 ${escapeHTML(txn.description)}</span>` : ''}
          </div>
        </div>
        <div class="transaction-value ${isIncome ? 'value-income' : 'value-expense'}">
          ${amountFormatted}
        </div>
      </article>
    `;
  }).join('');

  dynamicContainer.innerHTML = `<div class="transaction-list">${listHTML}</div>`;
}

async function saveTransaction(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const newTxn = {
    title: txnTitle.value.trim(),
    amount: parseFloat(txnAmount.value),
    type: txnType.value,
    category: txnCategory.value,
    date: txnDate.value,
    description: txnDescription.value.trim()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTxn)
    });

    if (!response.ok) {
      throw new Error(`Failed to create transaction: HTTP ${response.status}`);
    }

    addTransactionForm.reset();
    await loadTransactions();
  } catch (error) {
    showErrorState();
  }
}

function showLoading() {
  dynamicContainer.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Fetching records from JSON Server...</p>
    </div>
  `;
}

function showErrorState() {
  dynamicContainer.innerHTML = `
    <div class="error-state">
      <h3>⚠️ Connection Error</h3>
      <p>Could not reach the database. Please ensure that JSON Server is running locally by executing:</p>
      <code style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; font-weight: bold; margin: 0.5rem 0;">
        npx json-server --watch db.json --port 3000
      </code>
      <button class="btn btn-secondary btn-sm" id="btnRetryLoad" style="margin-top: 0.5rem; align-self: center;">
        🔄 Retry Connection
      </button>
    </div>
  `;

  const retryBtn = document.getElementById('btnRetryLoad');
  if (retryBtn) {
    retryBtn.addEventListener('click', loadTransactions);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

addTransactionForm.addEventListener('submit', saveTransaction);
filterType.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);
filterMonth.addEventListener('change', applyFilters);

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadTransactions();
});
