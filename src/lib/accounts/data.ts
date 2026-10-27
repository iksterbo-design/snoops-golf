export interface AccountNode {
  id: string;
  name: string;
  type: "golfer" | "coach" | "staff" | "admin";
  connections: number;
  status: "active" | "inactive";
}

export const ACCOUNT_NETWORK: AccountNode[] = [
  { id: "acc-001", name: "Head Admin", type: "admin", connections: 12, status: "active" },
  { id: "acc-002", name: "Michael Schrempf", type: "coach", connections: 48, status: "active" },
  { id: "acc-003", name: "Matt Wastyn", type: "coach", connections: 36, status: "active" },
  { id: "acc-004", name: "John Schrempf", type: "coach", connections: 41, status: "active" },
  { id: "acc-005", name: "Chris Thompson", type: "coach", connections: 29, status: "active" },
  { id: "acc-006", name: "Support Team", type: "staff", connections: 15, status: "active" },
  { id: "acc-007", name: "Media & Analysis", type: "staff", connections: 9, status: "active" },
  { id: "acc-008", name: "Golfer Network", type: "golfer", connections: 210, status: "active" },
];
