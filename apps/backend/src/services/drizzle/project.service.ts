import { eq, desc, and, sql } from 'drizzle-orm';
import type { Database } from '../../db';
import { projects, tasks, type Project, type NewProject } from '../../db/schema';
import type { CreateProjectInput, UpdateProjectInput } from '../../../shared/types';

export class DrizzleProjectService {
  constructor(private db: Database) {}

  async listProjects(userId: string): Promise<Project[]> {
    const result = await this.db
      .select({
        project: projects,
        taskCount: sql<number>`count(${tasks.id})`.as('task_count'),
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .where(eq(projects.userId, userId))
      .groupBy(projects.id)
      .orderBy(desc(projects.createdAt));

    return result.map(r => ({
      ...r.project,
      taskCount: r.taskCount || 0,
    }));
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const result = await this.db
      .select({
        project: projects,
        taskCount: sql<number>`count(${tasks.id})`.as('task_count'),
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .groupBy(projects.id)
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0].project,
      taskCount: result[0].taskCount || 0,
    };
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const newProject: NewProject = {
      userId,
      name: input.name,
      description: input.description || null,
      color: input.color || '#3B82F6',
    };

    const result = await this.db
      .insert(projects)
      .values(newProject)
      .returning();

    return result[0];
  }

  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<Project | null> {
    const result = await this.db
      .update(projects)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();

    return result[0] || null;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();

    return result.length > 0;
  }

  async getProjectStats(userId: string) {
    const stats = await this.db
      .select({
        status: projects.status,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(projects)
      .where(eq(projects.userId, userId))
      .groupBy(projects.status);

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }
}