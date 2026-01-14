import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles } from "lucide-react";

interface Props {
  onCreate: (name: string) => void;
  onSuggest: () => Promise<string> | string;
}

export const CreateChannelForm = ({ onCreate, onSuggest }: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  const handleSuggest = async () => {
    setLoading(true);
    const suggestion = await onSuggest();
    setName(suggestion);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Create a channel..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleSuggest}
        disabled={loading}
        className="gap-2"
        aria-label="Suggest channel name"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Suggest</span>
      </Button>
      <Button type="submit" size="icon" aria-label="Create channel">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};
