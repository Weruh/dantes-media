import type { ProductCategory } from "./catalogTypes";

export type ProductSolution = {
  id: string;
  title: string;
  intro: string;
  highlights: string[];
  details: string;
  primaryCategory: ProductCategory;
  shopCategory: ProductCategory;
};

export const productSolutionsData: ProductSolution[] = [
  {
    id: "cctv-cameras-accessories",
    title: "CCTV Cameras and Accessories",
    intro:
      "We supply and install advanced surveillance and monitoring solutions for homes, offices, commercial buildings, and industrial facilities.",
    highlights: [
      "HD CCTV cameras, IP cameras, and PTZ cameras",
      "DVRs, NVRs, storage devices, and power supplies",
      "Cabling, connectors, brackets, and full system accessories",
    ],
    details:
      "Dantes Media Solutions delivers surveillance equipment for real-time monitoring, reliable recording, and tighter security control across your sites.",
    primaryCategory: "CCTV & Surveillance",
    shopCategory: "Cctv Cameras And Accessories",
  },
  {
    id: "electric-fence-razor-wire",
    title: "Electric Fences, Razor Wires and Accessories",
    intro:
      "Protect your home, business, and property with perimeter security systems designed to deter intruders and strengthen boundary protection.",
    highlights: [
      "Electric fence energizers, kits, high-tensile wires, and insulators",
      "Razor wire and concertina coils for high-risk perimeter lines",
      "Fence posts, warning signs, connectors, and installation components",
    ],
    details:
      "Built for durability and reliability, these solutions support residential compounds, schools, farms, warehouses, and high-security sites, with options for both solar and mains power.",
    primaryCategory: "Electric Fencing & Razor Wire",
    shopCategory: "Electric Fences, Razor Wires and Accessories",
  },
  {
    id: "access-control-time-attendance",
    title: "Access Control and Time Attendance Systems",
    intro:
      "Deploy secure entry management and accurate workforce attendance tracking with scalable systems built for growing organizations.",
    highlights: [
      "Biometric fingerprint and facial recognition terminals",
      "RFID card readers, smart control panels, and time attendance devices",
      "Integrated software solutions from trusted global manufacturers",
    ],
    details:
      "Our installations improve secure access, staff accountability, and workforce visibility while giving your team structured control over who enters sensitive areas.",
    primaryCategory: "Access Control & Attendance",
    shopCategory: "Access Control & Time Attendance Systems",
  },
  {
    id: "burglar-alarm-systems",
    title: "Burglar Alarm Systems and Accessories",
    intro:
      "We supply and install professional intrusion detection and alarm solutions for homes, offices, commercial premises, and industrial properties.",
    highlights: [
      "Motion, door, and window sensors with central alarm panels",
      "Sirens, keypads, panic buttons, GSM modules, and wireless kits",
      "Backup batteries and complete alarm accessories",
    ],
    details:
      "Dantes Media Solutions provides systems that improve early intrusion detection and accelerate response for stronger day and night protection.",
    primaryCategory: "Burglar Alarm Systems",
    shopCategory: "Fire Alarm Sytems And Accessories",
  },
  {
    id: "fire-alarm-systems",
    title: "Fire Alarm Systems and Accessories",
    intro:
      "We supply and install advanced fire detection and alarm systems for residential, commercial, and industrial safety requirements.",
    highlights: [
      "Smoke and heat detectors with manual call points",
      "Fire alarm control panels, sirens, and hooters",
      "Fire-rated cables, backup batteries, and complete accessories",
    ],
    details:
      "Our fire safety solutions are built to improve early warning, response speed, and compliance readiness across critical environments.",
    primaryCategory: "Fire Alarm Systems",
    shopCategory: "Fire Alarm Sytems And Accessories",
  },
  {
    id: "automatic-gates-accessories",
    title: "Automatic Gates and Accessories",
    intro:
      "Secure your property with efficient gate automation systems designed for residential, commercial, and industrial environments.",
    highlights: [
      "Sliding and swing gate motors",
      "Gate remotes, receivers, control boards, and battery backups",
      "Safety photocells and limit switches for safe operation",
    ],
    details:
      "We provide high-performance gate automation products with expert support, competitive pricing, and fast delivery options across Kenya.",
    primaryCategory: "Automatic Gates & Accessories",
    shopCategory: "Automatic Gates & Accessories",
  },
  {
    id: "networking-products-accessories",
    title: "Networking Products and Accessories",
    intro:
      "We supply and install professional networking infrastructure for homes, offices, commercial buildings, and industrial environments.",
    highlights: [
      "Switches, routers, and Wi-Fi access points",
      "Structured cabling, Ethernet cables, patch panels, and network racks",
      "Fiber optics, adapters, connectors, and complete networking accessories",
    ],
    details:
      "Dantes Media Solutions provides infrastructure that supports stable connectivity, secure communication, and high-speed data transfer for critical business operations.",
    primaryCategory: "Networking",
    shopCategory: "Networking products and accessories",
  },
  {
    id: "computer-accessories",
    title: "Computer Accessories",
    intro:
      "We supply reliable computer peripherals and accessories for desktops, laptops, servers, and professional workstations.",
    highlights: [
      "Keyboards, mice, webcams, and headsets",
      "Cooling pads, USB hubs, docking stations, and external drives",
      "Cables, adapters, and everyday productivity accessories",
    ],
    details:
      "Whether for home, office, school, or industrial usage, we deliver quality accessories that improve productivity, durability, and user experience.",
    primaryCategory: "Computer Accessories",
    shopCategory: "Computer Accesorries",
  },
];

export const productSolutionImageMap: Record<string, string> = {
  "cctv-cameras-accessories": "/assets/CCTV Cameras and Accessories.png",
  "electric-fence-razor-wire": "/assets/Electric Fences, Razor Wires and Accessories.png",
  "access-control-time-attendance": "/assets/Access Control and Time Attendance Systems.png",
  "burglar-alarm-systems": "/assets/Burglar Alarm Systems and Accessories.jpg",
  "fire-alarm-systems": "/assets/Fire Alarm Systems and Accessories.png",
  "automatic-gates-accessories": "/assets/Automatic Gates and Accessories.png",
  "networking-products-accessories": "/assets/Networking Products and Accessories.png",
  "computer-accessories": "/assets/Computer Accessories.png",
};
