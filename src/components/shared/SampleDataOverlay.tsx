import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SampleDataOverlayProps {
  children: ReactNode;
  isConnected: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export function SampleDataOverlay({
  children,
  isConnected,
  title = "Sample Data Preview",
  description = "Connect your platforms to see real data",
  ctaLabel = "Connect Platforms",
  ctaLink = "/api-keys",
}: SampleDataOverlayProps) {
  const navigate = useNavigate();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg border bg-card shadow-lg">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button onClick={() => navigate(ctaLink)} className="gap-2">
            <Link2 className="h-4 w-4" />
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
