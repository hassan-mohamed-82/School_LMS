import Payment from '../models/schema/superadmin/payment';
import mongoose from 'mongoose';

interface SeedParams {
    schools: any[];
    subscriptions: any[];
    invoices: any[];
    paymentMethods: any[];
    superAdminId: mongoose.Types.ObjectId;
}

export const seedPayments = async ({
    schools,
    subscriptions,
    invoices,
    paymentMethods,
    superAdminId
}: SeedParams) => {
    console.log('💰 Seeding Payments...');

    const vodafoneMethod = paymentMethods.find((m: any) => m.type === 'vodafone_cash');
    const bankMethod = paymentMethods.find((m: any) => m.type === 'bank_transfer');

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

    const payments = await Payment.insertMany(paymentSeeds);
    console.log(`✅ ${payments.length} Payments created`);
    return payments;
};
