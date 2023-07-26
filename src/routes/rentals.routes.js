import express from "express";
import { listRentals } from "../controllers/rentals.Controller.js";

const router = express.Router();

router.get("/", listRentals);

export default router;
