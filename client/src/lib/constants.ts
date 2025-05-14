// Process options
export const PROCESSES = [
  "Welding Jig",
  "Welding Bracket",
  "Mul.Drilling",
  "Buffing",
  "Chromatic In",
  "Chromatic Out",
  "Painting",
  "Balancing",
  "QAQC",
];

// Station options based on process
export const STATIONS_BY_PROCESS: Record<string, string[]> = {
  "Mul.Drilling": ["F", "G", "H"],
  default: ["1", "2", "3", "4", "5", "6", "7"],
};

// Model options
export const MODELS = [
  "NTSU",
  "NTRB",
  "NTSN",
  "NTSM",
  "NTSW",
  "NTSX",
  "NTSY",
  "NTST",
  "NTSZ",
  "NTSJ",
];

// Time options
export const TIMES = [
  "9.45am",
  "11.30am",
  "2.45pm",
  "5pm",
  "8pm",
  "8am",
];

// Instruction types
export const INSTRUCTION_TYPES = [
  "Increase output",
  "Quality check",
  "Slow down production",
  "Maintenance required",
  "Custom message",
];

// Date range options for filtering
export const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Last 3 days", value: "3days" },
  { label: "Last week", value: "week" },
  { label: "Last month", value: "month" }
];

// Format a date to a readable string
export function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
