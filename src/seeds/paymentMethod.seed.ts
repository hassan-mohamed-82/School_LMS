import PaymentMethod from '../models/schema/superadmin/paymentMethod';

export const paymentMethodSeeds = [
    {
        name: 'فودافون كاش',
        nameEn: 'Vodafone Cash',
        type: 'vodafone_cash',
        accountNumber: '01012345678',
        accountName: 'School Management System',
        instructions: 'قم بتحويل المبلغ على الرقم المذكور ثم ارفع صورة الإيصال',
        sortOrder: 1,
        status: 'active',
    },
    {
        name: 'انستاباي',
        nameEn: 'InstaPay',
        type: 'instapay',
        accountNumber: 'school@instapay',
        accountName: 'School Management System',
        instructions: 'قم بالتحويل عبر انستاباي ثم ارفع صورة التأكيد',
        sortOrder: 2,
        status: 'active',
    },
    {
        name: 'فوري',
        nameEn: 'Fawry',
        type: 'fawry',
        accountNumber: '123456789',
        instructions: 'اذهب لأقرب فرع فوري وادفع على الكود المذكور',
        sortOrder: 3,
        status: 'active',
    },
    {
        name: 'تحويل بنكي',
        nameEn: 'Bank Transfer',
        type: 'bank_transfer',
        accountNumber: '1234567890123456',
        accountName: 'School Management Company',
        instructions: 'قم بالتحويل على الحساب البنكي: بنك مصر - فرع المهندسين',
        sortOrder: 4,
        status: 'active',
    },
    {
        name: 'نقدي',
        nameEn: 'Cash',
        type: 'cash',
        instructions: 'الدفع نقداً في مقر الشركة',
        sortOrder: 5,
        status: 'active',
    }
];

export const seedPaymentMethods = async () => {
    console.log('💳 Seeding Payment Methods...');
    const methods = await PaymentMethod.insertMany(paymentMethodSeeds);
    console.log(`✅ ${methods.length} Payment Methods created`);
    return methods;
};
