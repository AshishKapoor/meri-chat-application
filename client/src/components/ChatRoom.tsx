import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Message, User } from "../types";

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

  return (
    <div className="main-pane">
      <div className="chat-header">
        <div>
          <div style={{ fontWeight: 700 }}>
            {channelName || "Select a channel"}
          </div>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Messages from the last 10 days
          </div>
        </div>
        {currentUser?.isAdmin && <span className="badge admin">Admin</span>}
      </div>
      <div className="messages">
        {messages.map((msg) => {
          const isMe = currentUser?.visitorId === msg.senderVisitorId;
          const cls = msg.system ? "system" : isMe ? "me" : "other";
          return (
            <div key={msg._id} className={`message ${cls}`}>
              {!msg.system && (
                <div className="message-meta">
                  <strong>{msg.senderUsername}</strong>
                  <span>{dayjs(msg.timestamp).fromNow()}</span>
                  {isMe && <span className="badge">You</span>}
                </div>
              )}
              {msg.system && (
                <div
                  className="message-meta"
                  style={{ justifyContent: "center" }}
                >
                  {dayjs(msg.timestamp).fromNow()}
                </div>
              )}
              <div className="message-content">{msg.content}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
