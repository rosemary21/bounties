"use client";

import { useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import {
  ON_BOUNTY_UPDATED_SUBSCRIPTION,
  ON_NEW_APPLICATION_SUBSCRIPTION,
  type OnBountyUpdatedData,
  type OnNewApplicationData,
} from "@/lib/graphql/subscriptions";

import { useGraphQLSubscription } from "./use-graphql-subscription";

export type NotificationType = "bounty-updated" | "new-application";

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

const MAX_NOTIFICATIONS = 25;

function normaliseTimestamp(value?: string | null): string {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

function notificationKey(item: Pick<NotificationItem, "id" | "type">): string {
  return `${item.type}:${item.id}`;
}

function upsertNotification(
  previous: NotificationItem[],
  incoming: NotificationItem,
): NotificationItem[] {
  const key = notificationKey(incoming);
  const next = previous.filter((item) => notificationKey(item) !== key);

  next.unshift({ ...incoming, read: false });
  next.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );

  return next.slice(0, MAX_NOTIFICATIONS);
}

export function useNotifications() {
  const { data: session } = authClient.useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const isEnabled = Boolean(session?.user);
  const isLoading = session === undefined;

  useGraphQLSubscription<OnBountyUpdatedData>(
    ON_BOUNTY_UPDATED_SUBSCRIPTION,
    {},
    (data) => {
      const bounty = data.bountyUpdated;

      setNotifications((previous) =>
        upsertNotification(previous, {
          id: bounty.id,
          message: `Bounty \"${bounty.title}\" was updated.`,
          type: "bounty-updated",
          timestamp: normaliseTimestamp(bounty.updatedAt),
          read: false,
        }),
      );
    },
    undefined,
    isEnabled,
  );

  useGraphQLSubscription<OnNewApplicationData>(
    ON_NEW_APPLICATION_SUBSCRIPTION,
    {},
    (data) => {
      const application = data.submissionCreated;
      const actor = application.submittedByUser?.name || "A contributor";

      setNotifications((previous) =>
        upsertNotification(previous, {
          id: application.id,
          message: `${actor} submitted a new application for bounty ${application.bountyId}.`,
          type: "new-application",
          timestamp: normaliseTimestamp(application.createdAt),
          read: false,
        }),
      );
    },
    undefined,
    isEnabled,
  );

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications],
  );

  const markAsRead = (id: string, type: NotificationType) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id && item.type === type ? { ...item, read: true } : item,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true })),
    );
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
