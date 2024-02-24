import type { AppRouter } from '../../../server/src/routes/trpc/app.trpc';
import { createTRPCReact } from '@trpc/react-query';
export const trpc = createTRPCReact<AppRouter>();