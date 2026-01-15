import { Channel, User } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  channels: Channel[];
  currentUser: User | null;
  onJoin: (id: string) => void;
  onDelete: (id: string) => void;
  currentChannelId?: string | null;
}

export const ChannelList = ({
  channels,
  currentUser,
  onJoin,
  onDelete,
  currentChannelId,
}: Props) => {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {channels.map((channel) => {
          const canDelete =
            currentUser &&
            (currentUser.isAdmin ||
              currentUser.visitorId === channel.createdBy);
          const isActive = currentChannelId === channel._id;

          return (
            <Card
              key={channel._id}
              onClick={() => onJoin(channel._id)}
              className={cn(
                "p-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground",
                isActive && "ring-2 ring-sidebar-primary bg-sidebar-accent/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
                    <span className="font-semibold text-sm truncate text-sidebar-foreground">
                      {channel.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                    <Users className="h-3 w-3" />
                    <span>{channel.memberCount ?? 0} online</span>
                    <span>·</span>
                    <span className="truncate">
                      {new Date(channel.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(channel._id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {channels.length === 0 && (
          <div className="text-center py-8 text-sidebar-foreground/60 text-sm">
            No channels yet. Create one to start chatting!
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
