export type PostCategory =
  | "Productivity"
  | "Burnout Prevention"
  | "Digital Safety Habits"
  | "Team Systems";

export type PostItem = {
  slug: string;
  title: string;
  category: PostCategory;
  excerpt: string;
  readTime: string;
  date: string;
  image: string;
  content: string[];
};

const selfCareImages = [
  "/assets/IMG_20220306_141006_017.jpg",
  "/assets/IMG_20220319_123348_274.jpg",
  "/assets/IMG_20210804_143828_719.jpg",
  "/assets/IMG_20210322_152147_311.jpg",
  "/assets/IMG_20201213_113737_777~2.jpg",
  "/assets/IMG_20200716_101417_751~2.jpg",
  "/assets/IMG_1778.jpg",
  "/assets/IMG_1744.jpg",
  "/assets/IMG_0185.jpg",
  "/assets/26efbc9a-e8da-4e84-b753-2d64c7c8a03f.jpg",
  "/assets/2ad4a559-afa1-47f1-8400-37b28fab01eb.jpg",
  "/assets/838ed924-53bb-4a32-a868-57dbaf99edc8.jpg",
];

export const postCategories: PostCategory[] = [
  "Productivity",
  "Burnout Prevention",
  "Digital Safety Habits",
  "Team Systems",
];

export const postsData: PostItem[] = [
  {
    slug: "focus-blocks",
    title: "Focus Blocks: Design Your Deep-Work Window",
    category: "Productivity",
    excerpt: "Protect 90-minute focus blocks with clear boundaries and a reset ritual.",
    readTime: "4 min read",
    date: "Jan 12, 2026",
    image: selfCareImages[0],
    content: [
      "Pick two focus blocks on your calendar and defend them like client time.",
      "Remove notifications and close extra tabs to reduce context switching.",
      "End the block with a 5-minute reset: log progress, note next steps, and step away.",
    ],
  },
  {
    slug: "email-reset",
    title: "Inbox Reset in 20 Minutes",
    category: "Productivity",
    excerpt: "A short routine to clear noise and surface the work that matters.",
    readTime: "3 min read",
    date: "Jan 8, 2026",
    image: selfCareImages[1],
    content: [
      "Create two quick filters: urgent client requests and internal approvals.",
      "Batch replies into a single 15-minute session instead of constant checking.",
      "Move long tasks into your project board to avoid losing them in email threads.",
    ],
  },
  {
    slug: "reset-friday",
    title: "Friday Reset: 30 Minutes to Save Next Week",
    category: "Team Systems",
    excerpt: "End the week with a short reset so Monday starts calm.",
    readTime: "5 min read",
    date: "Jan 5, 2026",
    image: selfCareImages[2],
    content: [
      "Clear your top 3 priority list for next week before you log off.",
      "Close out open tickets by assigning owners and due dates.",
      "Send a quick status note to your team so everyone starts aligned.",
    ],
  },
  {
    slug: "safe-passwords",
    title: "Password Hygiene That Actually Sticks",
    category: "Digital Safety Habits",
    excerpt: "Small changes that make passwords stronger without slowing you down.",
    readTime: "4 min read",
    date: "Dec 28, 2025",
    image: selfCareImages[3],
    content: [
      "Use a password manager to generate unique logins for every tool.",
      "Turn on MFA for finance, admin, and email accounts first.",
      "Schedule a quarterly reminder to audit shared accounts and remove old users.",
    ],
  },
  {
    slug: "screen-fatigue",
    title: "Reduce Screen Fatigue with a 20-20-20 Plan",
    category: "Burnout Prevention",
    excerpt: "A simple cadence to reduce eye strain and mental fatigue.",
    readTime: "3 min read",
    date: "Dec 20, 2025",
    image: selfCareImages[4],
    content: [
      "Every 20 minutes, look at something 20 feet away for 20 seconds.",
      "Stand up, roll your shoulders, and reset your posture.",
      "Bundle small breaks together so the habit becomes automatic.",
    ],
  },
  {
    slug: "team-standup",
    title: "Tight Daily Standups in 12 Minutes",
    category: "Team Systems",
    excerpt: "Keep teams aligned without wasting the morning.",
    readTime: "4 min read",
    date: "Dec 14, 2025",
    image: selfCareImages[5],
    content: [
      "Answer three prompts only: yesterday, today, blockers.",
      "Use a shared board so the update stays visual.",
      "Park deeper discussions into a separate follow-up huddle.",
    ],
  },
  {
    slug: "device-hygiene",
    title: "Device Hygiene for Remote Teams",
    category: "Digital Safety Habits",
    excerpt: "Keep laptops and phones secure without extra friction.",
    readTime: "5 min read",
    date: "Dec 6, 2025",
    image: selfCareImages[6],
    content: [
      "Install updates weekly and reboot devices to apply security patches.",
      "Back up critical files to approved cloud storage.",
      "Report lost or stolen devices immediately so access can be revoked.",
    ],
  },
  {
    slug: "meeting-fatigue",
    title: "Meeting Fatigue: Cut 30% Without Losing Sync",
    category: "Burnout Prevention",
    excerpt: "Reduce fatigue by replacing status meetings with async updates.",
    readTime: "6 min read",
    date: "Nov 28, 2025",
    image: selfCareImages[7],
    content: [
      "Run weekly async check-ins using a shared template.",
      "Keep decision meetings short with clear agendas and outcomes.",
      "Protect blocks of no-meeting time for critical work.",
    ],
  },
  {
    slug: "handover-checklist",
    title: "A 10-Point Handover Checklist",
    category: "Team Systems",
    excerpt: "Reduce operational risk with a consistent handover routine.",
    readTime: "4 min read",
    date: "Nov 20, 2025",
    image: selfCareImages[8],
    content: [
      "Document access, passwords, and device locations.",
      "List open tickets and owners before transitions.",
      "Add a quick diagram for network changes or hardware updates.",
    ],
  },
  {
    slug: "support-desk-rules",
    title: "Support Desk Rules That Reduce Stress",
    category: "Burnout Prevention",
    excerpt: "Protect your team with clear escalation and response rules.",
    readTime: "5 min read",
    date: "Nov 11, 2025",
    image: selfCareImages[9],
    content: [
      "Define what counts as urgent vs routine to avoid chaos.",
      "Rotate on-call duty so no one stays in constant response mode.",
      "Track recurring issues and build small fixes into your roadmap.",
    ],
  },
  {
    slug: "wifi-habits",
    title: "Wi-Fi Habits That Keep Teams Productive",
    category: "Productivity",
    excerpt: "Simple behavior tweaks to reduce network slowdowns.",
    readTime: "3 min read",
    date: "Nov 4, 2025",
    image: selfCareImages[10],
    content: [
      "Schedule large file uploads outside peak hours.",
      "Use wired connections for video-heavy sessions when possible.",
      "Report dead zones early so the network can be tuned quickly.",
    ],
  },
  {
    slug: "phishing-drill",
    title: "Run a 15-Minute Phishing Drill",
    category: "Digital Safety Habits",
    excerpt: "Create a quick exercise that teaches safe link behavior.",
    readTime: "4 min read",
    date: "Oct 26, 2025",
    image: selfCareImages[11],
    content: [
      "Pick three common phishing patterns and share examples with staff.",
      "Use a checklist for reporting suspicious emails.",
      "Celebrate reporting behavior to reinforce the habit.",
    ],
  },
];
