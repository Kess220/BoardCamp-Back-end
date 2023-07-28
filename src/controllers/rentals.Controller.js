import { db } from "../config/dbConfig.js";

export const listRentals = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM rentals");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao listar aluguéis", err);
    res.status(500).json({ message: "Erro ao listar aluguéis" });
  }
};

export const insertRental = async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = new Date().toISOString().split("T")[0];

  if (!Number.isInteger(daysRented) || daysRented <= 0) {
    return res.status(400).json({
      message: "O campo daysRented deve ser um número inteiro maior que 0",
    });
  }

  if (!Number.isInteger(customerId) || !Number.isInteger(gameId)) {
    return res.status(400).json({
      message: "Os campos customerId e gameId devem ser números inteiros",
    });
  }

  try {
    const customerQuery = "SELECT * FROM customers WHERE id = $1";
    const customerResult = await db.query(customerQuery, [customerId]);
    if (customerResult.rowCount === 0) {
      return res.status(400).json({ message: "Cliente não encontrado" });
    }

    const gameQuery = "SELECT * FROM games WHERE id = $1";
    const gameResult = await db.query(gameQuery, [gameId]);
    if (gameResult.rowCount === 0) {
      return res.status(400).json({ message: "Jogo não encontrado" });
    }

    const rentalQuery =
      "SELECT COUNT(*) FROM rentals WHERE gameId = $1 AND returnDate IS NULL";
    const rentalResult = await db.query(rentalQuery, [gameId]);
    const rentedGames = rentalResult.rows[0].COUNT;
    const gameStockQuery = "SELECT stockTotal FROM games WHERE id = $1";
    const gameStockResult = await db.query(gameStockQuery, [gameId]);
    const gameStockTotal = gameStockResult.rows[0].STOCKTOTAL;
    if (rentedGames >= gameStockTotal) {
      return res
        .status(400)
        .json({ message: "Não há jogos disponíveis para aluguel" });
    }

    const gamePriceQuery = "SELECT pricePerDay FROM games WHERE id = $1";
    const gamePriceResult = await db.query(gamePriceQuery, [gameId]);
    if (gamePriceResult.rowCount === 0) {
      return res.status(500).json({ message: "Erro ao obter o preço do jogo" });
    }
    const pricePerDayString = gamePriceResult.rows[0].PRICEPERDAY;
    const pricePerDay = parseFloat(pricePerDayString);
    if (isNaN(pricePerDay)) {
      return res.status(500).json({ message: "Erro ao obter o preço do jogo" });
    }

    const originalPrice = daysRented * pricePerDay;

    const insertQuery =
      "INSERT INTO rentals (customerId, gameId, rentDate, daysRented, originalPrice) VALUES ($1, $2, $3, $4, $5)";
    await db.query(insertQuery, [
      customerId,
      gameId,
      rentDate,
      daysRented,
      originalPrice,
    ]);

    return res.status(201).json();
  } catch (err) {
    console.error("Erro ao inserir aluguel", err);
    res.status(500).json({ message: "Erro ao inserir aluguel" });
  }
};

export const returnRental = async (req, res) => {
  const { id } = req.params;
  const returnDate = new Date(req.body.returnDate).toISOString().split("T")[0];

  try {
    const rentalQuery = "SELECT * FROM rentals WHERE id = $1";
    const rentalResult = await db.query(rentalQuery, [id]);
    if (rentalResult.rowCount === 0) {
      return res.status(404).json({ message: "Aluguel não encontrado" });
    }

    const rental = rentalResult.rows[0];
    if (rental.returnDate !== null) {
      return res.status(400).json({ message: "Aluguel já finalizado" });
    }

    const gameId = rental.gameId;
    const gameQuery = "SELECT pricePerDay FROM games WHERE id = $1";
    const gameResult = await db.query(gameQuery, [gameId]);
    if (gameResult.rowCount === 0) {
      return res.status(500).json({ message: "Preço por dia inválido" });
    }
    const pricePerDayString = gameResult.rows[0].PRICEPERDAY;
    const pricePerDay = parseFloat(pricePerDayString);
    if (isNaN(pricePerDay)) {
      return res.status(500).json({ message: "Preço por dia inválido" });
    }

    const returnDateObj = new Date(returnDate);
    const rentDateObj = new Date(rental.rentDate);
    const daysDifference = Math.floor(
      (returnDateObj - rentDateObj) / (1000 * 60 * 60 * 24)
    );

    let delayFee = 0;
    if (daysDifference > rental.daysRented) {
      const daysDelayed = daysDifference - rental.daysRented;
      delayFee = daysDelayed * pricePerDay;
    }

    const updateQuery =
      "UPDATE rentals SET returnDate = $1, delayFee = $2 WHERE id = $3";

    await db.query(updateQuery, [returnDate, delayFee, id]);

    return res.status(200).json();
  } catch (err) {
    console.error("Erro ao retornar aluguel", err);
    res.status(500).json({ message: "Erro ao retornar aluguel" });
  }
};
