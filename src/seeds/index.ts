// src/seeds/index.ts - Main seed runner

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all seed functions
import { seedSubscriptionPlans } from './Plan.seed';
import { seedSchools } from './school.seed';
import { seedSuperAdmins } from './superadmin.seed';
import { seedPaymentMethods } from './paymentMethod.seed';
import { seedPromoCodes } from './promoCode.seed';
import { seedSubscriptions } from './subscription.seed';
import { seedInvoices } from './invoice.seed';
import { seedPayments } from './payment.seed';
import { seedSchoolAdmins } from './schoolAdmin.seed';

dotenv.config();

const runSeeds = async () => {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MongoDB_URI || '');
        console.log('✅ MongoDB connected\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        const collections = await mongoose.connection.db!.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        console.log('✅ Data cleared\n');

        // Run seeds in order
        console.log('🌱 Starting seed process...\n');

        // 1. Super Admins
        const superAdmins = await seedSuperAdmins();
        const superAdminId = superAdmins[0]._id;

        // 2. Plans
        const plans = await seedSubscriptionPlans();
        const planIds = {
            free: plans.find((p: any) => p.name === 'الباقة المجانية')!._id,
            basic: plans.find((p: any) => p.name === 'الباقة الأساسية')!._id,
            premium: plans.find((p: any) => p.name === 'الباقة المتقدمة')!._id,
            enterprise: plans.find((p: any) => p.name === 'باقة المؤسسات')!._id,
        };

        // 3. Payment Methods
        const paymentMethods = await seedPaymentMethods();

        // 4. Schools
        const schools = await seedSchools(planIds as any);

        // 5. Promo Codes
        await seedPromoCodes({ superAdminId, planIds } as any);

        // 6. Subscriptions
        const subscriptions = await seedSubscriptions({ schools, planIds, superAdminId } as any);

        // 7. Invoices
        const invoices = await seedInvoices({ schools, planIds, superAdminId } as any);

        // 8. Payments
        await seedPayments({ schools, subscriptions, invoices, paymentMethods, superAdminId } as any);

        // 9. School Admins
        await seedSchoolAdmins({ schools });

        console.log('\n🎉 All seeds completed successfully!');

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB disconnected');
        process.exit(0);
    }
};

runSeeds();
