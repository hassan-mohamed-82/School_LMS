"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmins = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const superadmin_1 = __importDefault(require("../models/schema/superadmin/superadmin"));
const seedSuperAdmins = async () => {
    console.log('👤 Seeding Super Admins...');
    const password = await bcryptjs_1.default.hash('123456', 10);
    const superAdminSeeds = [
        {
            name: 'المدير العام',
            email: 'superadmin@system.com',
            password,
            type: 'superadmin',
            status: 'active',
        },
        {
            name: 'مدير النظام',
            email: 'admin@system.com',
            password,
            type: 'superadmin',
            status: 'active',
        },
        {
            name: 'مدير فرعي',
            email: 'subadmin@system.com',
            password,
            type: 'subadmin',
            status: 'active',
        }
    ];
    const superAdmins = await superadmin_1.default.insertMany(superAdminSeeds);
    console.log(`✅ ${superAdmins.length} Super Admins created`);
    return superAdmins;
};
exports.seedSuperAdmins = seedSuperAdmins;
