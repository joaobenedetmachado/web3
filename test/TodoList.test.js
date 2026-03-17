// test/TodoList.test.js
// Roda com: npx hardhat test

const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("TodoList", function () {
  let todoList;
  let owner, other;

  // Antes de cada teste: deploya um contrato limpo
  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("TodoList");
    todoList = await Contract.deploy();
  });

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------
  describe("CREATE", function () {
    it("cria uma tarefa e retorna id=1", async function () {
      const tx = await todoList.createTask("Aprender Solidity");
      await tx.wait();

      const task = await todoList.getTask(1);
      expect(task.id).to.equal(1n);
      expect(task.title).to.equal("Aprender Solidity");
      expect(task.completed).to.equal(false);
      expect(task.owner).to.equal(owner.address);
    });

    it("emite evento TaskCreated", async function () {
      await expect(todoList.createTask("Web3"))
        .to.emit(todoList, "TaskCreated")
        .withArgs(1n, "Web3", owner.address);
    });

    it("rejeita titulo vazio", async function () {
      await expect(todoList.createTask("")).to.be.revertedWith(
        "Titulo nao pode ser vazio"
      );
    });
  });

  // -------------------------------------------------------
  // READ
  // -------------------------------------------------------
  describe("READ", function () {
    it("getMyTasks retorna todas as tarefas do caller", async function () {
      await todoList.createTask("A");
      await todoList.createTask("B");

      const tasks = await todoList.getMyTasks();
      expect(tasks.length).to.equal(2);
      expect(tasks[0].title).to.equal("A");
      expect(tasks[1].title).to.equal("B");
    });

    it("rejeita leitura de tarefa inexistente", async function () {
      await expect(todoList.getTask(99)).to.be.revertedWith(
        "Tarefa nao existe"
      );
    });
  });

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------
  describe("UPDATE", function () {
    beforeEach(async function () {
      await todoList.createTask("Original");
    });

    it("atualiza o titulo", async function () {
      await todoList.updateTask(1, "Editado");
      const task = await todoList.getTask(1);
      expect(task.title).to.equal("Editado");
    });

    it("faz toggle de completed", async function () {
      await todoList.toggleTask(1);
      expect((await todoList.getTask(1)).completed).to.equal(true);

      await todoList.toggleTask(1);
      expect((await todoList.getTask(1)).completed).to.equal(false);
    });

    it("impede outro usuario de atualizar", async function () {
      await expect(
        todoList.connect(other).updateTask(1, "Hack")
      ).to.be.revertedWith("Nao e o dono da tarefa");
    });
  });

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------
  describe("DELETE", function () {
    it("deleta tarefa e nao consegue mais ler", async function () {
      await todoList.createTask("Para deletar");
      await todoList.deleteTask(1);
      await expect(todoList.getTask(1)).to.be.revertedWith("Tarefa nao existe");
    });

    it("emite evento TaskDeleted", async function () {
      await todoList.createTask("X");
      await expect(todoList.deleteTask(1))
        .to.emit(todoList, "TaskDeleted")
        .withArgs(1n);
    });

    it("impede outro usuario de deletar", async function () {
      await todoList.createTask("Segura");
      await expect(
        todoList.connect(other).deleteTask(1)
      ).to.be.revertedWith("Nao e o dono da tarefa");
    });
  });

  // -------------------------------------------------------
  // STATS
  // -------------------------------------------------------
  it("totalTasks reflete o numero criado", async function () {
    expect(await todoList.totalTasks()).to.equal(0n);
    await todoList.createTask("Um");
    await todoList.createTask("Dois");
    expect(await todoList.totalTasks()).to.equal(2n);
  });
});
