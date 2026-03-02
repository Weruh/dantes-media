import type { IconName } from "../components/iconMap";

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceItem = {
  id: number;
  title: string;
  slug: string;
  category: "ICT Services" | "Security Solutions" | "Networking Solutions";
  shortDesc: string;
  whoItsFor: string[];
  deliverables: string[];
  faqs: ServiceFaq[];
  iconName: IconName;
};

export const servicesData: ServiceItem[] = [
  {
    id: 1,
    title: "Hardware Solutions + Accessories",
    slug: "hardware-solutions",
    category: "ICT Services",
    shortDesc: "Procurement, installation, and lifecycle support for business-grade hardware.",
    whoItsFor: ["Growing offices", "Multi-site teams", "SMEs refreshing end-user devices"],
    deliverables: [
      "Hardware sourcing and compatibility checks",
      "On-site installation and configuration",
      "Asset tagging and lifecycle planning",
    ],
    faqs: [
      {
        question: "Do you supply both hardware and accessories?",
        answer: "Yes. We handle core hardware and required accessories as a single scope.",
      },
      {
        question: "Can you install outside business hours?",
        answer: "We schedule after-hours or weekend installs to minimize downtime.",
      },
      {
        question: "Do you support warranty handling?",
        answer: "We coordinate vendor warranties and replacement logistics.",
      },
    ],
    iconName: "HardDrive",
  },
  {
    id: 2,
    title: "Software Solutions",
    slug: "software-solutions",
    category: "ICT Services",
    shortDesc: "Licensed platforms, deployment, and user enablement for essential tools.",
    whoItsFor: ["Teams standardizing software stacks", "Businesses adopting new platforms"],
    deliverables: [
      "License planning and compliance",
      "Installation, migration, and setup",
      "User onboarding and documentation",
    ],
    faqs: [
      {
        question: "Do you manage cloud or on-prem software?",
        answer: "We support both, with a focus on secure and stable deployments.",
      },
      {
        question: "Can you handle data migration?",
        answer: "Yes, we plan and execute structured migrations with validation.",
      },
      {
        question: "Do you provide ongoing updates?",
        answer: "We include patching and update schedules as part of support.",
      },
    ],
    iconName: "AppWindow",
  },
  {
    id: 3,
    title: "Programming Applications",
    slug: "programming-applications",
    category: "ICT Services",
    shortDesc: "Custom applications that streamline workflows and enable automation.",
    whoItsFor: ["Operations teams", "Departments needing bespoke tools"],
    deliverables: [
      "Requirements workshops and prototyping",
      "Custom development and testing",
      "Deployment and documentation",
    ],
    faqs: [
      {
        question: "Do you build web or desktop apps?",
        answer: "We build fit-for-purpose solutions based on your environment.",
      },
      {
        question: "What is your delivery timeline?",
        answer: "Timelines depend on scope; we provide phased milestones.",
      },
      {
        question: "Can you integrate with existing systems?",
        answer: "Yes, we plan integrations for reliable data flow and security.",
      },
    ],
    iconName: "Code2",
  },
  {
    id: 4,
    title: "ICT Maintenance Contracts",
    slug: "ict-maintenance-contracts",
    category: "ICT Services",
    shortDesc: "Predictable support, proactive monitoring, and SLA-backed service.",
    whoItsFor: ["IT managers", "Operations leads", "Businesses needing reliable uptime"],
    deliverables: [
      "SLA-aligned response times",
      "Preventive maintenance schedules",
      "Monthly reporting and recommendations",
    ],
    faqs: [
      {
        question: "Do you offer remote and on-site support?",
        answer: "Yes. We mix remote resolution with scheduled site visits.",
      },
      {
        question: "Can contracts be customized?",
        answer: "We tailor coverage levels and visit cadence to your needs.",
      },
      {
        question: "What industries do you support?",
        answer: "We serve professional services, retail, education, and more.",
      },
    ],
    iconName: "Wrench",
  },
  {
    id: 5,
    title: "ICT Security Solutions",
    slug: "ict-security-solutions",
    category: "ICT Services",
    shortDesc: "Layered security strategies covering physical and digital assets.",
    whoItsFor: ["Security-conscious firms", "Facilities teams", "Compliance-driven orgs"],
    deliverables: [
      "Security risk assessment",
      "System design and deployment",
      "Monitoring and maintenance guidance",
    ],
    faqs: [
      {
        question: "Do you offer integrated security systems?",
        answer: "Yes, we align CCTV, access control, and alarms under one plan.",
      },
      {
        question: "Can we expand the solution later?",
        answer: "Systems are designed for scalable growth.",
      },
      {
        question: "Is training included?",
        answer: "We provide admin training and user guidance.",
      },
    ],
    iconName: "ShieldCheck",
  },
  {
    id: 6,
    title: "Networking Implementations",
    slug: "networking-implementations",
    category: "ICT Services",
    shortDesc: "Secure, scalable networks built for business performance.",
    whoItsFor: ["Multi-office teams", "High-availability operations", "Growing businesses"],
    deliverables: [
      "Network design and site survey",
      "Installation, configuration, testing",
      "Documentation and handover",
    ],
    faqs: [
      {
        question: "Can you support hybrid environments?",
        answer: "We design for on-prem, cloud, and hybrid environments.",
      },
      {
        question: "Do you provide documentation?",
        answer: "Yes, we supply network diagrams and configuration summaries.",
      },
      {
        question: "Do you offer ongoing monitoring?",
        answer: "Monitoring can be added via maintenance contracts.",
      },
    ],
    iconName: "Network",
  },
  {
    id: 7,
    title: "Consultancy Services",
    slug: "consultancy-services",
    category: "ICT Services",
    shortDesc: "Strategic guidance on infrastructure, security, and technology planning.",
    whoItsFor: ["Leadership teams", "CTOs", "Project owners"],
    deliverables: [
      "Current-state audits",
      "Roadmap and investment planning",
      "Vendor and solution recommendations",
    ],
    faqs: [
      {
        question: "Do you deliver reports?",
        answer: "Yes, we provide detailed findings and action plans.",
      },
      {
        question: "Can you assist with RFPs?",
        answer: "We support vendor selection and RFP evaluations.",
      },
      {
        question: "Do you work with internal IT?",
        answer: "We collaborate with your team to align goals.",
      },
    ],
    iconName: "Briefcase",
  },
  {
    id: 8,
    title: "Training",
    slug: "training",
    category: "ICT Services",
    shortDesc: "Practical training programs that empower staff and admins.",
    whoItsFor: ["Staff onboarding", "System administrators", "Security awareness teams"],
    deliverables: [
      "Role-based training modules",
      "Hands-on workshops",
      "Reference guides and follow-up support",
    ],
    faqs: [
      {
        question: "Can you customize training?",
        answer: "Yes, we tailor sessions to tools and policies.",
      },
      {
        question: "Do you offer remote sessions?",
        answer: "Remote and on-site options are available.",
      },
      {
        question: "Is certification included?",
        answer: "We provide completion certificates when requested.",
      },
    ],
    iconName: "GraduationCap",
  },
  {
    id: 9,
    title: "CCTV Surveillance Solutions",
    slug: "cctv-surveillance-solutions",
    category: "Security Solutions",
    shortDesc: "Coverage planning, installation, and monitoring of CCTV systems.",
    whoItsFor: ["Facilities managers", "Security teams", "Retail and office spaces"],
    deliverables: [
      "Camera placement and coverage design",
      "NVR/DVR configuration",
      "Remote monitoring setup",
    ],
    faqs: [
      {
        question: "Do you supply cameras?",
        answer: "We supply and install CCTV hardware from trusted vendors.",
      },
      {
        question: "Can footage be accessed remotely?",
        answer: "Yes, secure remote access can be configured.",
      },
      {
        question: "Do you offer maintenance?",
        answer: "Maintenance is available via SLA packages.",
      },
    ],
    iconName: "Cctv",
  },
  {
    id: 10,
    title: "Access Control & Time Attendance Solutions",
    slug: "access-control-time-attendance",
    category: "Security Solutions",
    shortDesc: "Secure entry systems with attendance tracking and reporting.",
    whoItsFor: ["HR teams", "Security officers", "Operations managers"],
    deliverables: [
      "Biometric or card access setup",
      "Attendance reporting tools",
      "User management training",
    ],
    faqs: [
      {
        question: "Can it integrate with HR systems?",
        answer: "We can integrate with common HR and payroll tools.",
      },
      {
        question: "Do you support multi-door access?",
        answer: "Yes, we design systems for multi-door facilities.",
      },
      {
        question: "Is data stored securely?",
        answer: "We follow best practices for secure access logs.",
      },
    ],
    iconName: "KeyRound",
  },
  {
    id: 11,
    title: "Smart Intruder and Fire Detection Solutions",
    slug: "intruder-fire-detection",
    category: "Security Solutions",
    shortDesc: "Early warning systems with smart alerts and response routing.",
    whoItsFor: ["Facility managers", "Safety officers", "Critical infrastructure sites"],
    deliverables: [
      "Sensor selection and placement",
      "Alert routing and escalation setup",
      "System testing and certification support",
    ],
    faqs: [
      {
        question: "Can alerts be sent to mobile?",
        answer: "Yes, alerts can be configured for mobile notification.",
      },
      {
        question: "Do you support fire compliance?",
        answer: "We align deployments with local compliance guidelines.",
      },
      {
        question: "Is monitoring 24/7?",
        answer: "Monitoring options are available based on service level.",
      },
    ],
    iconName: "Siren",
  },
  {
    id: 12,
    title: "Video Door Phone Solutions",
    slug: "video-door-phone-solutions",
    category: "Security Solutions",
    shortDesc: "Visual verification and controlled entry management.",
    whoItsFor: ["Office buildings", "Residential estates", "Reception teams"],
    deliverables: [
      "Door phone installation",
      "Intercom and video link setup",
      "Access policy configuration",
    ],
    faqs: [
      {
        question: "Can it integrate with access control?",
        answer: "Yes, integration is available for unified access.",
      },
      {
        question: "Do you support multi-tenant buildings?",
        answer: "We provide scalable systems for multi-tenant layouts.",
      },
      {
        question: "Is remote access supported?",
        answer: "Remote answering can be enabled where needed.",
      },
    ],
    iconName: "Video",
  },
  {
    id: 13,
    title: "PBX",
    slug: "pbx",
    category: "Networking Solutions",
    shortDesc: "Business-grade PBX systems for reliable internal and external calls.",
    whoItsFor: ["Customer support teams", "Sales departments", "Multi-office orgs"],
    deliverables: [
      "PBX configuration and extensions",
      "Call routing and IVR setup",
      "User training and documentation",
    ],
    faqs: [
      {
        question: "Do you support VoIP and analog?",
        answer: "Yes, we design for hybrid and VoIP systems.",
      },
      {
        question: "Can calls be recorded?",
        answer: "Call recording options are available where compliant.",
      },
      {
        question: "Do you provide ongoing support?",
        answer: "Support is available via maintenance contracts.",
      },
    ],
    iconName: "PhoneCall",
  },
  {
    id: 14,
    title: "Structured Cabling & VOIP",
    slug: "structured-cabling-voip",
    category: "Networking Solutions",
    shortDesc: "Organized cabling infrastructure with VoIP readiness.",
    whoItsFor: ["New office builds", "Renovations", "Facilities teams"],
    deliverables: [
      "Cable design and labeling",
      "Rack and patch panel installation",
      "VoIP endpoint provisioning",
    ],
    faqs: [
      {
        question: "Do you certify cabling?",
        answer: "We test and certify cabling for performance.",
      },
      {
        question: "Can you work during renovations?",
        answer: "Yes, we coordinate with contractors on-site.",
      },
      {
        question: "Is documentation included?",
        answer: "We provide as-built documentation for future maintenance.",
      },
    ],
    iconName: "Cable",
  },
  {
    id: 15,
    title: "Wireless Bridges",
    slug: "wireless-bridges",
    category: "Networking Solutions",
    shortDesc: "Point-to-point connectivity for campuses and remote sites.",
    whoItsFor: ["Multi-building campuses", "Remote facilities", "Outdoor deployments"],
    deliverables: [
      "Site survey and line-of-sight planning",
      "Bridge installation and alignment",
      "Performance testing and monitoring setup",
    ],
    faqs: [
      {
        question: "What distances can you cover?",
        answer: "Coverage depends on environment; we evaluate in the survey.",
      },
      {
        question: "Is weatherproofing included?",
        answer: "Yes, outdoor-rated equipment is used where required.",
      },
      {
        question: "Do you provide redundancy?",
        answer: "We can design redundant links for uptime.",
      },
    ],
    iconName: "Wifi",
  },
  {
    id: 16,
    title: "Wireless Networking Solutions",
    slug: "wireless-networking-solutions",
    category: "Networking Solutions",
    shortDesc: "Secure Wi-Fi coverage with optimized performance and analytics.",
    whoItsFor: ["Offices", "Retail spaces", "Hospitality venues"],
    deliverables: [
      "Wi-Fi heatmap planning",
      "Access point deployment",
      "Network tuning and security policies",
    ],
    faqs: [
      {
        question: "Can you support guest networks?",
        answer: "Yes, guest and staff network segmentation is included.",
      },
      {
        question: "Do you provide analytics?",
        answer: "Usage analytics can be enabled on supported hardware.",
      },
      {
        question: "Is roaming optimized?",
        answer: "We configure roaming and load-balancing for performance.",
      },
    ],
    iconName: "Wifi",
  },
  {
    id: 17,
    title: "LAN/WAN",
    slug: "lan-wan",
    category: "Networking Solutions",
    shortDesc:
      "Enable employees to take advantage of established LAN, WAN to provide a highly secure, reliable and scalable communication network using almost any media.",
    whoItsFor: ["Distributed teams", "High-availability networks", "Data-heavy operations"],
    deliverables: [
      "LAN/WAN design and configuration",
      "Security and segmentation strategy",
      "Ongoing optimization and monitoring",
    ],
    faqs: [
      {
        question: "Can you support multi-site WAN?",
        answer: "We design WAN links for multi-site coverage.",
      },
      {
        question: "Do you provide SD-WAN?",
        answer: "SD-WAN options can be included where appropriate.",
      },
      {
        question: "Is redundancy part of the design?",
        answer: "We recommend redundancy for mission-critical sites.",
      },
    ],
    iconName: "Network",
  },
];
