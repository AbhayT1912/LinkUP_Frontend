import { createBrowserRouter, Navigate } from "react-router";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";
import { RegisterPage } from "./pages/Register";

// Protected Route Component
function ProtectedRoute({ Component }: { Component: React.ComponentType<any> }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <Component />;
}


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
      {({ onEditProfile }) => <ProfilePage onEditProfile={onEditProfile} />}
    </Layout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: localStorage.getItem("token") ? <Root /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/messages",
    element: localStorage.getItem("token") ? <Messages /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/connections",
    element: localStorage.getItem("token") ? <Connections /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/discover",
    element: localStorage.getItem("token") ? <Discover /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/profile",
    element: localStorage.getItem("token") ? <Profile /> : <Navigate to="/auth" replace />,
  },
]);
