import type { Role } from '../test-data/users';
import { storageStatePath } from '../test-data/users';

/**
 * Use inside `test.describe` (or per-file) to load a saved session:
 *
 *   test.use(storageFor('user'));
 */
export function storageFor(role: Role): { storageState: string } {
  return { storageState: storageStatePath(role) };
}
