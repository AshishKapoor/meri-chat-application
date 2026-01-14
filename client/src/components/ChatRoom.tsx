import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Message, User } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Hash, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface Props {
  messages: Message[];
  currentUser: User | null;
  channelName?: string;
}

export const ChatRoom = ({ messages, currentUser, channelName }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold text-lg">
              {channelName || "Select a channel"}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Messages from the last 10 days
            </p>
          </div>
        </div>
        {currentUser?.isAdmin && (
          <Badge variant="warning" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isMe = currentUser?.visitorId === msg.senderVisitorId;
            const showDivider =
              idx === 0 ||
              new Date(msg.timestamp).toDateString() !==
                new Date(messages[idx - 1].timestamp).toDateString();

            return (
              <div key={msg._id}>
                {showDivider && (
                  <div className="flex items-center gap-2 my-4">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {dayjs(msg.timestamp).format("MMM D, YYYY")}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                )}

                {msg.system ? (
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-xs">
                      {msg.content}
                    </Badge>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex gap-3 animate-slide-in",
                      isMe && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          isMe && "bg-primary text-primary-foreground"
                        )}
                      >
                        {getInitials(msg.senderUsername)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[70%]",
                        isMe && "items-end"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">
                          {msg.senderUsername}
                        </span>
                        {isMe && <Badge variant="success">You</Badge>}
                        <span className="text-muted-foreground">
                          {dayjs(msg.timestamp).fromNow()}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm break-words",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {messages.length === 0 && channelName && (
            <div className="text-center py-12 text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Be the first to say something!</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
