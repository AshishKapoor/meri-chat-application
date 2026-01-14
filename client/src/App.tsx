import { useEffect, useMemo, useState } from "react";
import { UsernameForm } from "./components/UsernameForm";
import { ChannelList } from "./components/ChannelList";
import { CreateChannelForm } from "./components/CreateChannelForm";
import { ChatRoom } from "./components/ChatRoom";
import { MessageInput } from "./components/MessageInput";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { useSocketContext } from "./context/SocketContext";
import { useVisitorId } from "./hooks/useVisitorId";
import { Channel, Message, User } from "./types";

const ADMIN_STORAGE_KEY = "chatapp-admin-session";

const App = () => {
  const socket = useSocketContext();
  const visitorId = useVisitorId();

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

    (socket as any).emit("getChannels", (chs: Channel[]) => setChannels(chs));

    const channelsListener = (chs: Channel[]) => setChannels(chs);
    (socket as any).on("channels", channelsListener);

    const deletedListener = (channelId: string) => {
      setCurrentChannel((prev) => (prev?._id === channelId ? null : prev));
      setMessages((prev) =>
        prev.length > 0 && prev[0]?.channelId === channelId ? [] : prev
      );
      setChannels((prev: Channel[]) =>
        prev.filter((c: Channel) => c._id !== channelId)
      );
    };
    (socket as any).on("channelDeleted", deletedListener);

    return () => {
      (socket as any).off("channels", channelsListener);
      (socket as any).off("channelDeleted", deletedListener);
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

    (socket as any).on("message", messageListener);
    (socket as any).on("system", systemListener);

    return () => {
      (socket as any).off("message", messageListener);
      (socket as any).off("system", systemListener);
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
    (socket as any).emit(
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
      (socket as any).emit(
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
    (socket as any).emit(
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
      (socket as any).emit("suggestChannelName", (suggestion: string) =>
        resolve(suggestion)
      );
    });
  };

  const handleJoinChannel = (channelId: string) => {
    if (!socket || !visitorId) return;
    if (currentChannel?._id && currentChannel._id !== channelId) {
      (socket as any).emit("leaveChannel", { channelId: currentChannel._id });
    }
    (socket as any).emit(
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
    (socket as any).emit(
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
    (socket as any).emit("sendMessage", {
      channelId: currentChannel._id,
      content: text,
      senderVisitorId: visitorId,
    });
  };

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="header">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Meri Chat</div>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>
              10-day history · guest chat
            </div>
          </div>
          <button
            className="button secondary"
            onClick={() => setAdminModalOpen(true)}
          >
            Admin
          </button>
        </div>

        {!currentUser ? (
          <UsernameForm onSubmit={handleRegister} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge">{currentUser.username}</span>
            {currentUser.isAdmin && <span className="badge admin">Admin</span>}
          </div>
        )}

        <CreateChannelForm
          onCreate={handleCreateChannel}
          onSuggest={handleSuggestChannel}
        />

        <ChannelList
          channels={sortedChannels}
          currentUser={currentUser}
          currentChannelId={currentChannel?._id}
          onJoin={handleJoinChannel}
          onDelete={handleDeleteChannel}
        />
      </div>

      <div className="main-pane">
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

      <AdminLoginModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLogin={handleAdminLogin}
        error={adminError}
      />
    </div>
  );
};

export default App;
