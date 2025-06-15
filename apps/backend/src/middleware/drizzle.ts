import { createMiddleware } from 'hono/factory';
import { createDb } from '../db';
import { createDrizzleServices } from '../services/drizzle';
import type { Env } from '../index';
import type { Database } from '../db';
import type { DrizzleServices } from '../services/drizzle';

export const drizzleMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: {
    db: Database;
    services: DrizzleServices;
  };
}>(async (c, next) => {
  const db = createDb(c.env);
  const services = createDrizzleServices(db);
  
  c.set('db', db);
  c.set('services', services);
  
  await next();
});