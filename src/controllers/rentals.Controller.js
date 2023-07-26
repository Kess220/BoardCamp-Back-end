import { db } from "../config/dbConfig.js";

export const listRentals = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM rentals");
        res.status(200).json(result.rows);
    } catch (err) { 
        console.error("Erro ao listar aluguéis",err);
    }
}