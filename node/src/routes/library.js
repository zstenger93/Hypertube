import express from "express";
import { client } from "../../index.js";
import { getUserFromToken } from "../utils/validate.js";

const router = express.Router();

