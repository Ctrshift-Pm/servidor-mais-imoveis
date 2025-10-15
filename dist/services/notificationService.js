"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmins = notifyAdmins;
const connection_1 = __importDefault(require("../database/connection"));
const RELATED_ENTITY_TYPES = new Set([
    'property',
    'broker',
]);
function isValidRelatedEntityType(value) {
    return RELATED_ENTITY_TYPES.has(value);
}
async function notifyAdmins(message, relatedEntityType, relatedEntityId) {
    if (!isValidRelatedEntityType(relatedEntityType)) {
        throw new Error(`Invalid related entity type: ${relatedEntityType}`);
    }
    const [rows] = await connection_1.default.query('SELECT id FROM admins');
    const adminIds = rows.map((row) => row.id);
    if (adminIds.length === 0) {
        return;
    }
    const values = adminIds.map((adminId) => [
        adminId,
        message,
        relatedEntityType,
        relatedEntityId,
    ]);
    await connection_1.default.query(`
      INSERT INTO notifications (
        user_id,
        message,
        related_entity_type,
        related_entity_id
      )
      VALUES ?
    `, [values]);
}
