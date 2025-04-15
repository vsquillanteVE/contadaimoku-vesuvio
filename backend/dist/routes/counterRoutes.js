"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const counterController_1 = require("../controllers/counterController");
const router = express_1.default.Router();
// Get the current count
router.get('/', counterController_1.getCurrentCount);
// Increment the count
router.post('/', counterController_1.addToCount);
exports.default = router;
