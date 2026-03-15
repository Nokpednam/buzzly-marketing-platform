import { useState } from "react";
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformName: string;
  platformSlug: string;
  onSubmit: (apiKey: string) => void;
  isPending: boolean;
  mode?: "connect" | "update";
}

const PLATFORM_DOCS: Record<string, string> = {
  facebook: "https://developers.facebook.com/docs/marketing-api/",
  instagram: "https://developers.facebook.com/docs/instagram-api/",
  tiktok: "https://ads.tiktok.com/marketing_api/docs",
  shopee: "https://open.shopee.com/developer-guide/",
  google: "https://developers.google.com/google-ads/api/docs/start",
};

export function ApiKeyDialog({
  open,
  onOpenChange,
  platformName,
  platformSlug,
  onSubmit,
  isPending,
  mode = "connect",
}: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const docsUrl = PLATFORM_DOCS[platformSlug];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey.trim());
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      if (!nextOpen) setApiKey("");
      onOpenChange(nextOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-4 w-4 text-primary" />
            </div>
            {mode === "update" ? `อัปเดต API Key — ${platformName}` : `เชื่อมต่อ ${platformName}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "update"
              ? `ใส่ API Key ใหม่สำหรับ ${platformName} เพื่ออัปเดตการเชื่อมต่อ`
              : `ใส่ API Key ของคุณเพื่อเชื่อมต่อ ${platformName} และซิงค์ข้อมูลโฆษณา`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={`sk_live_••••••••`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-sm"
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showKey ? "ซ่อน API Key" : "แสดง API Key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              API Key จะถูกเข้ารหัสก่อนบันทึก ไม่มีการแสดงในรูปแบบ plain text
            </p>
          </div>

          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              วิธีขอรับ API Key จาก {platformName}
            </a>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={!apiKey.trim() || isPending}>
              {isPending ? "กำลังเชื่อมต่อ..." : mode === "update" ? "อัปเดต" : "เชื่อมต่อ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
