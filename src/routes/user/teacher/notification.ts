import { Router } from 'express';
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
} from '../../../controllers/users/teacher/notification';
import { catchAsync } from '../../../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(getMyNotifications));
router.get('/unread-count', catchAsync(getUnreadCount));
router.put('/:notificationId/read', catchAsync(markAsRead));
router.put('/read-all', catchAsync(markAllAsRead));

export default router;
