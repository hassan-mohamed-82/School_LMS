import bcrypt from 'bcryptjs';
import SuperAdmin from '../models/schema/superadmin/superadmin';

export const seedSuperAdmins = async () => {
    console.log('👤 Seeding Super Admins...');

    const password = await bcrypt.hash('123456', 10);

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

    const superAdmins = await SuperAdmin.insertMany(superAdminSeeds);
    console.log(`✅ ${superAdmins.length} Super Admins created`);
    return superAdmins;
};
