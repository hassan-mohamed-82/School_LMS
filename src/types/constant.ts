export const SCHOOL_ADMIN_MODULES = {
  dashboard: ['view'],
  teachers: ['view', 'add', 'edit', 'delete', 'status'],
  parents: ['view', 'add', 'edit', 'delete', 'status'],
  students: ['view', 'add', 'edit', 'delete', 'status'],
  grades: ['view', 'add', 'edit', 'delete'],
  classes: ['view', 'add', 'edit', 'delete'],
  subjects: ['view', 'add', 'edit', 'delete'],
  schedule: ['view', 'add', 'edit', 'delete'],
  attendance: ['view', 'add', 'edit'],
  exams: ['view', 'add', 'edit', 'delete'],
  student_grades: ['view', 'add', 'edit'],
  fees: ['view', 'add', 'edit', 'delete'],
  payments: ['view', 'add', 'edit', 'approve', 'reject'],
  reports: ['view', 'export'],
  settings: ['view', 'edit'],
} as const;

export type SchoolAdminModuleName = keyof typeof SCHOOL_ADMIN_MODULES;
export type SchoolAdminActionName = typeof SCHOOL_ADMIN_MODULES[SchoolAdminModuleName][number];


// src/constants/superAdminPermissions.ts

// export const SUPER_ADMIN_MODULES = [
//   "organizations",
//   "plans", 
//   "payments",
//   "subscriptions",
//   "payment_methods",
//   "promocodes",
//   "reports",
//   "sub_admins",
//   "super_admin_roles",
//   "settings",
// ] as const;

// export const SUPER_ADMIN_ACTIONS = [
//   "view",
//   "create",
//   "update",
//   "delete",
//   "approve",
//   "reject",
//   "export",
// ] as const;

// export type SuperAdminModule = (typeof SUPER_ADMIN_MODULES)[number];
// export type SuperAdminAction = (typeof SUPER_ADMIN_ACTIONS)[number];