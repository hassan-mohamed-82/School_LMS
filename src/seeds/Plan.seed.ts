import SubscriptionPlan from '../models/schema/superadmin/plans';

export const subscriptionPlanSeeds = [
    {
        name: 'الباقة المجانية',
        nameEn: 'Free Plan',
        price: 0,
        maxStudents: 20,
        maxTeachers: 3,
        maxAdmins: 1,
        features: [
            'إدارة الطلاب',
            'إدارة المدرسين',
            'التقارير الأساسية'
        ],
        status: 'active',
    },
    {
        name: 'الباقة الأساسية',
        nameEn: 'Basic Plan',
        price: 500,
        maxStudents: 100,
        maxTeachers: 15,
        maxAdmins: 2,
        features: [
            'إدارة الطلاب',
            'إدارة المدرسين',
            'التقارير الأساسية',
            'الدعم الفني',
            'الإشعارات'
        ],
        status: 'active',
    },
    {
        name: 'الباقة المتقدمة',
        nameEn: 'Premium Plan',
        price: 1500,
        maxStudents: 500,
        maxTeachers: 50,
        maxAdmins: 5,
        features: [
            'إدارة الطلاب',
            'إدارة المدرسين',
            'التقارير المتقدمة',
            'الدعم الفني المميز',
            'الإشعارات',
            'تطبيق الموبايل',
            'الرسائل SMS'
        ],
        status: 'active',
    },
    {
        name: 'باقة المؤسسات',
        nameEn: 'Enterprise Plan',
        price: 5000,
        maxStudents: 2000,
        maxTeachers: 200,
        maxAdmins: 20,
        features: [
            'جميع المميزات',
            'API متقدم',
            'تخصيص كامل',
            'مدير حساب خاص',
            'دعم على مدار الساعة'
        ],
        status: 'active',
    }
];

export const seedSubscriptionPlans = async () => {
    console.log('📦 Seeding Subscription Plans...');
    const plans = await SubscriptionPlan.insertMany(subscriptionPlanSeeds);
    console.log(`✅ ${plans.length} Subscription Plans created`);
    return plans;
};
