import * as React from "react";
import { Bot, MessageSquare } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

// This is sample data.
const data = {
  user: {
    name: "sleever",
    email: "m@sleever.ai",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "sleever",
      logo: Bot,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Agents",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "My Agents",
          url: "my-agents",
        },
        {
          title: "Create Agent",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Chats",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Saved",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
      <div className="p-4 space-y-4">
        <nav className="space-y-2">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent"
          >
            Home
          </Link>
          <Link
            to="/my-agents"
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent"
          >
            My Agents
          </Link>
        </nav>
      </div>
    </Sidebar>
  );
}
