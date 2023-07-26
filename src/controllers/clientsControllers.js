import { db } from "../config/dbConfig.js";

export const listClients = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM customers ");
    res.status(200).json(result.rows);
  } catch (err) {
    console.log("Erro ao listar clientes", err);
    res.status(500).json({ message: "Erro ao listar clientes" });
  }
};

export const getClientById = async (req, res) => {
  const clientId = req.params.id;

  try {
    const result = await db.query("SELECT * FROM customers WHERE id = $1", [
      clientId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const client = result.rows[0];
    res.status(200).json(client);
  } catch (err) {
    console.log("Erro ao buscar cliente pelo ID", err);
    res.status(500).json({ message: "Erro ao buscar cliente pelo ID" });
  }
};

export const insertClient = async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;

  // Verifica se os campos estão preenchidos corretamente
  if (!name || !phone || !cpf || !birthday) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  // Verifica se o cpf tem 11 caracteres numéricos
  if (!/^\d{11}$/.test(cpf)) {
    return res
      .status(400)
      .json({ message: "CPF inválido. Deve conter 11 dígitos numéricos" });
  }

  // Verifica se o phone tem 10 ou 11 caracteres numéricos
  if (!/^\d{10,11}$/.test(phone)) {
    return res.status(400).json({
      message: "Telefone inválido. Deve conter 10 ou 11 dígitos numéricos",
    });
  }

  // Verifica se o birthday é uma data válida
  if (isNaN(Date.parse(birthday))) {
    return res.status(400).json({ message: "Data de aniversário inválida" });
  }

  try {
    // Verifica se o cpf já está cadastrado no banco de dados
    const existingClient = await db.query(
      "SELECT * FROM customers WHERE cpf = $1",
      [cpf]
    );
    if (existingClient.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Cliente com esse CPF já cadastrado" });
    }

    // Insere o novo cliente no banco de dados
    await db.query(
      "INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)",
      [name, phone, cpf, birthday]
    );

    return res.status(201).json();
  } catch (err) {
    console.log("Erro ao inserir cliente", err);
    return res.status(500).json({ message: "Erro ao inserir cliente" });
  }
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  // Verifica se o CPF é válido (11 caracteres numéricos)
  if (!/^\d{11}$/.test(cpf)) {
    return res.status(400).json({ message: "CPF inválido." });
  }

  // Verifica se o telefone é válido (10 ou 11 caracteres numéricos)
  if (!/^\d{10,11}$/.test(phone)) {
    return res.status(400).json({ message: "Telefone inválido." });
  }

  // Verifica se o nome está presente e não é uma string vazia
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Nome inválido." });
  }

  // Verifica se a data de nascimento é válida
  if (!isValidDate(birthday)) {
    return res.status(400).json({ message: "Data de nascimento inválida." });
  }

  try {
    // Verifica se o CPF pertence a outro cliente
    const existingClient = await db.query(
      "SELECT * FROM customers WHERE cpf = $1 AND id != $2",
      [cpf, id]
    );

    if (existingClient.rowCount > 0) {
      return res
        .status(409)
        .json({ message: "CPF já cadastrado para outro cliente." });
    }

    // Atualiza os dados do cliente no banco de dados
    const result = await db.query(
      "UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5",
      [name, phone, cpf, birthday, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    res.status(200).json({ message: "Cliente atualizado com sucesso." });
  } catch (err) {
    console.log("Erro ao atualizar cliente", err);
    res.status(500).json({ message: "Erro ao atualizar cliente." });
  }
};

// Função auxiliar para verificar se uma data é válida
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
