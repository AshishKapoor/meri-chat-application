import { useState } from "react";

interface Props {
  onSubmit: (username: string) => void;
}

export const UsernameForm = ({ onSubmit }: Props) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        className="input"
        placeholder="Pick a name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button className="button" type="submit">
        Join
      </button>
    </form>
  );
};
