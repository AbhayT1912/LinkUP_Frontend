import { createBrowserRouter } from "react-router";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";

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
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/",
    Component: Root,
  },
  {
    path: "/messages",
    Component: Messages,
  },
  {
    path: "/connections",
    Component: Connections,
  },
  {
    path: "/discover",
    Component: Discover,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
