import { useEffect, useMemo, useState } from "react";
import { UsernameForm } from "./components/UsernameForm";
import { ChannelList } from "./components/ChannelList";
import { CreateChannelForm } from "./components/CreateChannelForm";
import { ChatRoom } from "./components/ChatRoom";
import { MessageInput } from "./components/MessageInput";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { useSocketContext } from "./context/SocketContext";
import { useVisitorId } from "./hooks/useVisitorId";
import { useTheme } from "./hooks/useTheme";
import { Channel, Message, User } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Shield,
  User as UserIcon,
  Moon,
  Sun,
} from "lucide-react";

const ADMIN_STORAGE_KEY = "chatapp-admin-session";

const App = () => {
  const socket = useSocketContext();
  const visitorId = useVisitorId();
  const { theme, toggleTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const sortedChannels = useMemo(
    () =>
      [...channels].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [channels]
  );

  useEffect(() => {
    if (!socket || !visitorId) return;

    socket.emit("getChannels", (chs: Channel[]) => setChannels(chs));

    const channelsListener = (chs: Channel[]) => setChannels(chs);
    socket.on("channels", channelsListener);

    const deletedListener = (channelId: string) => {
      setCurrentChannel((prev) => (prev?._id === channelId ? null : prev));
      setMessages((prev) =>
        prev.length > 0 && prev[0]?.channelId === channelId ? [] : prev
      );
      setChannels((prev: Channel[]) =>
        prev.filter((c: Channel) => c._id !== channelId)
      );
    };
    socket.on("channelDeleted", deletedListener);

    return () => {
      socket.off("channels", channelsListener);
      socket.off("channelDeleted", deletedListener);
    };
  }, [socket, visitorId]);

  useEffect(() => {
    if (!socket || !currentChannel) return;

    const messageListener = (msg: Message) => {
      if (msg.channelId === currentChannel._id) {
        setMessages((prev: Message[]) => [...prev, msg]);
      }
    };
    const systemListener = (msg: Message) => {
      if (msg.channelId === currentChannel._id) {
        setMessages((prev: Message[]) => [...prev, msg]);
      }
    };

    socket.on("message", messageListener);
    socket.on("system", systemListener);

    return () => {
      socket.off("message", messageListener);
      socket.off("system", systemListener);
    };
  }, [socket, currentChannel]);

  useEffect(() => {
    if (!socket || !visitorId) return;
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedAdmin) {
      const { email, password } = JSON.parse(storedAdmin) as {
        email: string;
        password: string;
      };
      socket.emit(
        "adminLogin",
        { email, password, visitorId },
        (res: { user?: User; error?: string }) => {
          if (res.user) {
            setCurrentUser(res.user);
          }
        }
      );
    }
  }, [socket, visitorId]);

  const handleRegister = (username: string) => {
    if (!socket || !visitorId) return;
    socket.emit(
      "register",
      { username, visitorId },
      (res: { user?: User; error?: string }) => {
        if (res.user) setCurrentUser(res.user);
      }
    );
  };

  const handleAdminLogin = async (email: string, password: string) => {
    return new Promise<void>((resolve) => {
      if (!socket || !visitorId) return resolve();
      socket.emit(
        "adminLogin",
        { email, password, visitorId },
        (res: { user?: User; error?: string }) => {
          if (res.error) {
            setAdminError(res.error);
          }
          if (res.user) {
            setAdminError(null);
            setCurrentUser(res.user);
            localStorage.setItem(
              ADMIN_STORAGE_KEY,
              JSON.stringify({ email, password })
            );
            setAdminModalOpen(false);
          }
          resolve();
        }
      );
    });
  };

  const handleCreateChannel = (name: string) => {
    if (!socket || !visitorId) return;
    socket.emit(
      "createChannel",
      { name, visitorId },
      (res: { channel?: Channel; error?: string }) => {
        if (res.channel) {
          setChannels((prev: Channel[]) => [res.channel!, ...prev]);
        }
      }
    );
  };

  const handleSuggestChannel = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!socket) return resolve("Cool Cyan Falcon");
      socket.emit("suggestChannelName", (suggestion: string) =>
        resolve(suggestion)
      );
    });
  };

  const handleJoinChannel = (channelId: string) => {
    if (!socket || !visitorId) return;
    if (currentChannel?._id && currentChannel._id !== channelId) {
      socket.emit("leaveChannel", { channelId: currentChannel._id });
    }
    socket.emit(
      "joinChannel",
      { channelId, visitorId },
      (res: { messages?: Message[]; error?: string }) => {
        if (res.error) return;
        const channel =
          channels.find((c: Channel) => c._id === channelId) || null;
        setCurrentChannel(channel);
        setMessages(res.messages ?? []);
      }
    );
  };

  const handleDeleteChannel = (channelId: string) => {
    if (!socket || !visitorId) return;
    const confirmed = window.confirm("Delete this channel? (messages removed)");
    if (!confirmed) return;
    socket.emit(
      "deleteChannel",
      { channelId, visitorId },
      (res: { success?: boolean; error?: string }) => {
        if (res.success) {
          if (currentChannel?._id === channelId) {
            setCurrentChannel(null);
            setMessages([]);
          }
          setChannels((prev: Channel[]) =>
            prev.filter((c: Channel) => c._id !== channelId)
          );
        }
      }
    );
  };

  const handleSendMessage = (text: string) => {
    if (!socket || !currentChannel || !visitorId) return;
    socket.emit("sendMessage", {
      channelId: currentChannel._id,
      content: text,
      senderVisitorId: visitorId,
    });
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="w-80 bg-sidebar text-sidebar-foreground flex flex-col border-r">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-sidebar-primary" />
                <div>
                  <h1 className="text-xl font-bold">Meri Chat</h1>
                  <p className="text-xs text-sidebar-foreground/60">
                    10-day history · guest chat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                      className="bg-sidebar-accent hover:bg-sidebar-accent/80"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAdminModalOpen(true)}
                      className="bg-sidebar-accent hover:bg-sidebar-accent/80"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Admin login</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Separator className="bg-sidebar-border" />

            {/* User Section */}
            {!currentUser ? (
              <UsernameForm onSubmit={handleRegister} />
            ) : (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <Badge variant="success">{currentUser.username}</Badge>
                {currentUser.isAdmin && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
            )}

            <Separator className="bg-sidebar-border" />

            {/* Create Channel */}
            <CreateChannelForm
              onCreate={handleCreateChannel}
              onSuggest={handleSuggestChannel}
            />
          </div>

          {/* Channel List */}
          <ChannelList
            channels={sortedChannels}
            currentUser={currentUser}
            currentChannelId={currentChannel?._id}
            onJoin={handleJoinChannel}
            onDelete={handleDeleteChannel}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatRoom
            messages={messages}
            currentUser={currentUser}
            channelName={currentChannel?.name}
          />
          <MessageInput
            onSend={handleSendMessage}
            disabled={!currentChannel || !currentUser}
          />
        </div>

        {/* Admin Modal */}
        <AdminLoginModal
          open={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          onLogin={handleAdminLogin}
          error={adminError}
        />
      </div>
    </TooltipProvider>
  );
};

export default App;
