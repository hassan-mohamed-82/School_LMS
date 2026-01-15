"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPromoCodes = void 0;
const promocode_1 = __importDefault(require("../models/schema/superadmin/promocode"));
const seedPromoCodes = async ({ superAdminId, planIds }) => {
    console.log('🎟️  Seeding Promo Codes...');
    const promoCodeSeeds = [
        {
            code: 'WELCOME50',
            description: 'خصم ترحيبي 50 جنيه للمشتركين الجدد',
            discountType: 'fixed',
            discountValue: 50,
            maxUses: 100,
            usedCount: 0,
            maxUsesPerSchool: 1,
            minAmount: 200,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            status: 'active',
            createdBy: superAdminId,
        },
        {
            code: 'SAVE20',
            description: 'خصم 20% على جميع الباقات',
            discountType: 'percentage',
            discountValue: 20,
            maxUses: 50,
            usedCount: 0,
            maxUsesPerSchool: 1,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            status: 'active',
            createdBy: superAdminId,
        },
        {
            code: 'PREMIUM100',
            description: 'خصم 100 جنيه على الباقة المتقدمة فقط',
            discountType: 'fixed',
            discountValue: 100,
            maxUses: 30,
            usedCount: 0,
            maxUsesPerSchool: 1,
            minAmount: 500,
            applicablePlans: [planIds.premium],
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            status: 'active',
            createdBy: superAdminId,
        },
        {
            code: 'SUMMER30',
            description: 'خصم صيفي 30%',
            discountType: 'percentage',
            discountValue: 30,
            maxUses: 200,
            usedCount: 5,
            maxUsesPerSchool: 1,
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-08-31'),
            status: 'expired',
            createdBy: superAdminId,
        }
    ];
    const promoCodes = await promocode_1.default.insertMany(promoCodeSeeds);
    console.log(`✅ ${promoCodes.length} Promo Codes created`);
    return promoCodes;
};
exports.seedPromoCodes = seedPromoCodes;
