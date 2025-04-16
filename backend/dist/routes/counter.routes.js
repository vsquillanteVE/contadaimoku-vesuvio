"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counter_controller_1 = require("../controllers/counter.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/count
 * @desc Ottiene il conteggio attuale
 * @access Public
 */
router.get('/', (req, res) => counter_controller_1.counterController.getCount(req, res));
/**
 * @route POST /api/count
 * @desc Incrementa il conteggio
 * @access Public
 */
router.post('/', (req, res) => counter_controller_1.counterController.incrementCount(req, res));
/**
 * @route DELETE /api/count
 * @desc Resetta il conteggio
 * @access Private (in un'app reale, questo dovrebbe essere protetto)
 */
router.delete('/', (req, res) => counter_controller_1.counterController.resetCount(req, res));
exports.default = router;
