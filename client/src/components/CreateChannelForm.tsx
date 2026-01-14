import { useState } from "react";

interface Props {
  onCreate: (name: string) => void;
  onSuggest: () => Promise<string> | string;
}

export const CreateChannelForm = ({ onCreate, onSuggest }: Props) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  const handleSuggest = async () => {
    const suggestion = await onSuggest();
    setName(suggestion);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        className="input"
        placeholder="Create or join a channel"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="button secondary"
        type="button"
        onClick={handleSuggest}
      >
        Suggest
      </button>
      <button className="button" type="submit">
        Create
      </button>
    </form>
  );
};
