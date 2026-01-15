"use strict";
// src/seeds/index.ts - Main seed runner
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import all seed functions
const Plan_seed_1 = require("./Plan.seed");
const school_seed_1 = require("./school.seed");
const superadmin_seed_1 = require("./superadmin.seed");
const paymentMethod_seed_1 = require("./paymentMethod.seed");
const promoCode_seed_1 = require("./promoCode.seed");
const subscription_seed_1 = require("./subscription.seed");
const invoice_seed_1 = require("./invoice.seed");
const payment_seed_1 = require("./payment.seed");
const schoolAdmin_seed_1 = require("./schoolAdmin.seed");
dotenv_1.default.config();
const runSeeds = async () => {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MongoDB_URI || '');
        console.log('✅ MongoDB connected\n');
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        const collections = await mongoose_1.default.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        console.log('✅ Data cleared\n');
        // Run seeds in order
        console.log('🌱 Starting seed process...\n');
        // 1. Super Admins
        const superAdmins = await (0, superadmin_seed_1.seedSuperAdmins)();
        const superAdminId = superAdmins[0]._id;
        // 2. Plans
        const plans = await (0, Plan_seed_1.seedSubscriptionPlans)();
        const planIds = {
            free: plans.find((p) => p.name === 'الباقة المجانية')._id,
            basic: plans.find((p) => p.name === 'الباقة الأساسية')._id,
            premium: plans.find((p) => p.name === 'الباقة المتقدمة')._id,
            enterprise: plans.find((p) => p.name === 'باقة المؤسسات')._id,
        };
        // 3. Payment Methods
        const paymentMethods = await (0, paymentMethod_seed_1.seedPaymentMethods)();
        // 4. Schools
        const schools = await (0, school_seed_1.seedSchools)(planIds);
        // 5. Promo Codes
        await (0, promoCode_seed_1.seedPromoCodes)({ superAdminId, planIds });
        // 6. Subscriptions
        const subscriptions = await (0, subscription_seed_1.seedSubscriptions)({ schools, planIds, superAdminId });
        // 7. Invoices
        const invoices = await (0, invoice_seed_1.seedInvoices)({ schools, planIds, superAdminId });
        // 8. Payments
        await (0, payment_seed_1.seedPayments)({ schools, subscriptions, invoices, paymentMethods, superAdminId });
        // 9. School Admins
        await (0, schoolAdmin_seed_1.seedSchoolAdmins)({ schools });
        console.log('\n🎉 All seeds completed successfully!');
    }
    catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\n🔌 MongoDB disconnected');
        process.exit(0);
    }
};
runSeeds();
