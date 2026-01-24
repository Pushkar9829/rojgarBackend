const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  registerDevice,
  unregisterDevice,
} = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.post('/register-device', registerDevice);
router.post('/unregister-device', unregisterDevice);
router.patch('/:id/read', markRead);

module.exports = router;
