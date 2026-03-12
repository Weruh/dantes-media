export type ProjectItem = {
  id: number;
  slug: string;
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  outcome: string;
  summary: string;
  image: string;
};

export const projectsData: ProjectItem[] = [
  {
    id: 1,
    slug: "office-network-upgrade",
    title: "Office Network Upgrade",
    industry: "Professional Services",
    challenge: "Legacy switches caused slow performance and frequent outages.",
    solution: "Replaced core hardware, redesigned VLANs, and improved Wi-Fi coverage.",
    outcome: "Stable connectivity with 35% faster average throughput.",
    summary: "Replatformed the core network stack and documented the new topology.",
    image: "/assets/Office Network Upgrade.jpg",
  },
  {
    id: 2,
    slug: "security-access-control",
    title: "CCTV + Access Control Deployment",
    industry: "Manufacturing",
    challenge:
      "The site had blind zones, no centralized incident visibility, and several unsecured doors that made after-hours tracking difficult.",
    solution:
      "Installed wide-angle CCTV coverage, integrated role-based access control with staff badges, and configured centralized monitoring with event timelines.",
    outcome:
      "Security teams gained real-time surveillance, searchable access records, and faster incident response with complete audit trails for compliance reviews.",
    summary:
      "Unified video surveillance and controlled entry into one monitored security workflow across production, storage, and administrative areas.",
    image: "/assets/cctv and access control.jpg",
  },
  {
    id: 3,
    slug: "pbx-voip-rollout",
    title: "PBX/VoIP Rollout",
    industry: "Retail",
    challenge: "Disconnected phone systems and high call costs.",
    solution: "Migrated to a PBX/VoIP system with call routing and IVR.",
    outcome: "Reduced call expenses and improved customer response time.",
    summary: "Standardized voice infrastructure across multiple branches.",
    image: "/assets/PBXVoIP Rollout.jpg",
  },
  {
    id: 4,
    slug: "multi-site-wifi",
    title: "Multi-Site Wi-Fi Expansion",
    industry: "Education",
    challenge: "Poor wireless coverage across multiple floors.",
    solution: "Conducted heatmap survey and deployed optimized access points.",
    outcome: "Consistent Wi-Fi coverage and fewer support tickets.",
    summary: "Delivered reliable wireless coverage across an entire campus.",
    image: "/assets/838ed924-53bb-4a32-a868-57dbaf99edc8.jpg",
  },
  {
    id: 5,
    slug: "server-room-hardening",
    title: "Server Room Hardening",
    industry: "Financial Services",
    challenge:
      "The server room lacked strict entry controls and had no reliable alerts for temperature, power fluctuation, or unauthorized access attempts.",
    solution:
      "Implemented restricted access control, 24/7 monitoring alerts, and environmental sensors tied to escalation rules and maintenance playbooks.",
    outcome:
      "Reduced operational and security risk, strengthened business continuity, and improved readiness for security and regulatory audits.",
    summary:
      "Hardened critical infrastructure with layered physical security, environmental monitoring, and documented incident-response procedures.",
    image: "/assets/IMG_1744.jpg",
  },
  {
    id: 6,
    slug: "productivity-suite-rollout",
    title: "Productivity Suite Rollout",
    industry: "Healthcare",
    challenge: "Teams used inconsistent productivity tools and manual workflows.",
    solution: "Deployed standardized software stack with training sessions.",
    outcome: "Higher collaboration and streamlined document management.",
    summary: "Aligned teams on shared tools and usage patterns.",
    image: "/assets/IMG_1778.jpg",
  },
];
