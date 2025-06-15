import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { projects } from './projects';

export const taskStatusEnum = ['todo', 'in_progress', 'done', 'cancelled'] as const;
export type TaskStatus = typeof taskStatusEnum[number];

export const taskPriorityEnum = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = typeof taskPriorityEnum[number];

export const tasks = sqliteTable('tasks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: taskStatusEnum })
    .notNull()
    .default('todo'),
  priority: text('priority', { enum: taskPriorityEnum })
    .notNull()
    .default('medium'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;