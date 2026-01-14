import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string | null;
}

export const AdminLoginModal = ({ open, onClose, onLogin, error }: Props) => {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Admin Login</h3>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          {error && (
            <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="button secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
