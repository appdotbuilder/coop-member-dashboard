
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  getMemberDashboardInputSchema,
  getTransactionsInputSchema,
  getProductsInputSchema,
  getNotificationsInputSchema,
  markNotificationReadInputSchema
} from './schema';

// Import handlers
import { getMemberDashboard } from './handlers/get_member_dashboard';
import { getTransactions } from './handlers/get_transactions';
import { getProducts } from './handlers/get_products';
import { getNotifications } from './handlers/get_notifications';
import { markNotificationRead } from './handlers/mark_notification_read';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Dashboard endpoint - fetches comprehensive member data
  getMemberDashboard: publicProcedure
    .input(getMemberDashboardInputSchema)
    .query(({ input }) => getMemberDashboard(input)),
  
  // Transactions endpoint - fetches paginated transaction history
  getTransactions: publicProcedure
    .input(getTransactionsInputSchema)
    .query(({ input }) => getTransactions(input)),
  
  // Products endpoint - fetches products with optional filtering
  getProducts: publicProcedure
    .input(getProductsInputSchema)
    .query(({ input }) => getProducts(input)),
  
  // Notifications endpoint - fetches paginated notifications
  getNotifications: publicProcedure
    .input(getNotificationsInputSchema)
    .query(({ input }) => getNotifications(input)),
  
  // Mark notification as read
  markNotificationRead: publicProcedure
    .input(markNotificationReadInputSchema)
    .mutation(({ input }) => markNotificationRead(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
