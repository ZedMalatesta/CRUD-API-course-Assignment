import { validate } from 'uuid';

export function isUUID(id: string): boolean {
  return validate(id);
}
