import express from "express";
import pg from "pg";
import { db } from "../config/dbConfig.js";

const { Pool } = pg;
const router = express.Router();

// Criar um pool de conexões
const pool = new Pool(db);

router.get("/", async (req, res) => {
  try {
    // Executa a consulta SQL para selecionar todos os jogos
    const query = "SELECT * FROM games";
    const result = await pool.query(query);

    // Formata os dados para o formato de resposta esperado
    const listaJogos = result.rows.map((jogo) => {
      return {
        id: jogo.ID,
        name: jogo.NAME,
        image: jogo.IMAGE,
        stockTotal: jogo.STOCKTOTAL,
        pricePerDay: jogo.PRICEPERDAY,
      };
    });

    // Retorna a resposta em formato JSON
    return res.json({ jogos: listaJogos });
  } catch (error) {
    console.error("Erro ao listar jogos", error);
    return res.status(500).json({ message: "Erro ao listar jogos" });
  }
});

export default router;

// error get
