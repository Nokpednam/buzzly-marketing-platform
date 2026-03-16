import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Bell, 
    Archive, 
    Trash2, 
    RefreshCcw, 
    CheckCheck, 
    Inbox,
    Info,
    MoreHorizontal,
    X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationsManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: "dev" | "support" | "owner";
}

export function NotificationsManagerDialog({ 
    open, 
    onOpenChange,
    role = "dev" 
}: NotificationsManagerDialogProps) {
    const [currentTab, setCurrentTab] = useState("active");
    
    // Map tab names to hook filters
    const hookFilter = currentTab === "unread" ? "unread" : 
                       currentTab === "read" ? "read" : 
                       currentTab === "trash" ? "trash" : "active";

    const { 
        notifications, 
        isLoading,
        markAsRead, 
        markAllAsRead,
        archiveNotifications,
        deleteNotifications,
        restoreNotifications,
        permanentlyDeleteNotifications 
    } = useNotifications(role, hookFilter as any);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkMarkRead = () => {
        selectedIds.forEach(id => markAsRead(id));
        setSelectedIds([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col sm:rounded-3xl border-slate-200/60 shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b border-slate-100/80 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-blue-500/10 p-1.5 rounded-lg">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                </span>
                                Notification Center
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-1 text-xs">
                                Manage your system alerts and logs efficiently
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 pr-6">
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-xs h-8 font-medium hover:bg-slate-100" onClick={() => markAllAsRead()}>
                                <CheckCheck className="h-4 w-4 mr-1.5" />
                                Mark all as read
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="active" className="flex-1 flex flex-col min-h-0" onValueChange={(v) => {
                    setCurrentTab(v);
                    setSelectedIds([]);
                }}>
                    <div className="px-6 py-3 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
                        <TabsList className="bg-slate-200/50 p-0.5 rounded-xl h-9">
                            <TabsTrigger value="active" className="rounded-lg text-xs h-8 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                            <TabsTrigger value="unread" className="rounded-lg text-xs h-8 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Unread</TabsTrigger>
                            <TabsTrigger value="read" className="rounded-lg text-xs h-8 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Read</TabsTrigger>
                            <TabsTrigger value="trash" className="rounded-lg text-xs h-8 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Trash</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 min-w-[200px] justify-end">
                            {selectedIds.length > 0 ? (
                                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    {currentTab !== "trash" ? (
                                        <>
                                            {currentTab !== "read" && (
                                                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] px-3 border-slate-200" onClick={handleBulkMarkRead}>
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] px-3 border-slate-200" onClick={() => {
                                            restoreNotifications(selectedIds);
                                            setSelectedIds([]);
                                        }}>
                                            <RefreshCcw className="h-3 w-3 mr-1.5" />
                                            Restore
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] px-3 bg-red-50 border-red-100 text-red-600 hover:bg-red-100" onClick={() => {
                                        deleteNotifications(selectedIds);
                                        setSelectedIds([]);
                                    }}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                    {currentTab === 'active' ? 'ALL' : currentTab.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 bg-white">
                        {currentTab === "trash" && (
                            <div className="bg-amber-50/60 border-b border-amber-100/50 px-6 py-2.5 flex items-center gap-2.5 text-[11px] text-amber-700">
                                <Info className="h-3.5 w-3.5" />
                                Notifications in Trash will be automatically deleted after 15 days.
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[300px] space-y-3">
                                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-400">Loading...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-slate-400 px-10 text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <Inbox className="h-8 w-8 opacity-40 text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">No items found</p>
                                <p className="text-[11px] mt-1 max-w-[200px]">Everything is caught up.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100/60">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={cn(
                                            "group flex items-start gap-3 p-5 hover:bg-slate-50/80 transition-all duration-200 relative",
                                            !n.is_read && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className="pt-1 select-none">
                                            <Checkbox 
                                                checked={selectedIds.includes(n.id)}
                                                onCheckedChange={() => toggleSelect(n.id)}
                                                className="rounded-md h-4 w-4 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                            />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 pr-10">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={cn(
                                                    "text-sm font-bold truncate leading-none",
                                                    !n.is_read ? "text-slate-900" : "text-slate-600"
                                                )}>
                                                    {n.title}
                                                </h3>
                                                {!n.is_read && (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                                                )}
                                            </div>
                                            <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                {n.body}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2.5">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100/60 px-1.5 py-0.5 rounded">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </span>
                                                <span className="text-[9px] uppercase tracking-widest text-blue-500/80 font-bold">
                                                    #{n.type.split('_').pop()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="absolute right-4 top-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200/60">
                                                    {!n.is_read && (
                                                        <DropdownMenuItem 
                                                            className="text-xs font-medium focus:bg-blue-50 focus:text-blue-600 cursor-pointer"
                                                            onClick={() => markAsRead(n.id)}
                                                        >
                                                            <CheckCheck className="h-3.5 w-3.5 mr-2" />
                                                            Mark as read
                                                        </DropdownMenuItem>
                                                    )}
                                                    {currentTab === "trash" ? (
                                                        <DropdownMenuItem 
                                                            className="text-xs font-medium focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer"
                                                            onClick={() => restoreNotifications([n.id])}
                                                        >
                                                            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
                                                            Restore
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    <DropdownMenuItem 
                                                        className="text-xs font-medium text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                                        onClick={() => (currentTab === "trash" ? permanentlyDeleteNotifications([n.id]) : deleteNotifications([n.id]))}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        {currentTab === "trash" ? "Delete permanently" : "Move to Trash"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Tabs>
                
                <div className="p-4 border-t border-slate-100/50 bg-slate-50/30 flex items-center justify-between text-[10px] text-slate-400 font-medium tracking-wide">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Auto-sync active</span>
                        <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Role: {role.toUpperCase()}</span>
                    </div>
                    {notifications.length > 0 && (
                        <span>Showing {notifications.length} notifications</span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
