import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";
import { RegisterPage } from "./pages/Register";

/* =========================
   HELPERS
   ========================= */

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/* =========================
   LAYOUT WRAPPERS
   ========================= */

function Root() {
  return (
    <Layout>
      {({ onCreateStory, onEditProfile }) => (
        <FeedPage onCreateStory={onCreateStory} />
      )}
    </Layout>
  );
}

function Messages() {
  return (
    <Layout>
      {() => <MessagesPage />}
    </Layout>
  );
}

function Connections() {
  return (
    <Layout>
      {() => <ConnectionsPage />}
    </Layout>
  );
}

function Discover() {
  return (
    <Layout>
      {() => <DiscoverPage />}
    </Layout>
  );
}

function Profile() {
  return (
    <Layout>
      {({ onEditProfile }) => (
        <ProfilePage onEditProfile={onEditProfile} />
      )}
    </Layout>
  );
}

/* =========================
   ROUTER
   ========================= */

export const router = createBrowserRouter([
  {
    path: "/",
    element: isAuthenticated() ? <Root /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/messages",
    element: isAuthenticated() ? <Messages /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/connections",
    element: isAuthenticated() ? (
      <Connections />
    ) : (
      <Navigate to="/auth" replace />
    ),
  },
  {
    path: "/discover",
    element: isAuthenticated() ? <Discover /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/profile",
    element: isAuthenticated() ? <Profile /> : <Navigate to="/auth" replace />,
  },
]);
