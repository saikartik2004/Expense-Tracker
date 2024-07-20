const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const chartCanvas = document.getElementById('myChart');
const search = document.getElementById('search');
const maxIncomeDisplay = document.getElementById('max-income');
const maxExpenseDisplay = document.getElementById('max-expense');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));

let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

let myChart;

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
  } else {
    const transactionType = document.querySelector('input[name="type"]:checked').value;

    const transaction = {
      id: generateID(),
      text: text.value,
      amount: (transactionType === 'income' ? 1 : -1) * +amount.value, // Adjust the sign based on the transaction type
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value = '';
    amount.value = '';

    updateChart();
  }
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const amountWithSign = `${sign}₹${Math.abs(transaction.amount).toFixed(2)}`;

  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    ${transaction.text} <span>${amountWithSign}</span> <button class="delete-btn" onclick="removeTransaction(${
    transaction.id
  })">x</button>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  init();
  updateChart();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateChart();
}

function updateChart() {
  const ctx = chartCanvas.getContext('2d');

  const incomeData = transactions
    .filter(transaction => transaction.amount > 0)
    .map(transaction => transaction.amount);

  const expenseData = transactions
    .filter(transaction => transaction.amount < 0)
    .map(transaction => Math.abs(transaction.amount));

  const totalIncome = incomeData.reduce((acc, item) => acc + item, 0);
  const totalExpense = expenseData.reduce((acc, item) => acc + item, 0);

  const maxIncome = Math.max(...incomeData);
  const maxExpense = Math.max(...expenseData);

  maxIncomeDisplay.innerText = `Max Income: ₹${maxIncome.toFixed(2)}`;
  maxExpenseDisplay.innerText = `Max Expense: ₹${maxExpense.toFixed(2)}`;

  const chartData = {
    labels: ['Total Income', 'Total Expense'],
    datasets: [
      {
        label: 'Income',
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        data: [totalIncome, 0],
      },
      {
        label: 'Expense',
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        data: [0, totalExpense],
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: chartOptions,
  });
}

function searchTransactions() {
  const searchText = search.value.toLowerCase();
  const filteredTransactions = transactions.filter(transaction => {
    return transaction.text.toLowerCase().includes(searchText) || transaction.amount.toString().includes(searchText);
  });

  list.innerHTML = '';
  filteredTransactions.forEach(addTransactionDOM);

  const filteredAmounts = filteredTransactions.map(transaction => transaction.amount);
  const totalFiltered = filteredAmounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const incomeFiltered = filteredAmounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expenseFiltered = (filteredAmounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

  balance.innerText = `₹${totalFiltered}`;
  money_plus.innerText = `₹${incomeFiltered}`;
  money_minus.innerText = `₹${expenseFiltered}`;
}

init();

form.addEventListener('submit', addTransaction);
search.addEventListener('input', searchTransactions);
