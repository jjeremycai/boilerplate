import { eq } from 'drizzle-orm';
import type { Database } from '../../db';
import { users, type User, type NewUser } from '../../db/schema';

export class DrizzleUserService {
  constructor(private db: Database) {}

  async getUser(userId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async createUser(userData: NewUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .returning();

    return result[0];
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0] || null;
  }

  async upsertUser(userData: NewUser): Promise<User> {
    // Try to create user, if exists update
    const existing = await this.getUserByEmail(userData.email);
    
    if (existing) {
      return this.updateUser(existing.id, userData) as Promise<User>;
    }
    
    return this.createUser(userData);
  }
}