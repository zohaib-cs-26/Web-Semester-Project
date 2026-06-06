const API_URL = 'http://localhost:3000/transactions';

let transactions = [];

const themeToggleBtn = document.getElementById('themeToggleBtn');
const adminTableContainer = document.getElementById('adminTableContainer');

const statBalance = document.getElementById('statBalance');
const statIncome = document.getElementById('statIncome');
const statExpenses = document.getElementById('statExpenses');
const statSavings = document.getElementById('statSavings');

const editModalBackdrop = document.getElementById('editModalBackdrop');
const editTransactionForm = document.getElementById('editTransactionForm');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnCancelEditCross = document.getElementById('btnCancelEditCross');

const editTxnId = document.getElementById('editTxnId');
const editTxnTitle = document.getElementById('editTxnTitle');
const editTxnAmount = document.getElementById('editTxnAmount');
const editTxnType = document.getElementById('editTxnType');
const editTxnCategory = document.getElementById('editTxnCategory');
const editTxnDate = document.getElementById('editTxnDate');
const editTxnDescription = document.getElementById('editTxnDescription');

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

const editInputs = [editTxnTitle, editTxnAmount, editTxnType, editTxnCategory, editTxnDate];

editInputs.forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
  });

  input.addEventListener('change', () => {
    input.classList.remove('is-invalid');
  });
});

function validateEditForm() {
  let isValid = true;

  if (!editTxnTitle.value.trim() || editTxnTitle.value.trim().length < 3) {
    editTxnTitle.classList.add('is-invalid');
    isValid = false;
  } else {
    editTxnTitle.classList.remove('is-invalid');
  }

  const amountVal = parseFloat(editTxnAmount.value);

  if (isNaN(amountVal) || amountVal <= 0) {
    editTxnAmount.classList.add('is-invalid');
    isValid = false;
  } else {
    editTxnAmount.classList.remove('is-invalid');
  }

  if (!editTxnType.value) {
    editTxnType.classList.add('is-invalid');
    isValid = false;
  } else {
    editTxnType.classList.remove('is-invalid');
  }

  if (!editTxnCategory.value) {
    editTxnCategory.classList.add('is-invalid');
    isValid = false;
  } else {
    editTxnCategory.classList.remove('is-invalid');
  }

  if (!editTxnDate.value) {
    editTxnDate.classList.add('is-invalid');
    isValid = false;
  } else {
    editTxnDate.classList.remove('is-invalid');
  }

  return isValid;
}

async function fetchAdminData() {
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Failed to load: HTTP ${response.status}`);
    }

    transactions = await response.json();
    calculateStats();
    renderTable();
  } catch (error) {
    showErrorState();
  }
}

function calculateStats() {
  let incomeTotal = 0;
  let expensesTotal = 0;

  transactions.forEach(txn => {
    const amount = parseFloat(txn.amount);

    if (txn.type === 'income') {
      incomeTotal += amount;
    } else if (txn.type === 'expense') {
      expensesTotal += amount;
    }
  });

  const netBalance = incomeTotal - expensesTotal;

  statIncome.textContent = `Rs. ${incomeTotal.toLocaleString()}`;
  statExpenses.textContent = `Rs. ${expensesTotal.toLocaleString()}`;
  statBalance.textContent = netBalance >= 0
    ? `Rs. ${netBalance.toLocaleString()}`
    : `-Rs. ${Math.abs(netBalance).toLocaleString()}`;

  if (netBalance >= 0) {
    statBalance.style.color = 'var(--text-color)';
  } else {
    statBalance.style.color = 'var(--danger-color)';
  }

  let savingsRate = 0;

  if (incomeTotal > 0) {
    savingsRate = (netBalance / incomeTotal) * 100;
  } else if (netBalance >= 0) {
    savingsRate = 100;
  } else {
    savingsRate = 0;
  }

  statSavings.textContent = `${savingsRate.toFixed(1)}%`;

  if (savingsRate >= 30) {
    statSavings.style.color = 'var(--success-color)';
  } else if (savingsRate >= 10) {
    statSavings.style.color = 'var(--warning-color)';
  } else {
    statSavings.style.color = 'var(--danger-color)';
  }
}

function renderTable() {
  if (transactions.length === 0) {
    adminTableContainer.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚙️ No transactions logged in the database</p>
        <p>Go to the user Dashboard tab to submit a student transaction record first.</p>
      </div>
    `;
    return;
  }

  const tableRows = transactions.map(txn => {
    const isIncome = txn.type === 'income';

    return `
      <tr id="row-${txn.id}">
        <td><strong>#${txn.id}</strong></td>
        <td>${escapeHTML(txn.title)}</td>
        <td><span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${txn.type}</span></td>
        <td><span class="badge badge-category">${escapeHTML(txn.category)}</span></td>
        <td class="${isIncome ? 'value-income' : 'value-expense'}" style="font-weight: 700;">
          Rs. ${parseFloat(txn.amount).toLocaleString()}
        </td>
        <td>${txn.date}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-sm btn-edit" data-id="${txn.id}" type="button">
              ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${txn.id}" type="button">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  adminTableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}
