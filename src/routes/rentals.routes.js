import express from "express";
import {
  listRentals,
  insertRental,
  returnRental,
  deleteRental,
} from "../controllers/rentals.Controller.js";

const router = express.Router();

router.get("/", listRentals);
router.post("/", insertRental);
router.post("/:id/return", returnRental);
router.delete("/:id", deleteRental);

export default router;
