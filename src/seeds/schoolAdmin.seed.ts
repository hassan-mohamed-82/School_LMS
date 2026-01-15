import bcrypt from 'bcryptjs';
import SchoolAdmin from '../models/schema/admin/SchoolAdmin';

interface SeedParams {
    schools: any[];
}

export const seedSchoolAdmins = async ({ schools }: SeedParams) => {
    console.log('👨‍💼 Seeding School Admins...');

    const password = await bcrypt.hash('123456', 10);

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

    const schoolAdmins = await SchoolAdmin.insertMany(schoolAdminSeeds);
    console.log(`✅ ${schoolAdmins.length} School Admins created`);
    return schoolAdmins;
};
