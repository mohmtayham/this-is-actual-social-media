"use client";

import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Home,
  Lightbulb,
  LogOut,
  Map,
  User,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { WalletSummary } from "@/services/walletService";

type SidebarUser = {
  name: string;
  email?: string;
  profile_image?: string | null;
  role?: string;
};

type SidebarContextValue = {
  expanded: boolean;
  activeItem: string;
  ideaId: string | null;
  unreadCount: number;
  userData: SidebarUser | null;
  wallet: WalletSummary | null;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

type SidebarProps = {
  children: ReactNode;
  activeItem?: string;
  initialUser?: SidebarUser | null;
};

type SidebarItemProps = {
  icon: ReactNode;
  text: string;
  name: string;
  active?: boolean;
  alert?: boolean;
  badge?: number | null;
  onClick?: (name: string, ideaId?: string | null) => void;
  ideaId?: string | null;
};

const sidebarRoutes = (ideaId: string | null) => ({
  home: "/",
  profile: "/profile",
  ideas: "/profile",
  timeline: ideaId ? `/ideas/${ideaId}/roadmap` : "/profile",
  reports: ideaId ? `/ideas/${ideaId}/reports` : "/profile",
  meetings: ideaId ? `/ideas/${ideaId}/meeting` : "/profile",
  notifications: "/profile",
  transactions: "/profile",
});

export default function AppSidebar({
  children,
  activeItem = "home",
  initialUser = null,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [expanded, setExpanded] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [loading] = useState(false);
  const [userData] = useState<SidebarUser | null>(initialUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);

  const ideaId = useMemo(() => {
    const match = pathname?.match(/\/ideas\/(\d+)/);
    if (match?.[1]) return match[1];

    if (typeof window !== "undefined") {
      return localStorage.getItem("lastIdeaId");
    }

    return null;
  }, [pathname]);

  useEffect(() => {
    setHydrated(true);
    const saved = localStorage.getItem("sidebar_expanded");
    if (saved !== null) {
      setExpanded(saved === "true");
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("sidebar_expanded", String(expanded));
  }, [expanded, hydrated]);

  useEffect(() => {
    if (ideaId) localStorage.setItem("lastIdeaId", ideaId);
  }, [ideaId]);

  useEffect(() => {
    // Keep sidebar stable: avoid client auth calls that rely on localStorage token.
    setUnreadCount(0);
    setWallet(null);
  }, []);

  const handleLogout = () => {
    router.push("/auth/signout");
  };

  const imageSrc = useMemo(() => {
    if (!userData?.profile_image) return null;
    if (
      userData.profile_image.startsWith("http://") ||
      userData.profile_image.startsWith("https://") ||
      userData.profile_image.startsWith("/")
    ) {
      return userData.profile_image;
    }
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/${userData.profile_image.replace(/^\/+/, "")}`;
  }, [userData?.profile_image]);

  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      expanded,
      activeItem,
      ideaId,
      unreadCount,
      userData,
      wallet,
    }),
    [expanded, activeItem, ideaId, unreadCount, userData, wallet],
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-700 bg-gray-900 shadow-lg transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
      aria-label="Main sidebar"
    >
      <div
        className="flex cursor-pointer flex-col items-start border-b border-gray-700 p-4"
        onClick={() => router.push("/")}
      >
        {expanded ? (
          <>
            <span className="text-3xl font-black leading-[0.8] tracking-tight text-[#f87115]">Idea</span>
            <div className="ml-5 mt-0.5 rounded-[2px] bg-[#f87115] px-1.5 py-0.5">
              <span className="text-lg font-black leading-none tracking-tight text-white">2Life</span>
            </div>
          </>
        ) : (
          <span className="text-2xl font-black text-[#f87115]">I2</span>
        )}

        {wallet && expanded && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-800 px-3 py-2">
            <CreditCard size={18} className="text-white" />
            <span className="text-sm font-semibold text-white">Wallet ({wallet.balance} {wallet.currency || "SPY"})</span>
          </div>
        )}
      </div>

      <div className="border-b border-gray-700 p-4">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-orange-500 hover:text-white"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <SidebarContext.Provider value={contextValue}>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <ul className="space-y-2 px-3 py-4 pb-24">{children}</ul>
        </div>
      </SidebarContext.Provider>

      <div className="border-t border-gray-700 bg-gray-900 p-4">
        <div className={`flex items-center ${expanded ? "justify-between" : "justify-center"}`}>
          {loading ? (
            <div className="flex items-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
              {expanded && <div className="ml-3 h-3 w-24 animate-pulse rounded bg-gray-700" />}
            </div>
          ) : (
            <>
              <div className="flex items-center">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={userData?.name || "User"}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-gray-700 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-700 bg-orange-500 font-bold text-white">
                    {userData?.name?.charAt(0) || "U"}
                  </div>
                )}
                {expanded && (
                  <div className="ml-3 max-w-35">
                    <p className="truncate text-sm font-semibold text-white">{userData?.name || "User"}</p>
                    <p className="truncate text-xs text-gray-400">{userData?.role || "IDEA_OWNER"}</p>
                  </div>
                )}
              </div>
              {expanded && (
                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-lg p-2 text-gray-300 transition-colors hover:bg-orange-500 hover:text-white"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export function SidebarItem({
  icon,
  text,
  name,
  active = false,
  alert = false,
  badge = null,
  onClick,
  ideaId,
}: SidebarItemProps) {
  const context = useContext(SidebarContext);
  if (!context) return null;

  const { expanded } = context;

  return (
    <li>
      <button
        onClick={(event) => {
          event.preventDefault();
          onClick?.(name, ideaId);
        }}
        className={`group relative flex w-full items-center rounded-xl p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          active
            ? "bg-orange-500 text-white shadow-md"
            : "text-gray-300 hover:bg-orange-500 hover:text-white hover:shadow-md"
        } ${expanded ? "justify-start pl-4 pr-3" : "justify-center px-3"}`}
      >
        <div className={`flex min-w-5 items-center justify-center ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
          {icon}
        </div>

        {expanded && (
          <>
            <span className="ml-3 flex-1 truncate text-left text-sm font-medium">{text}</span>
            {badge !== null && badge > 0 && (
              <span className="ml-2 flex min-w-6 items-center justify-center rounded-full bg-orange-500 px-2 py-1 text-xs text-white">
                {badge}
              </span>
            )}
          </>
        )}

        {alert && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-gray-900 bg-orange-500" />}

        {!expanded && (
          <div className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {text}
            {badge !== null && badge > 0 ? ` (${badge})` : ""}
          </div>
        )}
      </button>
    </li>
  );
}

export function SidebarItemsList({
  activeItem,
  currentIdeaId,
}: {
  activeItem: string;
  currentIdeaId?: string | null;
}) {
  const context = useContext(SidebarContext);
  const router = useRouter();

  if (!context) return null;

  const ideaId = currentIdeaId || context.ideaId || null;

  const handleItemClick = (name: string, specificIdeaId?: string | null) => {
    const ideaIdToUse = specificIdeaId || ideaId;
    const routes = sidebarRoutes(ideaIdToUse);
    const target = routes[name as keyof typeof routes];
    if (target) router.push(target);
  };

  return (
    <>
      <SidebarItem icon={<Home size={20} />} text="Home" name="home" active={activeItem === "home"} onClick={handleItemClick} />
      <SidebarItem icon={<User size={20} />} text="Account" name="profile" active={activeItem === "profile"} onClick={handleItemClick} />
      <SidebarItem icon={<Lightbulb size={20} />} text="My Ideas" name="ideas" active={activeItem === "ideas"} onClick={handleItemClick} />
      <SidebarItem icon={<Map size={20} />} text="Roadmap" name="timeline" active={activeItem === "timeline" || activeItem === "roadmap"} onClick={handleItemClick} ideaId={ideaId} />
      <SidebarItem icon={<BarChart3 size={20} />} text="Reports" name="reports" active={activeItem === "reports"} onClick={handleItemClick} ideaId={ideaId} />
      <SidebarItem icon={<Calendar size={20} />} text="Meetings" name="meetings" active={activeItem === "meetings"} onClick={handleItemClick} ideaId={ideaId} alert />
      <SidebarItem icon={<Calendar size={20} />} text="Notifications" name="notifications" active={activeItem === "notifications"} onClick={handleItemClick} badge={context.unreadCount} />
      <SidebarItem icon={<DollarSign size={20} />} text="My checks" name="transactions" active={activeItem === "transactions"} onClick={handleItemClick} />
    </>
  );
}
