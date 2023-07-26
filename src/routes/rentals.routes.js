import express from "express";
import {
  listRentals,
  insertRental,
  returnRental,
} from "../controllers/rentals.Controller.js";

const router = express.Router();

router.get("/", listRentals);
router.post("/", insertRental);
router.post("/:id/return", returnRental);

export default router;
