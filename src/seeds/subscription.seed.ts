import Subscription from '../models/schema/superadmin/subscription';
import mongoose from 'mongoose';

interface SeedParams {
    schools: any[];
    planIds: {
        free: mongoose.Types.ObjectId;
        basic: mongoose.Types.ObjectId;
        premium: mongoose.Types.ObjectId;
    };
    superAdminId: mongoose.Types.ObjectId;
}

export const seedSubscriptions = async ({ schools, planIds, superAdminId }: SeedParams) => {
    console.log('📋 Seeding Subscriptions...');

    const subscriptionSeeds = [
        {
            school: schools[0]._id, // مدرسة النور
            plan: planIds.premium,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            amount: 1500,
            discount: 0,
            totalAmount: 1500,
            currency: 'EGP',
            status: 'active',
            autoRenew: true,
            renewalReminders: true,
            createdBy: superAdminId,
        },
        {
            school: schools[1]._id, // مدرسة الأمل
            plan: planIds.basic,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            amount: 500,
            discount: 50,
            totalAmount: 450,
            currency: 'EGP',
            status: 'active',
            autoRenew: false,
            renewalReminders: true,
            createdBy: superAdminId,
        },
        {
            school: schools[2]._id, // مدرسة المستقبل
            plan: planIds.free,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            amount: 0,
            discount: 0,
            totalAmount: 0,
            currency: 'EGP',
            status: 'active',
            autoRenew: true,
            renewalReminders: false,
            createdBy: superAdminId,
        }
    ];

    const subscriptions = await Subscription.insertMany(subscriptionSeeds);
    console.log(`✅ ${subscriptions.length} Subscriptions created`);
    return subscriptions;
};
