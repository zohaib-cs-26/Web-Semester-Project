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
document.querySelectorAll('.btn-edit').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    loadTransactionToEdit(id);
  });
});

document.querySelectorAll('.btn-delete').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    confirmDelete(id);
  });
});

async function loadTransactionToEdit(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to load item info: HTTP ${response.status}`);
    }

    const txn = await response.json();

    editTxnId.value = txn.id;
    editTxnTitle.value = txn.title;
    editTxnAmount.value = txn.amount;
    editTxnType.value = txn.type;
    editTxnCategory.value = txn.category;
    editTxnDate.value = txn.date;
    editTxnDescription.value = txn.description || '';

    editInputs.forEach(input => input.classList.remove('is-invalid'));

    editModalBackdrop.classList.add('show');
  } catch (error) {
    alert("Could not load transaction details. The database might be offline.");
  }
}

function closeEditModal() {
  editModalBackdrop.classList.remove('show');
  editTransactionForm.reset();
}

async function submitEditForm(event) {
  event.preventDefault();

  if (!validateEditForm()) {
    return;
  }

  const id = editTxnId.value;
  const updatedTxn = {
    title: editTxnTitle.value.trim(),
    amount: parseFloat(editTxnAmount.value),
    type: editTxnType.value,
    category: editTxnCategory.value,
    date: editTxnDate.value,
    description: editTxnDescription.value.trim()
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedTxn)
    });

    if (!response.ok) {
      throw new Error(`Failed to update item: HTTP ${response.status}`);
    }

    closeEditModal();
    await fetchAdminData();
  } catch (error) {
    alert("Could not save changes to JSON Server database.");
  }
}

async function confirmDelete(id) {
  const txn = transactions.find(t => t.id === id);
  const title = txn ? txn.title : `#${id}`;

  const hasConfirmed = confirm(`⚠️ Are you sure you want to permanently delete "${title}"? This cannot be undone.`);
  if (!hasConfirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete transaction: HTTP ${response.status}`);
    }

    await fetchAdminData();
  } catch (error) {
    alert("Could not delete record from server database.");
  }
}

function showLoading() {
  adminTableContainer.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading database records...</p>
    </div>
  `;
}

function showErrorState() {
  adminTableContainer.innerHTML = `
    <div class="error-state">
      <h3>⚠️ Connection Refused</h3>
      <p>Failed to communicate with JSON Server. Please check that it is running in your terminal:</p>
      <code style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; font-weight: bold; margin: 0.5rem 0;">
        npx json-server --watch db.json --port 3000
      </code>
      <button class="btn btn-secondary btn-sm" id="btnRetryLoadAdmin" style="margin-top: 0.5rem; align-self: center;">
        🔄 Retry Connection
      </button>
    </div>
  `;

  const retryBtn = document.getElementById('btnRetryLoadAdmin');
  if (retryBtn) {
    retryBtn.addEventListener('click', fetchAdminData);
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

editTransactionForm.addEventListener('submit', submitEditForm);
btnCancelEdit.addEventListener('click', closeEditModal);
btnCancelEditCross.addEventListener('click', closeEditModal);

window.addEventListener('click', (event) => {
  if (event.target === editModalBackdrop) {
    closeEditModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchAdminData();
});
