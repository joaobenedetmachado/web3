// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// =============================================================
//  TodoList.sol — CRUD básico em Solidity
//
//  Conceitos cobertos:
//    • Estado (storage) vs memória (memory)
//    • Structs, mappings, arrays
//    • Events (logs imutáveis na blockchain)
//    • Modifiers (guards reutilizáveis)
//    • Visibilidade: public, private, view
// =============================================================

contract TodoList {

    // ----------------------------------------------------------
    // 1. STRUCT — define o tipo "Task" com vários campos
    // ----------------------------------------------------------
    struct Task {
        uint256 id;
        string  title;
        bool    completed;
        address owner;      // quem criou a tarefa
    }

    // ----------------------------------------------------------
    // 2. STATE VARIABLES — ficam gravadas NA blockchain forever
    // ----------------------------------------------------------
    uint256 private nextId = 1;                      // contador de IDs
    mapping(uint256 => Task) private tasks;          // id => Task
    mapping(address => uint256[]) private ownerIds;  // owner => lista de ids

    // ----------------------------------------------------------
    // 3. EVENTS — emitidos em transações, lidos off-chain
    //    (baratos para guardar informação extra)
    // ----------------------------------------------------------
    event TaskCreated(uint256 indexed id, string title, address indexed owner);
    event TaskUpdated(uint256 indexed id, string newTitle);
    event TaskToggled(uint256 indexed id, bool completed);
    event TaskDeleted(uint256 indexed id);

    // ----------------------------------------------------------
    // 4. MODIFIER — reutiliza validações (como um "guard")
    // ----------------------------------------------------------
    modifier onlyOwner(uint256 id) {
        require(tasks[id].owner == msg.sender, "Nao e o dono da tarefa");
        _;  // continua a execucao da funcao
    }

    modifier taskExists(uint256 id) {
        require(tasks[id].owner != address(0), "Tarefa nao existe");
        _;
    }

    // ----------------------------------------------------------
    // CREATE — grava nova tarefa e retorna o ID gerado
    // ----------------------------------------------------------
    function createTask(string calldata title) external returns (uint256) {
        require(bytes(title).length > 0, "Titulo nao pode ser vazio");

        uint256 id = nextId++;
        tasks[id] = Task({
            id:        id,
            title:     title,
            completed: false,
            owner:     msg.sender
        });
        ownerIds[msg.sender].push(id);

        emit TaskCreated(id, title, msg.sender);
        return id;
    }

    // ----------------------------------------------------------
    // READ — lê uma tarefa pelo ID (view = não gasta gas)
    // ----------------------------------------------------------
    function getTask(uint256 id)
        external
        view
        taskExists(id)
        returns (Task memory)
    {
        return tasks[id];
    }

    // READ — retorna todas as tarefas do caller
    function getMyTasks() external view returns (Task[] memory) {
        uint256[] memory ids = ownerIds[msg.sender];
        Task[] memory result  = new Task[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tasks[ids[i]];
        }
        return result;
    }

    // ----------------------------------------------------------
    // UPDATE — atualiza o título (só o dono pode)
    // ----------------------------------------------------------
    function updateTask(uint256 id, string calldata newTitle)
        external
        taskExists(id)
        onlyOwner(id)
    {
        require(bytes(newTitle).length > 0, "Titulo nao pode ser vazio");
        tasks[id].title = newTitle;
        emit TaskUpdated(id, newTitle);
    }

    // UPDATE — toggle completo/incompleto
    function toggleTask(uint256 id)
        external
        taskExists(id)
        onlyOwner(id)
    {
        tasks[id].completed = !tasks[id].completed;
        emit TaskToggled(id, tasks[id].completed);
    }

    // ----------------------------------------------------------
    // DELETE — remove a tarefa (só o dono pode)
    // ----------------------------------------------------------
    function deleteTask(uint256 id)
        external
        taskExists(id)
        onlyOwner(id)
    {
        delete tasks[id];
        // Remove o id do array do owner
        uint256[] storage ids = ownerIds[msg.sender];
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == id) {
                ids[i] = ids[ids.length - 1]; // troca com o último
                ids.pop();                     // remove o último
                break;
            }
        }
        emit TaskDeleted(id);
    }

    // ----------------------------------------------------------
    // Utilitário — total de tarefas criadas até hoje
    // ----------------------------------------------------------
    function totalTasks() external view returns (uint256) {
        return nextId - 1;
    }
}
