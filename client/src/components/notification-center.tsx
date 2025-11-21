import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Notification } from "@shared/schema";

interface NotificationCenterProps {
  userId: string | undefined;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  const { data: notifs = [], refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count", userId],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch unread count");
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });

  const unreadCount = unreadData?.count || 0;

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read?userId=${userId}`, {
        method: "POST",
      });
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notifId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notifId}/read`, {
        method: "POST",
      });
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "intro_request":
        return "text-blue-600 dark:text-blue-400";
      case "intro_accepted":
        return "text-green-600 dark:text-green-400";
      case "intro_declined":
        return "text-red-600 dark:text-red-400";
      case "contacts_enriched":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline"
              data-testid="button-mark-all-read"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifs.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                    !notif.read ? "bg-muted/50" : ""
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationColor(notif.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
