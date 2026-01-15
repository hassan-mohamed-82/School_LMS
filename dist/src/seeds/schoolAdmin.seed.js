"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSchoolAdmins = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SchoolAdmin_1 = __importDefault(require("../models/schema/admin/SchoolAdmin"));
const seedSchoolAdmins = async ({ schools }) => {
    console.log('👨‍💼 Seeding School Admins...');
    const password = await bcryptjs_1.default.hash('123456', 10);
    const schoolAdminSeeds = [
        // مدرسة النور - Organizer + Admin
        {
            school: schools[0]._id,
            name: 'أحمد محمد',
            email: 'organizer@alnoor-school.com',
            password,
            phone: '01012345678',
            type: 'organizer',
            status: 'active',
        },
    ];
    const schoolAdmins = await SchoolAdmin_1.default.insertMany(schoolAdminSeeds);
    console.log(`✅ ${schoolAdmins.length} School Admins created`);
    return schoolAdmins;
};
exports.seedSchoolAdmins = seedSchoolAdmins;
