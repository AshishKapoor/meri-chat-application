import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: Props) => {
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form className="input-row" onSubmit={submit}>
      <input
        className="input"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button className="button" type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
};
