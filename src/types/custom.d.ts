// src/types/custom.ts

import { ModuleName, ActionName } from "../constants/permissions";

// ═══════════════════════════════════════════════════════════════
// 🎯 PERMISSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface PermissionAction {
    id?: string;
    action: ActionName;
}

export interface Permission {
    module: ModuleName;
    actions: PermissionAction[];
}

// ═══════════════════════════════════════════════════════════════
// 👤 ROLE TYPES
// ═══════════════════════════════════════════════════════════════

// System Level (يديرون النظام كله)
export type SuperAdminType = "superadmin" | "subadmin";

// School Level (يديرون المدرسة)
export type SchoolAdminType = "organizer" | "admin";

// Mobile Users (تطبيق الموبايل)
export type MobileUserType = "teacher" | "parent";

// All Roles
export type Role = SuperAdminType | SchoolAdminType | MobileUserType;

// ═══════════════════════════════════════════════════════════════
// 🔐 TOKEN PAYLOAD
// ═══════════════════════════════════════════════════════════════

export interface TokenPayload {
    id: string;
    name: string;
    role: Role;
    schoolId?: string;      // للـ School Admins, Teachers, Parents
    roleId?: string;        // للـ SubAdmin و Admin (الصلاحيات)
    permissions?: Permission[];
    iat?: number;
    exp?: number;
}

// ═══════════════════════════════════════════════════════════════
// 📱 APP USER (Alias for TokenPayload)
// ═══════════════════════════════════════════════════════════════

export type AppUser = TokenPayload;

// ═══════════════════════════════════════════════════════════════
// 🔄 EXPRESS EXTENSION
// ═══════════════════════════════════════════════════════════════

declare global {
    namespace Express {
        interface Request {
            user?: AppUser;
        }
    }
}
