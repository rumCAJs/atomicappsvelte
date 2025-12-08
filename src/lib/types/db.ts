import type { project, task, store, storeItem, userProfile } from '$lib/server/db/schema/app';
import type { user } from '$lib/server/db/schema/auth-schema';

export type UserSelect = typeof user.$inferSelect;
export type UserProfileSelect = typeof userProfile.$inferSelect;
export type ProjectSelect = typeof project.$inferSelect;
export type TaskSelect = typeof task.$inferSelect;
export type StoreSelect = typeof store.$inferSelect;
export type StoreItemSelect = typeof storeItem.$inferSelect;

export type ProjectUserRole = 'admin' | 'editor' | 'user';
