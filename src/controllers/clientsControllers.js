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
