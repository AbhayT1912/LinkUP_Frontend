import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Users,
  Compass,
  User,
  Plus,
  X,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { currentUser } from "../data/dummyData";
import { useTheme } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: () => void;
}

export function Sidebar({ isOpen, onClose, onCreatePost }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/connections", icon: Users, label: "Connections" },
    { path: "/discover", icon: Compass, label: "Discover" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="relative flex justify-center p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" aria-label="Home">
            <div
              className={`
                rounded-full bg-white shadow-md ring-1 ring-gray-200
                transition-all duration-300 hover:scale-105
                ${scrolled ? "p-2" : "p-3"}
              `}
            >
              <img
                src={logo}
                alt="LinkUp Logo"
                className={`transition-all duration-300 ${scrolled ? "w-10 h-10" : "w-14 h-14"}`}
              />
            </div>
          </Link>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);

            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center h-12 rounded-xl transition
                  ${active
                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                `}
              >
                {/* ICON COLUMN — DO NOT TOUCH */}
                <div className="w-20 flex justify-center">
                  <Icon className="w-5 h-5" />
                </div>

                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}

          {/* Create Post */}
          <button
            onClick={() => {
              onCreatePost();
              onClose();
            }}
            className="mt-4 flex items-center h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white transition hover:opacity-90"
          >
            <div className="w-20 flex justify-center">
              <Plus className="w-5 h-5" />
            </div>
            {!collapsed && <span>Create Post</span>}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mt-3 flex items-center h-12 w-full rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="w-20 flex justify-center">
              {theme === "dark" ? <Sun /> : <Moon />}
            </div>
            {!collapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <Link
            to="/profile"
            className="flex items-center h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="w-20 flex justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.username}
                </p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
