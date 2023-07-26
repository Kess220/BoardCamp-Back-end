import express from "express";
import { listGames, insertGame } from "../controllers/gamesController.js";

const router = express.Router();

// Rota para listar todos os jogos
router.get("/", listGames);

// Rota para inserir um novo jogo
router.post("/", insertGame);

export default router;
