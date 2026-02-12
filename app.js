let data = JSON.parse(localStorage.getItem("budgetData")) || {
income: [],
expense: [],
budgets: {},
goals: []
};

const monthPicker = document.getElementById("monthPicker");
monthPicker.value = new Date().toISOString().slice(0,7);

function save(){
localStorage.setItem("budgetData", JSON.stringify(data));
render();
}

function addIncome(){
let person = document.getElementById("incomePerson").value;
let amount = parseFloat(document.getElementById("incomeAmount").value);
if(!amount) return;

data.income.push({person, amount, month: monthPicker.value});
save();
}

function addExpense(){
let cat = document.getElementById("expenseCategory").value;
let amount = parseFloat(document.getElementById("expenseAmount").value);
let recurring = document.getElementById("recurring").checked;

if(!amount) return;

data.expense.push({cat, amount, month: monthPicker.value, recurring});
save();
}

function setBudget(){
let cat = document.getElementById("budgetCategory").value;
let amount = parseFloat(document.getElementById("budgetAmount").value);
if(!cat || !amount) return;

data.budgets[cat] = amount;
save();
}

function addGoal(){
let name = document.getElementById("goalName").value;
let target = parseFloat(document.getElementById("goalTarget").value);
let saved = parseFloat(document.getElementById("goalSaved").value);
if(!name || !target) return;

data.goals.push({name,target,saved});
save();
}

function render(){

let month = monthPicker.value;

let incomes = data.income.filter(i=>i.month===month);
let expenses = data.expense.filter(e=>e.month===month);

let totalIncome = incomes.reduce((a,b)=>a+b.amount,0);
let totalExpense = expenses.reduce((a,b)=>a+b.amount,0);

document.getElementById("incomeList").innerHTML =
incomes.map(i=>`<li>${i.person}: €${i.amount}</li>`).join("");

document.getElementById("expenseList").innerHTML =
expenses.map(e=>{
let spent = expenses.filter(x=>x.cat===e.cat).reduce((a,b)=>a+b.amount,0);
let budget = data.budgets[e.cat] || 0;
let cls="green";
if(budget){
if(spent>budget) cls="red";
else if(spent>budget*0.8) cls="orange";
}
return `<li class="${cls}">${e.cat}: €${e.amount}</li>`;
}).join("");

document.getElementById("budgetList").innerHTML =
Object.keys(data.budgets).map(c=>`<li>${c}: €${data.budgets[c]}</li>`).join("");

document.getElementById("goalList").innerHTML =
data.goals.map(g=>{
let pct = Math.min((g.saved/g.target)*100,100);
return `
<div>
<strong>${g.name}</strong> €${g.saved}/€${g.target}
<div class="progress">
<div class="progress-bar" style="width:${pct}%"></div>
</div>
</div>`;
}).join("");

renderCharts(incomes,expenses);
}

function renderCharts(incomes,expenses){

let ctx1=document.getElementById("pieChart");
let ctx2=document.getElementById("barChart");

if(window.pie) window.pie.destroy();
if(window.bar) window.bar.destroy();

let catTotals={};
expenses.forEach(e=>{
catTotals[e.cat]=(catTotals[e.cat]||0)+e.amount;
});

window.pie=new Chart(ctx1,{
type:"pie",
data:{
labels:Object.keys(catTotals),
datasets:[{data:Object.values(catTotals)}]
}
});

window.bar=new Chart(ctx2,{
type:"bar",
data:{
labels:["Inkomsten","Uitgaven"],
datasets:[{data:[
incomes.reduce((a,b)=>a+b.amount,0),
expenses.reduce((a,b)=>a+b.amount,0)
]}]
}
});
}

function toggleDarkMode(){
document.body.classList.toggle("dark");
}

monthPicker.addEventListener("change",render);
render();

