"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubscriptions = void 0;
const subscription_1 = __importDefault(require("../models/schema/superadmin/subscription"));
const seedSubscriptions = async ({ schools, planIds, superAdminId }) => {
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
    const subscriptions = await subscription_1.default.insertMany(subscriptionSeeds);
    console.log(`✅ ${subscriptions.length} Subscriptions created`);
    return subscriptions;
};
exports.seedSubscriptions = seedSubscriptions;
