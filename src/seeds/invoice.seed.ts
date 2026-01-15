import Invoice from '../models/schema/superadmin/Invoice';
import mongoose from 'mongoose';

interface SeedParams {
    schools: any[];
    planIds: {
        basic: mongoose.Types.ObjectId;
        premium: mongoose.Types.ObjectId;
    };
    superAdminId: mongoose.Types.ObjectId;
}

export const seedInvoices = async ({ schools, planIds, superAdminId }: SeedParams) => {
    console.log('🧾 Seeding Invoices...');

    const invoiceSeeds = [
        {
            invoiceNumber: 'INV-2024-000001',
            school: schools[0]._id,
            subscriptionPlan: planIds.premium,
            amount: 1500,
            discount: 0,
            totalAmount: 1500,
            currency: 'EGP',
            status: 'paid',
            paymentMethod: 'bank_transfer',
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-12-31'),
            paidAt: new Date('2024-01-05'),
            createdBy: superAdminId,
        },
        {
            invoiceNumber: 'INV-2024-000002',
            school: schools[1]._id,
            subscriptionPlan: planIds.basic,
            amount: 500,
            discount: 50,
            totalAmount: 450,
            currency: 'EGP',
            status: 'paid',
            paymentMethod: 'online',
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-12-31'),
            paidAt: new Date('2024-01-10'),
            notes: 'تم تطبيق كود خصم WELCOME50',
            createdBy: superAdminId,
        },
        {
            invoiceNumber: 'INV-2025-000001',
            school: schools[0]._id,
            subscriptionPlan: planIds.premium,
            amount: 1500,
            discount: 0,
            totalAmount: 1500,
            currency: 'EGP',
            status: 'pending',
            periodStart: new Date('2025-01-01'),
            periodEnd: new Date('2025-12-31'),
            createdBy: superAdminId,
        },
        {
            invoiceNumber: 'INV-2025-000002',
            school: schools[1]._id,
            subscriptionPlan: planIds.basic,
            amount: 500,
            discount: 0,
            totalAmount: 500,
            currency: 'EGP',
            status: 'pending',
            periodStart: new Date('2025-01-01'),
            periodEnd: new Date('2025-12-31'),
            createdBy: superAdminId,
        }
    ];

    const invoices = await Invoice.insertMany(invoiceSeeds);
    console.log(`✅ ${invoices.length} Invoices created`);
    return invoices;
};
