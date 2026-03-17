// scripts/deploy.js
// Roda com: npx hardhat run scripts/deploy.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying com a conta:", deployer.address);

  const Contract = await ethers.getContractFactory("TodoList");
  const todoList = await Contract.deploy();
  await todoList.waitForDeployment();

  const address = await todoList.getAddress();
  console.log("TodoList deployado em:", address);

  // Demo rápida de uso
  console.log("\n--- Demo CRUD ---");

  let tx = await todoList.createTask("Aprender Solidity");
  await tx.wait();
  console.log("Tarefa criada (id=1)");

  tx = await todoList.createTask("Fazer deploy na testnet");
  await tx.wait();
  console.log("Tarefa criada (id=2)");

  const task1 = await todoList.getTask(1);
  console.log("getTask(1):", task1.title, "| completed:", task1.completed);

  tx = await todoList.updateTask(1, "Aprender Solidity (avancado)");
  await tx.wait();
  console.log("Titulo atualizado");

  tx = await todoList.toggleTask(1);
  await tx.wait();
  console.log("Toggle completed:", (await todoList.getTask(1)).completed);

  const all = await todoList.getMyTasks();
  console.log("Minhas tarefas:", all.map(t => `[${t.id}] ${t.title}`));

  tx = await todoList.deleteTask(2);
  await tx.wait();
  console.log("Tarefa 2 deletada. Total:", (await todoList.totalTasks()).toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
