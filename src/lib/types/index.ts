import { z } from 'zod/v4';

export const UUID = z.uuid();
export type UUID = z.infer<typeof UUID>;
