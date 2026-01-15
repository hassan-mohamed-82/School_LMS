"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPayments = void 0;
const payment_1 = __importDefault(require("../models/schema/superadmin/payment"));
const seedPayments = async ({ schools, subscriptions, invoices, paymentMethods, superAdminId }) => {
    console.log('💰 Seeding Payments...');
    const vodafoneMethod = paymentMethods.find((m) => m.type === 'vodafone_cash');
    const bankMethod = paymentMethods.find((m) => m.type === 'bank_transfer');
    const paymentSeeds = [
        {
            paymentNumber: 'PAY-2024-000001',
            school: schools[0]._id,
            subscription: subscriptions[0]._id,
            invoice: invoices[0]._id,
            paymentMethod: bankMethod._id,
            amount: 1500,
            currency: 'EGP',
            receiptImage: 'uploads/payments/receipt-001.jpg',
            status: 'approved',
            reviewedBy: superAdminId,
            reviewedAt: new Date('2024-01-05'),
            notes: 'تم التحقق من التحويل البنكي',
        },
        {
            paymentNumber: 'PAY-2024-000002',
            school: schools[1]._id,
            subscription: subscriptions[1]._id,
            invoice: invoices[1]._id,
            paymentMethod: vodafoneMethod._id,
            amount: 450,
            currency: 'EGP',
            receiptImage: 'uploads/payments/receipt-002.jpg',
            status: 'approved',
            reviewedBy: superAdminId,
            reviewedAt: new Date('2024-01-10'),
        },
        {
            paymentNumber: 'PAY-2025-000001',
            school: schools[0]._id,
            subscription: subscriptions[0]._id,
            invoice: invoices[2]._id,
            paymentMethod: vodafoneMethod._id,
            amount: 1500,
            currency: 'EGP',
            receiptImage: 'uploads/payments/receipt-003.jpg',
            status: 'pending',
        }
    ];
    const payments = await payment_1.default.insertMany(paymentSeeds);
    console.log(`✅ ${payments.length} Payments created`);
    return payments;
};
exports.seedPayments = seedPayments;
