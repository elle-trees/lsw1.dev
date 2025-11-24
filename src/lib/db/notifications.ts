// Notification operations
import {
  createNotificationFirestore,
  getUserNotificationsFirestore,
  getUnreadUserNotificationsFirestore,
  markNotificationAsReadFirestore,
  markAllNotificationsAsReadFirestore,
  deleteNotificationFirestore,
  subscribeToUserNotificationsFirestore,
  subscribeToUnreadUserNotificationsFirestore
} from "../data/firestore/notifications";
import type { Unsubscribe } from "firebase/firestore";
import type { Notification } from "@/types/notifications";

export const createNotification = createNotificationFirestore;
export const getUserNotifications = getUserNotificationsFirestore;
export const getUnreadUserNotifications = getUnreadUserNotificationsFirestore;
export const markNotificationAsRead = markNotificationAsReadFirestore;
export const markAllNotificationsAsRead = markAllNotificationsAsReadFirestore;
export const deleteNotification = deleteNotificationFirestore;

// Real-time subscriptions
export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 20
): Unsubscribe | null => {
  return subscribeToUserNotificationsFirestore(userId, callback, limitCount);
};

export const subscribeToUnreadUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe | null => {
  return subscribeToUnreadUserNotificationsFirestore(userId, callback);
};

