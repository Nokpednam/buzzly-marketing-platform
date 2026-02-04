import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Activity,
  ClipboardList,
  ShieldCheck,
  Building2,
  Users,
  HeadphonesIcon,
  Award,
} from "lucide-react";

const adminNavItems = [
  {
    title: "Monitor Dashboard",
    icon: Activity,
    href: "/admin/monitor",
    description: "System & Data Health",
  },
  {
    title: "Audit Logs",
    icon: ClipboardList,
    href: "/admin/audit-logs",
    description: "User Activity History",
  },
  {
    title: "Workspaces",
    icon: Building2,
    href: "/admin/workspaces",
    description: "Manage All Workspaces",
  },
  {
    title: "Members",
    icon: Users,
    href: "/admin/members",
    description: "Members & Invitations",
  },
  {
    title: "Tier Management",
    icon: Award,
    href: "/admin/tier-management",
    description: "Loyalty Tier & Fraud",
  },
  {
    title: "Support",
    icon: HeadphonesIcon,
    href: "/admin/support",
    description: "Error Logs & Issues",
  },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-2 px-4 py-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-bold text-lg">Admin Portal</h2>
              <p className="text-xs text-muted-foreground">Developer Tools</p>
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
