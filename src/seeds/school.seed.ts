import School from '../models/schema/superadmin/school';
import mongoose from 'mongoose';

interface PlanIds {
    free: mongoose.Types.ObjectId;
    basic: mongoose.Types.ObjectId;
    premium: mongoose.Types.ObjectId;
    enterprise: mongoose.Types.ObjectId;
}

export const seedSchools = async (planIds: PlanIds) => {
    console.log('🏫 Seeding Schools...');

    const schoolSeeds = [
        {
            name: 'مدرسة النور الخاصة',
            nameEn: 'Al-Noor Private School',
            email: '.com',
            phone: '01012345678',
            whatsapp: '01012345678',
            address: 'شارع التحرير، الدقي',
            city: 'الجيزة',
            country: 'Egypt',
            subscriptionPlan: planIds.premium,
            planStartsAt: new Date('2024-01-01'),
            planEndsAt: new Date('2025-12-31'),
            maxStudents: 500,
            timezone: 'Africa/Cairo',
            currency: 'EGP',
            status: 'active',
        },
        {
            name: 'مدرسة الأمل الدولية',
            nameEn: 'Al-Amal International School',
            email: 'info@alamal-school.com',
            phone: '01123456789',
            whatsapp: '01123456789',
            address: 'مدينة نصر',
            city: 'القاهرة',
            country: 'Egypt',
            subscriptionPlan: planIds.basic,
            planStartsAt: new Date('2024-01-01'),
            planEndsAt: new Date('2024-12-31'),
            maxStudents: 100,
            timezone: 'Africa/Cairo',
            currency: 'EGP',
            status: 'active',
        },
        {
            name: 'مدرسة المستقبل',
            nameEn: 'Future School',
            email: 'info@future-school.com',
            phone: '01234567890',
            address: 'المعادي',
            city: 'القاهرة',
            country: 'Egypt',
            subscriptionPlan: planIds.free,
            maxStudents: 20,
            timezone: 'Africa/Cairo',
            currency: 'EGP',
            status: 'active',
        }
    ];

    const schools = await School.insertMany(schoolSeeds);
    console.log(`✅ ${schools.length} Schools created`);
    return schools;
};
