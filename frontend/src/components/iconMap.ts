import {
  AppWindow,
  Briefcase,
  Cable,
  Cctv,
  Code2,
  GraduationCap,
  HardDrive,
  KeyRound,
  Network,
  PhoneCall,
  ShieldCheck,
  Siren,
  Video,
  Wifi,
  Wrench,
} from "lucide-react";

export const iconMap = {
  HardDrive,
  AppWindow,
  Code2,
  Wrench,
  ShieldCheck,
  Network,
  Briefcase,
  GraduationCap,
  Cctv,
  KeyRound,
  Siren,
  Video,
  PhoneCall,
  Cable,
  Wifi,
} as const;

export type IconName = keyof typeof iconMap;
