import express from "express";
import {
  listClients,
  getClientById,
} from "../controllers/clientsControllers.js";

const router = express.Router();

// Rota para listar clientes
router.get("/", listClients);
router.get("/:id", getClientById);

export default router;
