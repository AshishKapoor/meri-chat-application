import { Channel, User } from "../types";

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
    <div className="channel-list">
      {channels.map((channel) => {
        const canDelete =
          currentUser &&
          (currentUser.isAdmin || currentUser.visitorId === channel.createdBy);
        return (
          <div
            key={channel._id}
            className="channel-card"
            onClick={() => onJoin(channel._id)}
            style={{
              border:
                currentChannelId === channel._id
                  ? "1px solid #38bdf8"
                  : "1px solid transparent",
            }}
          >
            <div>
              <div className="channel-name">{channel.name}</div>
              <div className="channel-meta">
                {channel.memberCount ?? 0} online · created{" "}
                {new Date(channel.createdAt).toLocaleString()}
              </div>
            </div>
            {canDelete && (
              <button
                className="button danger"
                style={{ padding: "6px 10px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(channel._id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
