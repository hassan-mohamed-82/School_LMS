import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../Errors";
import { TokenPayload } from "../types/custom";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET as string;

// ═══════════════════════════════════════════════════════════════
// 🔐 SUPER ADMIN TOKENS (System Level)
// ═══════════════════════════════════════════════════════════════

// للـ SuperAdmin (المدير العام للنظام)
export const generateSuperAdminToken = (data: {
  id: string;
  name: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "superadmin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// للـ SubAdmin (مدير فرعي بصلاحيات محدودة)
export const generateSubAdminToken = (data: {
  id: string;
  name: string;
  roleId?: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "subadmin",
    roleId: data.roleId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// ═══════════════════════════════════════════════════════════════
// 🏫 SCHOOL ADMIN TOKENS (School Level)
// ═══════════════════════════════════════════════════════════════

// للـ Organizer (صاحب المدرسة)
export const generateOrganizerToken = (data: {
  id: string;
  name: string;
  schoolId: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "organizer",
    schoolId: data.schoolId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// للـ Admin (مدير بالمدرسة بصلاحيات)
export const generateAdminToken = (data: {
  id: string;
  name: string;
  schoolId: string;
  roleId?: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "admin",
    schoolId: data.schoolId,
    roleId: data.roleId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// ═══════════════════════════════════════════════════════════════
// 👨‍🏫 TEACHER TOKEN (School Level)
// ═══════════════════════════════════════════════════════════════

// للـ Teacher (المدرس)
export const generateTeacherToken = (data: {
  id: string;
  name: string;
  schoolId: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "teacher",
    schoolId: data.schoolId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// ═══════════════════════════════════════════════════════════════
// 👨‍👩‍👧 PARENT TOKEN (Mobile App)
// ═══════════════════════════════════════════════════════════════

// للـ Parent (ولي الأمر)
export const generateParentToken = (data: {
  id: string;
  name: string;
  schoolId: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: "parent",
    schoolId: data.schoolId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // مدة أطول للموبايل
};

// ═══════════════════════════════════════════════════════════════
// 🔄 GENERIC TOKEN GENERATOR
// ═══════════════════════════════════════════════════════════════

type RoleType = "superadmin" | "subadmin" | "organizer" | "admin" | "teacher" | "parent";

export const generateToken = (data: {
  id: string;
  name: string;
  role: RoleType;
  schoolId?: string;
  roleId?: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    role: data.role,
    ...(data.schoolId && { schoolId: data.schoolId }),
    ...(data.roleId && { roleId: data.roleId }),
  };

  // مدة التوكن حسب الدور
  const expiresIn = data.role === "parent" ? "30d" : "7d";

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// ═══════════════════════════════════════════════════════════════
// ✅ VERIFY TOKEN
// ═══════════════════════════════════════════════════════════════

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

// ═══════════════════════════════════════════════════════════════
// 🔄 REFRESH TOKEN (Optional)
// ═══════════════════════════════════════════════════════════════

export const refreshToken = (oldToken: string): string => {
  const decoded = verifyToken(oldToken);

  // إزالة الـ iat و exp من الـ payload القديم
  const { iat, exp, ...payload } = decoded as TokenPayload & { iat: number; exp: number };

  const expiresIn = payload.role === "parent" ? "30d" : "7d";

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
