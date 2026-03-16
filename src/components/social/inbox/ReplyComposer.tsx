import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReplyComposerProps {
  onSubmit: (replyText: string) => Promise<void>;
  isPending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ReplyComposer({
  onSubmit,
  isPending,
  disabled = false,
  placeholder = "Write a reply...",
}: ReplyComposerProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    await onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = text.trim().length > 0 && !isPending && !disabled;

  return (
    <div className="p-4 border-t border-border/40 bg-white dark:bg-slate-900">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isPending}
          rows={3}
          className={cn(
            "resize-none pr-12 text-sm rounded-xl border-border/60 focus:ring-primary/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="absolute bottom-2.5 right-2.5 h-7 w-7 p-0 rounded-lg"
          aria-label="Send reply"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Press <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Ctrl</kbd>+
        <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Enter</kbd> to send
      </p>
    </div>
  );
}
