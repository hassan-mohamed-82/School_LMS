// src/middlewares/authorizePermissions.ts
import { NextFunction, Request, Response, RequestHandler } from "express";
import { Permission, PermissionAction } from "../types/custom";
import { SchoolAdminModuleName, SchoolAdminActionName } from "../types/constant";
import { UnauthorizedError } from "../Errors/unauthorizedError";

export const authorizePermissions = (
    moduleName: SchoolAdminModuleName,
    actionName: SchoolAdminActionName
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedError("Unauthorized");
        }

        if (user.role === "superadmin") {
            return next();
        }

        if (user.role !== "admin") {
            throw new UnauthorizedError("You are not authorized to access this resource");
        }

        const perm = user.permissions?.find((p: Permission) => p.module === moduleName);
        if (!perm) {
            throw new UnauthorizedError(`No access to module: ${moduleName}`);
        }

        const hasAction = perm.actions?.some((a: PermissionAction) => a.action === actionName);
        if (!hasAction) {
            throw new UnauthorizedError(`No permission: ${actionName} on ${moduleName}`);
        }

        return next();
    };
};