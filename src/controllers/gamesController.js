import { db } from "../config/dbConfig.js";

// Listar os games

export const listGames = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM games;");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao listar jogos", err);
    res.status(500).json({ message: "Erro ao listar jogos" });
  }
};

// Inserir os games

export const insertGame = async (req, res) => {
  const { name, image, stockTotal, pricePerDay } = req.body;

  try {
    if (!name || !image || !stockTotal || !pricePerDay) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios" });
    }

    if (stockTotal <= 0 || pricePerDay <= 0) {
      return res
        .status(400)
        .json({ message: "stockTotal e pricePerDay devem ser maiores que 0" });
    }

    const existingGame = await db.query("SELECT * FROM games WHERE name = $1", [
      name,
    ]);
    if (existingGame.rows.length > 0) {
      return res.status(409).json({ message: "Jogo com esse nome já existe" });
    }

    await db.query(
      "INSERT INTO games (name, image, stocktotal, priceperday) VALUES ($1, $2, $3, $4)",
      [name, image, stockTotal, pricePerDay]
    );

    res.status(201).end();
  } catch (err) {
    console.error("Erro ao inserir jogo", err);
    res.status(500).json({ message: "Erro ao inserir jogo" });
  }
};
