export interface StaffMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: string;
  bio: string;
  email?: string;
}

export const STAFF: StaffMember[] = [
  { id: "head-admin", name: "Head Admin", role: "Administrator", initials: "HA", accent: "from-red-500 to-rose-700", bio: "Runs the control panel: users, coaches, swings, analyses, and payments.", email: "admin@example.com" },
  { id: "director-coaching", name: "Director of Coaching", role: "Coaching Director", initials: "DC", accent: "from-fairway-500 to-fairway-700", bio: "Oversees the four coaching voices and keeps the drill libraries sharp." },
  { id: "support", name: "Support Team", role: "Member Support", initials: "ST", accent: "from-sky-500 to-indigo-700", bio: "Helps golfers with accounts, uploads, and review questions." },
  { id: "media", name: "Media & Analysis", role: "Media Pipeline", initials: "MA", accent: "from-amber-400 to-orange-600", bio: "Keeps the FFmpeg duration probe and checkpoint frames running." },
];
