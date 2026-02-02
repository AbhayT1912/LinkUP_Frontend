import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { CreatePostModal } from "./CreatePostModal";
import { CreateStoryModal } from "./CreateStoryModal";
import { EditProfileModal } from "./EditProfileModal";
import { NotificationDropdown } from "./NotificationDropdown";
import { getMyProfile } from "../services/user.service";

interface LayoutProps {
  children: (props: {
    onCreateStory: () => void;
    onEditProfile: () => void;
  }) => React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hideMobileHeader, setHideMobileHeader] = useState(false);

  /* Load user profile */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    loadProfile();
  }, []);

  /* Hide mobile header on scroll down */
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 60) {
        setHideMobileHeader(true);
      } else {
        setHideMobileHeader(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreatePost={() => setCreatePostOpen(true)}
      />

      {/* MOBILE HEADER */}
      {/* MOBILE HEADER — FULL VIEWPORT WIDTH */}
<header
  className={`
    lg:hidden
    fixed top-0 left-0 right-0 z-40 h-16
    bg-white/80 dark:bg-gray-800/80
    backdrop-blur-md
    border-b border-gray-200 dark:border-gray-700
    transition-transform duration-300
    ${hideMobileHeader ? "-translate-y-full" : "translate-y-0"}
  `}
>
  {/* Full-width flex container */}
  <div className="h-full flex items-center justify-between px-4">
    {/* Menu */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
    >
      <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>

    {/* Bell + Profile Icons */}
    <div className="flex items-center gap-2">
      <NotificationDropdown />
      {currentUser && (
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <img
            src={currentUser.avatar || "https://via.placeholder.com/24"}
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>
      )}
    </div>
  </div>
</header>


      {/* DESKTOP LAYOUT */}
      <div className="flex">
        {/* Sidebar spacer (DESKTOP ONLY) */}
        <div className="hidden lg:block w-64 flex-shrink-0" />

        {/* Content rail */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-7xl px-4 py-6 lg:px-8 relative">
            {/* Desktop notification + profile aligned to content */}
            <div className="hidden lg:block fixed top-4 right-4 z-40 flex items-center gap-3">
              <NotificationDropdown />
              {currentUser && (
                <button
                  onClick={() => navigate("/profile")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <img
                    src={currentUser.avatar || "https://via.placeholder.com/24"}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </button>
              )}
            </div>

            <main>
              {children({
                onCreateStory: () => setCreateStoryOpen(true),
                onEditProfile: () => setEditProfileOpen(true),
              })}
            </main>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
      <CreateStoryModal
        isOpen={createStoryOpen}
        onClose={() => setCreateStoryOpen(false)}
      />
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </div>
  );
}
