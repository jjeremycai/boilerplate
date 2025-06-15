export * from './project.service';
export * from './task.service';
export * from './user.service';

// Create a service factory for easy initialization
import type { Database } from '../../db';
import { DrizzleProjectService } from './project.service';
import { DrizzleTaskService } from './task.service';
import { DrizzleUserService } from './user.service';

export interface DrizzleServices {
  projects: DrizzleProjectService;
  tasks: DrizzleTaskService;
  users: DrizzleUserService;
}

export function createDrizzleServices(db: Database): DrizzleServices {
  return {
    projects: new DrizzleProjectService(db),
    tasks: new DrizzleTaskService(db),
    users: new DrizzleUserService(db),
  };
}