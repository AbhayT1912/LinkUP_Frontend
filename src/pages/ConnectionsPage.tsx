import { useState } from "react";
import { Users, UserPlus, Clock, UserCheck } from "lucide-react";
import { UserCard } from "../components/UserCard";
import { users } from "../data/dummyData";

type Tab = "all" | "followers" | "following" | "pending";

export function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const stats = [
    { label: "Followers", value: "12.5K", icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "Following", value: "847", icon: UserCheck, color: "from-blue-500 to-purple-500" },
    { label: "Pending", value: "23", icon: Clock, color: "from-pink-500 to-orange-500" },
    { label: "Connections", value: "5.2K", icon: UserPlus, color: "from-green-500 to-blue-500" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All Connections" },
    { id: "followers", label: "Followers" },
    { id: "following", label: "Following" },
    { id: "pending", label: "Pending" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard key={user.id} user={user} showFollowButton={true} />
        ))}
      </div>
    </div>
  );
}
