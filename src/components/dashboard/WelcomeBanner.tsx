import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Sparkles } from "lucide-react";

export function WelcomeBanner() {
  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">New Feature</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Haven't installed the extension yet?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-md">
              Get targeted contact and company information on LinkedIn, Company website and CRM.
              Boost your lead generation today!
            </p>
            <div className="flex items-center gap-3">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Install Chrome Extension
              </Button>
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative h-40 w-64">
              <div className="absolute right-0 top-0 h-32 w-48 rounded-lg bg-card shadow-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded bg-primary/20" />
                  <div className="h-6 w-16 rounded bg-success/20" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-20 w-32 rounded-lg bg-card shadow-lg p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded bg-success/30" />
                  <span className="text-xs text-muted-foreground">Ready to go</span>
                </div>
                <div className="h-8 w-full rounded bg-gradient-to-r from-success/30 to-success/10" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
