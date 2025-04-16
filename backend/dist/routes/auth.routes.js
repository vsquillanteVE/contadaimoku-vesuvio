"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
/**
 * @route POST /api/auth/login
 * @desc Autentica un utente
 * @access Public
 */
router.post('/login', (req, res) => auth_controller_1.authController.login(req, res));
exports.default = router;
