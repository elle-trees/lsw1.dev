// Notification operations
import {
  createNotificationFirestore,
  getUserNotificationsFirestore,
  getUnreadUserNotificationsFirestore,
  markNotificationAsReadFirestore,
  markAllNotificationsAsReadFirestore,
  deleteNotificationFirestore
} from "../data/firestore/notifications";

export const createNotification = createNotificationFirestore;
export const getUserNotifications = getUserNotificationsFirestore;
export const getUnreadUserNotifications = getUnreadUserNotificationsFirestore;
export const markNotificationAsRead = markNotificationAsReadFirestore;
export const markAllNotificationsAsRead = markAllNotificationsAsReadFirestore;
export const deleteNotification = deleteNotificationFirestore;

