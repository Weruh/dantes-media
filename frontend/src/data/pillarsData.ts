export type PillarDetail = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  highlights: string[];
  services: string[];
  gallery: string[];
  ctaServiceType: string;
};

export const pillarsData: PillarDetail[] = [
  {
    slug: "security-systems",
    title: "Security Systems",
    summary: "Clear visibility and controlled access for safer spaces.",
    description:
      "We plan and install cameras, access control, and alarms that help you see what is happening and control who enters. The setup is simple to use, easy to scale, and supported after handover.",
    highlights: [
      "See key areas clearly with well-placed cameras.",
      "Know who enters and exits with access control.",
      "Get fast alerts for risks and intrusions.",
      "Keep recordings safe with reliable storage.",
    ],
    services: [
      "CCTV planning and installation",
      "Access control for doors and gates",
      "Intruder and fire detection alerts",
      "System testing and user training",
    ],
    gallery: [
      "/assets/IMG_20210318_155307_135.jpg",
      "/assets/IMG_20210830_142608_048.jpg",
      "/assets/IMG_20201020_123224_779.jpg",
      "/assets/IMG_20210831_181512_853.jpg",
      "/assets/IMG_20200811_092955_107.jpg",
    ],
    ctaServiceType: "Security%20Systems",
  },
  {
    slug: "networking-comms",
    title: "Networking & Comms",
    summary: "Fast, stable connectivity for teams that need to stay online.",
    description:
      "We build strong networks so your team can work, call, and share files without delays. That includes structured cabling, Wi-Fi coverage, and reliable phones that work across the office.",
    highlights: [
      "Strong Wi-Fi coverage across floors and rooms.",
      "Clean, labeled cabling for easier maintenance.",
      "Reliable voice and VoIP call quality.",
      "Secure setup that supports growth.",
    ],
    services: [
      "Structured cabling and rack setup",
      "Enterprise Wi-Fi planning and rollout",
      "PBX and VoIP phone systems",
      "Network testing and documentation",
    ],
    gallery: [
      "/assets/IMG_1744.jpg",
      "/assets/IMG_20201212_142026_124~2%20(1).jpg",
      "/assets/IMG_20210322_152147_311.jpg",
      "/assets/IMG_20201213_113737_777~2.jpg",
      "/assets/IMG_1778.jpg",
    ],
    ctaServiceType: "Networking%20Implementations",
  },
  {
    slug: "managed-ict",
    title: "Managed ICT",
    summary: "Reliable day-to-day support so your systems keep running.",
    description:
      "We take care of the daily IT workload: updates, support, monitoring, and fixes. Your team gets quick help, while your systems stay secure and stable.",
    highlights: [
      "Quick support for staff and devices.",
      "Regular updates to keep systems healthy.",
      "Backups and security checks built-in.",
      "Clear reports and next-step guidance.",
    ],
    services: [
      "Helpdesk and onsite support",
      "Device and server maintenance",
      "Security and backup management",
      "Ongoing reporting and planning",
    ],
    gallery: [
      "/assets/IMG_1778.jpg",
      "/assets/IMG_20220319_123513_856.jpg",
      "/assets/IMG_20220319_123348_274.jpg",
      "/assets/IMG_20210804_143828_719.jpg",
      "/assets/IMG_20220306_141006_017.jpg",
    ],
    ctaServiceType: "ICT%20Maintenance%20Contracts",
  },
];

export const getPillarBySlug = (slug?: string) =>
  pillarsData.find((pillar) => pillar.slug === slug);
