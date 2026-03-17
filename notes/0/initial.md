# 🥇 Fase 0 — Mentalidade (rápido, mas essencial)

Se você pular isso, você até “faz funcionar”… mas vira **copiador de tutorial**. O objetivo aqui é entender **o que está acontecendo por baixo** quando você roda um `deploy`, chama uma função e paga taxas.

## O que é uma blockchain (ex: Ethereum)

Uma blockchain é um **livro‑razão (ledger) público** compartilhado por uma rede de computadores (nós).

- **Blocos**: pacotes de transações agrupadas em ordem.
- **Imutabilidade prática**: depois de confirmado, mudar o passado exige “vencer” o consenso econômico da rede (caríssimo/difícil).
- **Estado + histórico**: além do histórico de transações, existe um **estado atual** (ex.: saldos, storage de contratos) derivado da execução dessas transações.
- **Ethereum não é só “moeda”**: é uma máquina de execução distribuída (EVM) que roda **smart contracts**.

Pense assim: “um banco de dados” onde:
- ninguém é dono,
- qualquer um pode verificar,
- escrever custa (gas),
- ler é barato (normalmente grátis off-chain).

## O que é uma transação

Uma transação é uma **mensagem assinada** (com sua chave privada) que pede à rede para executar algo e **mudar o estado**.

Na prática, ela pode:
- **transferir ETH**,
- **criar um contrato** (deploy),
- **chamar uma função** de um contrato que altera storage (ex.: `createTask`, `updateTask`).

Características importantes:
- **assinatura**: prova que foi você (sem precisar confiar em ninguém).
- **nonce**: contador por conta que impede replay e define ordem.
- **confirmação/finalidade**: ela “entra” num bloco; quanto mais blocos depois, mais difícil reverter.

E “chamada de leitura”?
- `view` / `pure` normalmente é uma **call** (simulação local): não vira transação, não altera estado, não paga gas *na rede*.

## O que é gas

**Gas** é a unidade de “trabalho computacional” que você paga para a rede executar sua transação.

Por que existe:
- **evitar spam**: se escrever fosse grátis, a rede seria atacada/floodada.
- **precificar recursos**: CPU, armazenamento e largura de banda são limitados.
- **incentivar validadores**: taxas remuneram quem mantém a rede segura.

Modelo mental:
- Sua transação consome \(gasUsed\) (depende do que executa).
- Você define um limite \(gasLimit\) e um preço (EIP‑1559) com `maxFeePerGas` e `maxPriorityFeePerGas`.
- Custo aproximado: \(gasUsed \times effectiveGasPrice\).

No Solidity, o que costuma custar caro:
- **escrever em storage** (`tasks[id] = ...`, `users[msg.sender] = ...`)
- **loops** que crescem com dados do usuário (`for` em arrays grandes)

## Por que isso existe (descentralização / trustless)

“Descentralização” aqui não é slogan — é um **trade-off** consciente.

O que você ganha:
- **trustless**: você não precisa confiar em uma empresa/servidor; você confia em regras públicas + criptografia + incentivos.
- **censura difícil**: ninguém “apaga sua conta” unilateralmente (dependendo do app).
- **verificabilidade**: qualquer pessoa pode auditar o que ocorreu e validar o estado.

O que você paga:
- **custo** (gas),
- **latência** (confirmações),
- **limites de performance** (não é para fazer “tudo on-chain”),
- **irreversibilidade** (bugs custam caro).

## Checklist mental (pra não virar copiador)

- **O que muda no estado?** (storage do contrato / saldo / mapping)
- **Isso é `call` ou `tx`?** (não paga vs paga, não muda vs muda)
- **Quem paga o gas?** (o `msg.sender` da transação)
- **Quem tem permissão?** (guards tipo `onlyOwner`, `onlySelf`)
- **O custo cresce com o quê?** (tamanho de arrays, loops, writes)

## Próximo passo (ponte para o código)

Na Fase 1, quando você escrever um CRUD on-chain, cada função deve te fazer responder:
- “isso precisa estar na blockchain?”
- “qual parte pode ficar off-chain (UI/DB) lendo eventos?”
- “como eu evito loops que explodem o gas?”

