export const CLUBS = ["Driver", "3-Wood", "5-Iron", "7-Iron", "Pitching Wedge", "Gap Wedge", "Sand Wedge", "Putter"] as const;

export const ISSUE_OPTIONS = [
  { id: "slice", label: "Slice / push", tags: ["contact", "path"] },
  { id: "hook", label: "Hook / pull", tags: ["contact", "path"] },
  { id: "thin", label: "Thin / fat contact", tags: ["contact", "lowpoint"] },
  { id: "topspin", label: "Too much spin / ballooning", tags: ["contact", "launch"] },
  { id: "distance", label: "Losing distance", tags: ["speed", "sequencing"] },
  { id: "tempo", label: "Rushed / choppy tempo", tags: ["tempo"] },
  { id: "posture", label: "Posture / balance issues", tags: ["posture", "footwork"] },
  { id: "grip", label: "Grip feels uncomfortable", tags: ["grip", "setup"] },
  { id: "alignment", label: "Aiming / alignment confusion", tags: ["alignment", "setup"] },
  { id: "backswing", label: "Backswing feels long or flat", tags: ["backswing", "sequencing"] },
  { id: "consistency", label: "Inconsistent strike pattern", tags: ["contact", "consistency"] },
  { id: "early_extension", label: "Hanging back / early extension", tags: ["footwork", "sequencing"] },
] as const;

export const GOALS = [
  "Lower my handicap",
  "Hit more fairways",
  "Hit more greens",
  "Improve wedge scoring",
  "Fix a specific miss",
  "Build a reliable pre-shot routine",
] as const;

export const COACH_IDS = ["michaelSchrempf", "mattWastyn", "johnSchrempf", "chrisThompson"] as const;
