export const SCHOOL_ADMIN_MODULES = {
    dashboard: ['view'],
    teachers: ['view', 'add', 'edit', 'delete', 'status'],
    parents: ['view', 'add', 'edit', 'delete', 'status'],
    students: ['view', 'add', 'edit', 'delete', 'status'],
    grades: ['view', 'add', 'edit', 'delete'],
    classes: ['view', 'add', 'edit', 'delete'],
    subjects: ['view', 'add', 'edit', 'delete'],
    schedule: ['view', 'add', 'edit', 'delete'],
    attendance: ['view', 'add', 'edit'],
    exams: ['view', 'add', 'edit', 'delete'],
    student_grades: ['view', 'add', 'edit'],
    fees: ['view', 'add', 'edit', 'delete'],
    payments: ['view', 'add', 'edit', 'approve', 'reject'],
    reports: ['view', 'export'],
    settings: ['view', 'edit'],
} as const;

export type SchoolAdminModuleName = keyof typeof SCHOOL_ADMIN_MODULES;
export type SchoolAdminActionName = typeof SCHOOL_ADMIN_MODULES[SchoolAdminModuleName][number];

// Labels بالعربي
export const MODULE_LABELS: Record<SchoolAdminModuleName, string> = {
    dashboard: 'لوحة التحكم',
    teachers: 'المدرسين',
    parents: 'أولياء الأمور',
    students: 'الطلاب',
    grades: 'المراحل',
    classes: 'الفصول',
    subjects: 'المواد',
    schedule: 'الجدول',
    attendance: 'الحضور',
    exams: 'الامتحانات',
    student_grades: 'درجات الطلاب',
    fees: 'المصاريف',
    payments: 'المدفوعات',
    reports: 'التقارير',
    settings: 'الإعدادات',
};

export const ACTION_LABELS: Record<string, string> = {
    view: 'عرض',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    status: 'تغيير الحالة',
    approve: 'موافقة',
    reject: 'رفض',
    export: 'تصدير',
};

// Helper: Get all modules with their actions
export const getAllModulesWithActions = () => {
    return Object.entries(SCHOOL_ADMIN_MODULES).map(([module, actions]) => ({
        module,
        moduleLabel: MODULE_LABELS[module as SchoolAdminModuleName],
        actions: actions.map(action => ({
            action,
            actionLabel: ACTION_LABELS[action],
        })),
    }));
};
