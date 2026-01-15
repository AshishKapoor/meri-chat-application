import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
        <Input
          placeholder="Pick a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
        />
      </div>
      <Button
        type="submit"
        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
      >
        Join
      </Button>
    </form>
  );
};
