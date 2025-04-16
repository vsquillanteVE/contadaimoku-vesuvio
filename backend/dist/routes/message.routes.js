"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/message
 * @desc Ottiene il messaggio attuale
 * @access Public
 */
router.get('/', (req, res) => message_controller_1.messageController.getMessage(req, res));
/**
 * @route POST /api/message
 * @desc Aggiorna il messaggio
 * @access Private
 */
router.post('/', (req, res) => message_controller_1.messageController.updateMessage(req, res));
/**
 * @route GET /api/message/history
 * @desc Ottiene la cronologia dei messaggi
 * @access Public
 */
router.get('/history', (req, res) => message_controller_1.messageController.getMessageHistory(req, res));
exports.default = router;
