if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

let data = JSON.parse(localStorage.getItem("budgetData")) || [];

const monthPicker = document.getElementById("monthPicker");
monthPicker.value = new Date().toISOString().slice(0, 7);

function save() {
  localStorage.setItem("budgetData", JSON.stringify(data));
  render();
}

function currentMonth() {
  return monthPicker.value;
}

function addIncome() {
  const person = document.getElementById("incomePerson").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  if (!amount) return;

  data.push({
    type: "income",
    person,
    amount,
    month: currentMonth()
  });

  document.getElementById("incomeAmount").value = "";
  save();
}

function addExpense() {
  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  if (!amount) return;

  data.push({
    type: "expense",
    category,
    amount,
    month: currentMonth()
  });

  document.getElementById("expenseAmount").value = "";
  save();
}

function render() {
  const month = currentMonth();
  const incomeList = document.getElementById("incomeList");
  const expenseList = document.getElementById("expenseList");

  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  let incomes = data.filter(d => d.type === "income" && d.month === month);
  let expenses = data.filter(d => d.type === "expense" && d.month === month);

  let totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  let totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  incomes.forEach(i => {
    incomeList.innerHTML += `<li>${i.person}: € ${i.amount}</li>`;
  });

  expenses.forEach(e => {
    expenseList.innerHTML += `<li>${e.category}: € ${e.amount}</li>`;
  });

  document.getElementById("totalIncome").innerText = totalIncome.toFixed(2);
  document.getElementById("totalExpense").innerText = totalExpense.toFixed(2);
  document.getElementById("netResult").innerText = (totalIncome - totalExpense).toFixed(2);

  let income1 = incomes.filter(i => i.person === "Persoon 1").reduce((s, i) => s + i.amount, 0);
  let income2 = incomes.filter(i => i.person === "Persoon 2").reduce((s, i) => s + i.amount, 0);

  let total = income1 + income2;

  let share1 = total > 0 ? (income1 / total) * totalExpense : 0;
  let share2 = total > 0 ? (income2 / total) * totalExpense : 0;

  document.getElementById("share1").innerText = share1.toFixed(2);
  document.getElementById("share2").innerText = share2.toFixed(2);
}

function exportCSV() {
  const month = currentMonth();
  const rows = data.filter(d => d.month === month);

  let csv = "type,person/category,amount,month\n";

  rows.forEach(r => {
    csv += `${r.type},${r.person || r.category},${r.amount},${r.month}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `budget-${month}.csv`;
  a.click();
}

monthPicker.addEventListener("change", render);

render();
