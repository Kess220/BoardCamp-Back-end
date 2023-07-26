import express from "express";
import {
  listClients,
  getClientById,
  insertClient,
  updateClient,
} from "../controllers/clientsControllers.js";

const router = express.Router();

router.get("/", listClients);
router.get("/:id", getClientById);
router.post("/", insertClient);
router.put("/:id", updateClient);

export default router;
