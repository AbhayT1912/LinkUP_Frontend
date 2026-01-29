export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
  coverImage: string;
  joinDate: string;
  status?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
    totalVotes: number;
    endsAt: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  liked?: boolean;
  type: "text" | "image" | "video" | "poll";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  image?: string;
}

export interface Conversation {
  userId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Story {
  id: string;
  userId: string;
  image: string;
  timestamp: string;
}

export const currentUser: User = {
  id: "1",
  name: "Alex Morgan",
  username: "@alexmorgan",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  bio: "Designer & Creative Thinker ✨ | Building beautiful experiences | Coffee enthusiast ☕",
  location: "San Francisco, CA",
  verified: true,
  followers: 12543,
  following: 847,
  posts: 234,
  coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
  joinDate: "January 2024"
};

export const users: User[] = [
  {
    id: "2",
    name: "Sarah Johnson",
    username: "@sarahjohnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    bio: "Product Designer @ TechCorp | UX Enthusiast | Spreading positivity 🌸",
    location: "New York, NY",
    verified: true,
    followers: 8234,
    following: 532,
    posts: 189,
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    joinDate: "March 2023",
    status: "Available for collaboration"
  },
  {
    id: "3",
    name: "Michael Chen",
    username: "@michaelchen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Full-stack Developer | Tech blogger | Open source contributor 💻",
    location: "Seattle, WA",
    verified: false,
    followers: 5421,
    following: 623,
    posts: 156,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop",
    joinDate: "June 2023",
    status: "Building something cool"
  },
  {
    id: "4",
    name: "Emma Williams",
    username: "@emmawilliams",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    bio: "Marketing Specialist | Content Creator | Travel lover 🌍",
    location: "Los Angeles, CA",
    verified: true,
    followers: 15234,
    following: 923,
    posts: 421,
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    joinDate: "February 2023",
    status: "Currently traveling"
  },
  {
    id: "5",
    name: "James Rodriguez",
    username: "@jamesrodriguez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Entrepreneur | Startup Founder | Mentor | Making ideas happen 🚀",
    location: "Austin, TX",
    verified: true,
    followers: 23421,
    following: 1234,
    posts: 567,
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop",
    joinDate: "January 2022",
    status: "Open to new opportunities"
  },
  {
    id: "6",
    name: "Olivia Taylor",
    username: "@oliviataylor",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    bio: "Graphic Designer | Illustrator | Art is life 🎨",
    location: "Portland, OR",
    verified: false,
    followers: 6789,
    following: 456,
    posts: 234,
    coverImage: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1200&h=400&fit=crop",
    joinDate: "May 2023",
    status: "Taking commissions"
  },
  {
    id: "7",
    name: "Daniel Kim",
    username: "@danielkim",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    bio: "Data Scientist | AI Researcher | Python lover 🐍",
    location: "Boston, MA",
    verified: false,
    followers: 4532,
    following: 321,
    posts: 145,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop",
    joinDate: "August 2023",
    status: "Learning new things"
  },
  {
    id: "8",
    name: "Sophia Martinez",
    username: "@sophiamartinez",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
    bio: "Photographer | Visual Storyteller | Capturing moments 📸",
    location: "Miami, FL",
    verified: true,
    followers: 19234,
    following: 876,
    posts: 654,
    coverImage: "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=1200&h=400&fit=crop",
    joinDate: "November 2022",
    status: "Booking for 2026"
  }
];

export const posts: Post[] = [
  {
    id: "1",
    userId: "2",
    content: "Just finished designing a new dashboard for our product! The journey from wireframes to high-fidelity designs was incredible. Can't wait to see it in production 🎨✨ #Design #UX #ProductDesign",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: "2h ago",
    liked: false,
    type: "image"
  },
  {
    id: "2",
    userId: "3",
    content: "What's the best programming language for beginners in 2026? Let's settle this debate! 🤔💻",
    poll: {
      question: "What's the best programming language for beginners?",
      options: [
        { id: "1", text: "Python", votes: 342 },
        { id: "2", text: "JavaScript", votes: 256 },
        { id: "3", text: "Java", votes: 123 },
        { id: "4", text: "Go", votes: 89 }
      ],
      totalVotes: 810,
      endsAt: "2 days left"
    },
    likes: 189,
    comments: 32,
    shares: 8,
    timestamp: "5h ago",
    liked: true,
    type: "poll"
  },
  {
    id: "3",
    userId: "4",
    content: "Sunset vibes from Santorini 🌅 Sometimes you just need to disconnect and enjoy the moment. Travel is the best teacher! #Travel #Wanderlust #Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    likes: 1523,
    comments: 87,
    shares: 45,
    timestamp: "1d ago",
    liked: true,
    type: "image"
  },
  {
    id: "4",
    userId: "5",
    content: "Behind the scenes of our latest product shoot! 🎥 Check out how we created this amazing content. #BTS #ProductionLife #ContentCreation",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 892,
    comments: 156,
    shares: 34,
    timestamp: "1d ago",
    liked: false,
    type: "video"
  },
  {
    id: "5",
    userId: "6",
    content: "Which design trend will dominate 2026? Cast your vote! 🎨✨",
    poll: {
      question: "Which design trend will dominate 2026?",
      options: [
        { id: "1", text: "Glassmorphism", votes: 543 },
        { id: "2", text: "3D Elements", votes: 678 },
        { id: "3", text: "Minimalism", votes: 892 },
        { id: "4", text: "Retro/Vintage", votes: 234 }
      ],
      totalVotes: 2347,
      endsAt: "5 days left"
    },
    likes: 456,
    comments: 67,
    shares: 23,
    timestamp: "2d ago",
    liked: false,
    type: "poll"
  },
  {
    id: "6",
    userId: "8",
    content: "Golden hour magic ✨ There's something special about that perfect light. Shot this at the beach yesterday. #Photography #GoldenHour #Nature",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    likes: 2341,
    comments: 123,
    shares: 67,
    timestamp: "2d ago",
    liked: true,
    type: "image"
  },
  {
    id: "7",
    userId: "7",
    content: "Quick tutorial on building your first neural network! 🧠 Full video on my channel. #AI #MachineLearning #Tutorial",
    video: "https://www.w3schools.com/html/movie.mp4",
    likes: 345,
    comments: 43,
    shares: 19,
    timestamp: "3d ago",
    liked: false,
    type: "video"
  }
];

export const stories: Story[] = [
  {
    id: "1",
    userId: "2",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=700&fit=crop",
    timestamp: "3h ago"
  },
  {
    id: "2",
    userId: "3",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=700&fit=crop",
    timestamp: "5h ago"
  },
  {
    id: "3",
    userId: "4",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=700&fit=crop",
    timestamp: "8h ago"
  },
  {
    id: "4",
    userId: "8",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=700&fit=crop",
    timestamp: "12h ago"
  }
];

export const conversations: Conversation[] = [
  {
    userId: "2",
    lastMessage: "That sounds great! Let's schedule a call",
    timestamp: "2m ago",
    unread: 2
  },
  {
    userId: "4",
    lastMessage: "Thanks for the feedback! 🙏",
    timestamp: "1h ago",
    unread: 0
  },
  {
    userId: "5",
    lastMessage: "Would love to collaborate on this",
    timestamp: "3h ago",
    unread: 1
  },
  {
    userId: "8",
    lastMessage: "Sent you the files",
    timestamp: "1d ago",
    unread: 0
  }
];

export const messages: { [key: string]: Message[] } = {
  "2": [
    {
      id: "1",
      senderId: "2",
      receiverId: "1",
      content: "Hey! I saw your latest design work. Really impressive!",
      timestamp: "10:30 AM"
    },
    {
      id: "2",
      senderId: "1",
      receiverId: "2",
      content: "Thank you so much! That means a lot coming from you 😊",
      timestamp: "10:32 AM"
    },
    {
      id: "3",
      senderId: "2",
      receiverId: "1",
      content: "Would you be interested in collaborating on a project?",
      timestamp: "10:35 AM"
    },
    {
      id: "4",
      senderId: "1",
      receiverId: "2",
      content: "That sounds great! Let's schedule a call",
      timestamp: "10:45 AM"
    }
  ],
  "4": [
    {
      id: "1",
      senderId: "1",
      receiverId: "4",
      content: "Loved your travel photos from Greece!",
      timestamp: "Yesterday"
    },
    {
      id: "2",
      senderId: "4",
      receiverId: "1",
      content: "Thanks for the feedback! 🙏",
      timestamp: "Yesterday"
    }
  ],
  "5": [
    {
      id: "1",
      senderId: "5",
      receiverId: "1",
      content: "I have an interesting opportunity to discuss",
      timestamp: "2 days ago"
    },
    {
      id: "2",
      senderId: "1",
      receiverId: "5",
      content: "I'm interested! Tell me more",
      timestamp: "2 days ago"
    },
    {
      id: "3",
      senderId: "5",
      receiverId: "1",
      content: "Would love to collaborate on this",
      timestamp: "2 days ago"
    }
  ]
};

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  userId: string;
  content: string;
  timestamp: string;
  read: boolean;
  postId?: string;
}

export const notifications: Notification[] = [
  {
    id: "1",
    type: "like",
    userId: "2",
    content: "liked your post",
    timestamp: "5m ago",
    read: false,
    postId: "1"
  },
  {
    id: "2",
    type: "follow",
    userId: "5",
    content: "started following you",
    timestamp: "1h ago",
    read: false
  },
  {
    id: "3",
    type: "comment",
    userId: "4",
    content: "commented on your post",
    timestamp: "3h ago",
    read: false,
    postId: "3"
  },
  {
    id: "4",
    type: "like",
    userId: "8",
    content: "liked your post",
    timestamp: "5h ago",
    read: true,
    postId: "2"
  },
  {
    id: "5",
    type: "mention",
    userId: "3",
    content: "mentioned you in a comment",
    timestamp: "1d ago",
    read: true,
    postId: "5"
  },
  {
    id: "6",
    type: "follow",
    userId: "6",
    content: "started following you",
    timestamp: "2d ago",
    read: true
  }
];