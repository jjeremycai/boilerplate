import { eq, desc, and, or, sql } from 'drizzle-orm';
import type { Database } from '../../db';
import { tasks, projects, type Task, type NewTask } from '../../db/schema';
import type { CreateTaskInput, UpdateTaskInput } from '../../../shared/types';

export class DrizzleTaskService {
  constructor(private db: Database) {}

  async listTasks(userId: string, filters?: {
    projectId?: string;
    status?: string;
    priority?: string;
  }): Promise<Task[]> {
    let query = this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    if (filters?.projectId) {
      query = query.where(and(
        eq(tasks.userId, userId),
        eq(tasks.projectId, filters.projectId)
      ));
    }

    if (filters?.status) {
      query = query.where(and(
        eq(tasks.userId, userId),
        eq(tasks.status, filters.status as any)
      ));
    }

    if (filters?.priority) {
      query = query.where(and(
        eq(tasks.userId, userId),
        eq(tasks.priority, filters.priority as any)
      ));
    }

    return query.orderBy(desc(tasks.createdAt));
  }

  async getTask(taskId: string, userId: string): Promise<Task | null> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    // Verify project belongs to user
    const project = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, input.projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!project[0]) {
      throw new Error('Project not found');
    }

    const newTask: NewTask = {
      userId,
      projectId: input.projectId,
      title: input.title,
      description: input.description || null,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    };

    const result = await this.db
      .insert(tasks)
      .values(newTask)
      .returning();

    return result[0];
  }

  async updateTask(
    taskId: string,
    userId: string,
    input: UpdateTaskInput
  ): Promise<Task | null> {
    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    // Handle status change to done
    if (input.status === 'done' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    // Handle due date
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    const result = await this.db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0] || null;
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result.length > 0;
  }

  async getTaskStats(userId: string, projectId?: string) {
    let query = this.db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    if (projectId) {
      query = query.where(and(
        eq(tasks.userId, userId),
        eq(tasks.projectId, projectId)
      ));
    }

    const stats = await query.groupBy(tasks.status);

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }
}