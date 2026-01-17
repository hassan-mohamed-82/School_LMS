"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllModulesWithActions = exports.ACTION_LABELS = exports.MODULE_LABELS = exports.SCHOOL_ADMIN_MODULES = void 0;
exports.SCHOOL_ADMIN_MODULES = {
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
};
// Labels بالعربي
exports.MODULE_LABELS = {
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
exports.ACTION_LABELS = {
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
const getAllModulesWithActions = () => {
    return Object.entries(exports.SCHOOL_ADMIN_MODULES).map(([module, actions]) => ({
        module,
        moduleLabel: exports.MODULE_LABELS[module],
        actions: actions.map(action => ({
            action,
            actionLabel: exports.ACTION_LABELS[action],
        })),
    }));
};
exports.getAllModulesWithActions = getAllModulesWithActions;
