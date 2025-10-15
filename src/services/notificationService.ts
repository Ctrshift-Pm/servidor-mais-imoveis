﻿import { RowDataPacket } from 'mysql2';
import connection from '../database/connection';

type RelatedEntityType = 'property' | 'broker';

interface AdminRow {
  id: number;
}

const RELATED_ENTITY_TYPES: Set<RelatedEntityType> = new Set([
  'property',
  'broker',
]);

function isValidRelatedEntityType(
  value: string
): value is RelatedEntityType {
  return RELATED_ENTITY_TYPES.has(value as RelatedEntityType);
}

export async function notifyAdmins(
  message: string,
  relatedEntityType: RelatedEntityType,
  relatedEntityId: number
): Promise<void> {
  if (!isValidRelatedEntityType(relatedEntityType)) {
    throw new Error(`Invalid related entity type: ${relatedEntityType}`);
  }

  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT id FROM admins'
  );
  const adminIds = (rows as unknown as AdminRow[]).map((row) => row.id);

  if (adminIds.length === 0) {
    return;
  }

  const values = adminIds.map((adminId) => [
    adminId,
    message,
    relatedEntityType,
    relatedEntityId,
  ]);

  await connection.query(
    `
      INSERT INTO notifications (
        user_id,
        message,
        related_entity_type,
        related_entity_id
      )
      VALUES ?
    `,
    [values]
  );
}
