import rawCommands from "../data/commands.json";

export type RawCommand = {
  key: string;
  name: string;
  category: string;
  description: string;
  usage: string[];
  aliases: string[];
  file: string;
};

export type ExecutionMode = "browser-demo" | "public-api" | "simulation-only";

export type RequirementTag =
  | "owner-only"
  | "admin-only"
  | "group-only"
  | "requires-whatsapp-session"
  | "requires-media/context"
  | "destructive-restricted"
  | "server-api-required";

export type ClassifiedCommand = RawCommand & {
  executionMode: ExecutionMode;
  requirements: RequirementTag[];
  exampleInput: string;
  inputHint: string;
  sourceNotes: string;
};

export type CommandExecutionResult = {
  command?: ClassifiedCommand;
  invokedToken: string;
  args: string[];
  mode: ExecutionMode | "validation-error" | "unknown-command";
  badgeLabel: string;
  text: string;
  copyableText?: string;
  frames?: string[];
  requirements: RequirementTag[];
  sourceFile?: string;
};

export const commandMeta = rawCommands.meta;
export const commandCategories = rawCommands.categories as {
  id: string;
  count: number;
  documented: number;
}[];

const LOCAL_LOGIC_NAMES = new Set([
  "calc",
  "readmore",
  "ping",
  "uptime",
  "owner",
  "list",
  "menuinfo",
  "roll",
  "dare",
  "compliment",
  "insult",
  "gayrate",
  "clock",
  "moon",
  "moon2",
  "heartbeat",
  "hand",
  "face",
  "stupid",
  "jio",
  "hack",
]);

const PUBLIC_API_NAMES = new Set(["github", "npm", "funfact"]);

const DESTRUCTIVE_NAMES = new Set([
  "restart",
  "update",
  "install",
  "uninstall",
  "publish",
  "broadcast",
  "block",
  "unblock",
  "ban",
  "unban",
  "mode",
  "setprefix",
  "setsudo",
  "removesudo",
  "cforward",
  "forward",
  "taggroups",
  "boom",
  "kick",
  "add",
  "promote",
  "demote",
  "delete",
  "mute",
  "unmute",
  "lockgs",
  "unlockgs",
  "antilink",
  "antidelete",
  "antibadword",
  "antibot",
  "antifake",
  "antispam",
  "antiviewonce",
  "anticall",
  "autoreact",
  "autostatus",
  "autoreply",
  "gccmd",
]);

const MEDIA_OR_CONTEXT_NAMES = new Set([
  "sticker",
  "simage",
  "take",
  "attp",
  "viewonce",
  "viewonce2",
  "save",
  "toimg",
  "photoedit",
  "photoedit2",
  "photoedit3",
  "img2prompt",
  "vocalremover",
  "vocalremover2",
  "image2url",
  "obfuscate",
  "jid",
  "getpp",
  "warn",
  "resetwarn",
  "ship",
  "tagall",
  "hidetag",
  "vcf",
  "ginfo",
  "groupinfo",
  "grouplink",
  "groupstats",
  "myactivity",
  "online",
  "firstmessage",
]);

const GROUP_ONLY_NAMES = new Set([
  "add",
  "kick",
  "promote",
  "demote",
  "warn",
  "resetwarn",
  "mute",
  "unmute",
  "lockgs",
  "unlockgs",
  "welcome",
  "goodbye",
  "greetings",
  "setgoodbye",
  "tagall",
  "hidetag",
  "vcf",
  "ginfo",
  "groupinfo",
  "grouplink",
  "groupstats",
  "myactivity",
  "online",
  "numlist",
  "antilink",
  "antibadword",
  "antibot",
  "antifake",
  "antispam",
  "antiviewonce",
  "autosticker",
  "ship",
  "emojimix",
]);

const ADMIN_ONLY_NAMES = new Set([
  "add",
  "kick",
  "promote",
  "demote",
  "warn",
  "resetwarn",
  "mute",
  "unmute",
  "lockgs",
  "unlockgs",
  "welcome",
  "goodbye",
  "greetings",
  "setgoodbye",
  "antilink",
  "antibadword",
  "antibot",
  "antifake",
  "antispam",
  "antiviewonce",
  "autosticker",
  "delete",
]);

const EXAMPLE_INPUTS: Record<string, string> = {
  calc: ".calc (125 * 4) + 32 / 2",
  readmore: ".readmore Visible preview line + Hidden section revealed after clicking Read More",
  ping: ".ping",
  uptime: ".uptime",
  owner: ".owner",
  list: ".list",
  menuinfo: ".menuinfo",
  roll: ".roll",
  dare: ".dare",
  compliment: ".compliment @Shahan",
  insult: ".insult @dev",
  gayrate: ".gayrate @ProBoy",
  clock: ".clock",
  moon: ".moon",
  moon2: ".moon2",
  heartbeat: ".heartbeat",
  hand: ".hand",
  face: ".face",
  stupid: ".stupid",
  jio: ".jio",
  hack: ".hack",
  github: ".github",
  npm: ".npm @whiskeysockets/baileys",
  funfact: ".funfact",
  pair: ".pair 923001234567",
  getcid: ".getcid https://whatsapp.com/channel/0029Vb8yiOF42DcjDYgq5g0Q",
  ai: ".ai Explain how Baileys multi-device pairing works",
  gemini: ".gemini Summarize the advantages of modular Node.js plugins",
  neon: ".neon PROBOY",
};

const INPUT_HINTS: Record<string, string> = {
  calc: "Enter numbers and operators (+, -, *, /, parentheses). Evaluated safely in the browser.",
  readmore: "Separate sections with '+' to generate a WhatsApp readmore message and clean copy block.",
  ping: "Measures real browser command execution latency in milliseconds.",
  uptime: "Shows active browser playground session uptime using ProBoy-MD's formatUptime helper.",
  owner: "Returns the verified vCard contact block from config.js and commands/general/owner.js.",
  list: "Groups all 224 verified repository commands by category.",
  menuinfo: "Generates a structured command summary across all 9 categories.",
  roll: "Rolls a 6-sided die using the exact Unicode faces from commands/fun/dice.js.",
  dare: "Picks a dare challenge from the verified array in commands/fun/dare.js.",
  compliment: "Picks a compliment from commands/fun/complimentry.js. Optionally pass @user.",
  insult: "Picks a playful line from commands/fun/insult.js. Optionally pass @user.",
  gayrate: "Runs the deterministic character-code percentage formula from commands/fun/gayrate.js.",
  github: "Fetches live repository metadata from api.github.com/repos/proboy315/ProBoy-MD.",
  npm: "Fetches live package metadata from registry.npmjs.org/<package>. (.npm install is owner-only.)",
  funfact: "Fetches a random fact from uselessfacts.jsph.pl/api/v2/facts/random?language=en.",
};

function classifyCommand(cmd: RawCommand): ClassifiedCommand {
  const prefix = commandMeta.prefix || ".";
  const name = cmd.name.toLowerCase();
  const requirements: RequirementTag[] = [];

  const isOwnerOnly =
    cmd.category === "dev" ||
    ["antidelete", "autoreply", "firstmessage", "obfuscate", "boom"].includes(name);

  if (isOwnerOnly) requirements.push("owner-only");
  if (ADMIN_ONLY_NAMES.has(name)) requirements.push("admin-only");
  if (GROUP_ONLY_NAMES.has(name)) requirements.push("group-only");
  if (DESTRUCTIVE_NAMES.has(name)) requirements.push("destructive-restricted");
  if (MEDIA_OR_CONTEXT_NAMES.has(name)) requirements.push("requires-media/context");

  let executionMode: ExecutionMode = "simulation-only";
  let sourceNotes = "";

  if (LOCAL_LOGIC_NAMES.has(name)) {
    executionMode = "browser-demo";
    sourceNotes = `Core logic reproduced directly from ${cmd.file} and executed locally in your browser.`;
  } else if (PUBLIC_API_NAMES.has(name)) {
    executionMode = "public-api";
    sourceNotes =
      name === "github"
        ? "Queries public CORS-enabled GitHub REST API (api.github.com/repos/proboy315/ProBoy-MD)."
        : name === "npm"
        ? "Queries public CORS-enabled npm registry (registry.npmjs.org). Owner-only '.npm install' is blocked."
        : "Queries public CORS-enabled Useless Facts API (uselessfacts.jsph.pl/api/v2/facts/random).";
  } else {
    executionMode = "simulation-only";
    if (!requirements.includes("requires-whatsapp-session")) {
      requirements.push("requires-whatsapp-session");
    }
    if (
      cmd.category === "ai" ||
      cmd.category === "media" ||
      cmd.category === "textmaker" ||
      ["define", "wiki", "weather", "download", "shorturl", "qr", "ssweb", "info", "advice", "joke", "quotes", "shayari"].includes(
        name
      )
    ) {
      if (!requirements.includes("server-api-required")) {
        requirements.push("server-api-required");
      }
    }
    sourceNotes = `Requires an active Node.js + Baileys WhatsApp session${
      requirements.includes("owner-only")
        ? " and owner/sudo privileges"
        : requirements.includes("requires-media/context")
        ? " and quoted media or chat context"
        : requirements.includes("server-api-required")
        ? " and server-side API dependencies"
        : ""
    }. Shown as a safe simulated preview.`;
  }

  const rawUsage = cmd.usage[0] || `${prefix}${cmd.name}`;
  const normalizedUsage = rawUsage.startsWith(prefix) ? rawUsage : `${prefix}${rawUsage}`;
  const exampleInput = EXAMPLE_INPUTS[name] || normalizedUsage;
  const inputHint =
    INPUT_HINTS[name] ||
    (executionMode === "simulation-only"
      ? `Simulation preview for ${cmd.file}. ${sourceNotes}`
      : `Usage: ${normalizedUsage}`);

  return {
    ...cmd,
    executionMode,
    requirements,
    exampleInput,
    inputHint,
    sourceNotes,
  };
}

export const classifiedCommands: ClassifiedCommand[] = (rawCommands.commands as RawCommand[]).map(classifyCommand);

// Build lookup map matching ProBoy-MD utils/commandLoader.js (primary names take precedence, first alias wins)
const tokenMap = new Map<string, ClassifiedCommand>();
for (const cmd of classifiedCommands) {
  const primary = cmd.name.toLowerCase();
  if (!tokenMap.has(primary)) tokenMap.set(primary, cmd);
}
for (const cmd of classifiedCommands) {
  for (const alias of cmd.aliases) {
    const clean = alias.toLowerCase().trim();
    if (clean && !tokenMap.has(clean)) {
      tokenMap.set(clean, cmd);
    }
  }
}

export function resolveCommandToken(token: string): ClassifiedCommand | undefined {
  const clean = token.toLowerCase().replace(/^\.+/, "");
  return tokenMap.get(clean);
}

export const playgroundCoverage = (() => {
  const total = classifiedCommands.length;
  const browserDemo = classifiedCommands.filter((c) => c.executionMode === "browser-demo").length;
  const publicApi = classifiedCommands.filter((c) => c.executionMode === "public-api").length;
  const simulationOnly = classifiedCommands.filter((c) => c.executionMode === "simulation-only").length;
  const ownerOnly = classifiedCommands.filter((c) => c.requirements.includes("owner-only")).length;
  const mediaOrContext = classifiedCommands.filter((c) => c.requirements.includes("requires-media/context")).length;
  return {
    total,
    categories: commandCategories.length,
    browserDemo,
    publicApi,
    simulationOnly,
    ownerOnly,
    mediaOrContext,
    uniquePrimaryNames: commandMeta.uniquePrimaryNames,
    uniqueInvocableTokens: commandMeta.uniqueInvocableTokens,
    reportedMenuTotal: commandMeta.reportedMenuTotal,
    reportedListed: commandMeta.reportedListed,
  };
})();

/* ---------------- Safe Arithmetic Evaluator (replaces eval in calc.js) ---------------- */
function evaluateSafeMath(expr: string): number {
  const tokens = expr.match(/\d+(?:\.\d+)?|[+\-*/()%]/g);
  if (!tokens || tokens.join("") !== expr.replace(/\s+/g, "")) {
    throw new Error("Invalid characters in expression");
  }
  let pos = 0;

  function parseExpression(): number {
    let val = parseTerm();
    while (pos < tokens!.length && (tokens![pos] === "+" || tokens![pos] === "-")) {
      const op = tokens![pos++];
      const right = parseTerm();
      val = op === "+" ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (pos < tokens!.length && (tokens![pos] === "*" || tokens![pos] === "/" || tokens![pos] === "%")) {
      const op = tokens![pos++];
      const right = parseFactor();
      if ((op === "/" || op === "%") && right === 0) throw new Error("Division by zero");
      val = op === "*" ? val * right : op === "/" ? val / right : val % right;
    }
    return val;
  }

  function parseFactor(): number {
    const tok = tokens![pos];
    if (tok === "+") {
      pos++;
      return parseFactor();
    }
    if (tok === "-") {
      pos++;
      return -parseFactor();
    }
    if (tok === "(") {
      pos++;
      const val = parseExpression();
      if (tokens![pos] !== ")") throw new Error("Unmatched parenthesis");
      pos++;
      return val;
    }
    if (tok && /^\d+(?:\.\d+)?$/.test(tok)) {
      pos++;
      return Number(tok);
    }
    throw new Error("Unexpected token");
  }

  const result = parseExpression();
  if (pos !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Malformed expression");
  }
  return Math.round(result * 1e10) / 1e10;
}

/* ---------------- Verified Static Data from ProBoy-MD Source ---------------- */
const DARES_FROM_SOURCE = [
  "Send a screenshot of your gallery!",
  "Let someone else write a status on your WhatsApp!",
  "Call a random contact and sing them a song!",
  "Post an embarrassing selfie!",
  "Text your crush and confess your feelings!",
  "Do 20 pushups and send a video!",
  "Change your profile picture to something embarrassing for 24 hours!",
  "Send a voice note singing the alphabet!",
  "Let the group choose your status for a day!",
  "Tell the group your most embarrassing moment!",
  "Share your last 5 Google searches!",
  "Dance in front of everyone for 1 minute!",
  "Do your best impression of someone in the group!",
  "Speak in an accent for the next 10 minutes!",
  "Post a story saying 'I lost a bet' for 24 hours!",
];

const COMPLIMENTS_FROM_SOURCE = [
  "You're an awesome friend! 💙",
  "You light up the room! ✨",
  "You're someone's reason to smile! 😊",
  "You're even better than a unicorn! 🦄",
  "You're a gift to those around you! 🎁",
  "You're a smart cookie! 🍪",
  "You're awesome! 🌟",
  "You have the best laugh! 😄",
  "You're gorgeous! 💖",
  "You're more helpful than you realize! 🤝",
  "You have a great sense of humor! 😂",
  "You're really something special! ⭐",
  "You're an incredible friend! 🫂",
  "Your perspective is refreshing! 🌈",
  "You're making a difference! 🌍",
  "You're stronger than you think! 💪",
  "Your smile is contagious! 😁",
  "You're one of a kind! 💎",
  "You bring out the best in people! 👏",
  "You're inspiring! 🌟",
];

const INSULTS_FROM_SOURCE = [
  "You're as useful as a white crayon.",
  "I'd call you sharp, but that would be offensive to pencils.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  "You bring everyone so much joy... when you leave the room.",
  "If laziness was an Olympic sport, you'd come in fourth — so you wouldn't have to walk up to the podium.",
];

const ANIMATION_FRAMES: Record<string, string[]> = {
  clock: ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛 ⏰"],
  moon: [
    "🌗🌗🌗🌗🌗\n🌓🌓🌓🌓🌓\n🌗🌗🌗🌗🌗",
    "🌑🌑🌑🌑🌑\n🌕🌕🌕🌕🌕\n🌑🌑🌑🌑🌑",
    "🌕🌕🌕🌕🌕\n🌑🌑🌑🌑🌑\n🌕🌕🌕🌕🌕",
  ],
  moon2: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"],
  heartbeat: ["🖤", "❤️", "🧡", "💛", "💚", "💙", "💜", "💖"],
  hand: ["👉", "☝️", "👆", "👇", "✌️", "🤞", "🖖", "🤘", "🤙", "🖐️", "👌"],
  face: [
    "◻️◻️◻️◻️◻️\n◻️◻️◼️◻️◻️\n◻️◻️◻️◻️◻️",
    "◻️◼️◻️◼️◻️\n◻️◻️◻️◻️◻️\n◻️◼️◼️◼️◻️ 😊",
  ],
  stupid: ["🧠  ➡️  🗑️", "🗑️  (Brain discarded)"],
  jio: [
    "Connecting To JIO NETWORK ....",
    "█ ▇ ▆ ▅ ▄ ▂ ▁",
    "▁ ▂ ▄ ▅ ▆ ▇ █",
    "JIO NETWORK Boosted.... ✅",
  ],
  hack: [
    "█ █ █ 30% — Initializing sandbox trace...",
    "█ █ █ █ █ █ 60% — Checking simulated packets...",
    "█ █ █ █ █ █ █ █ █ █ 100% — Prank animation complete (no real device accessed).",
  ],
};

function formatUptime(seconds: number): string {
  if (seconds <= 0) return "0 seconds";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} ${secs === 1 ? "second" : "seconds"}`);
  return parts.join(", ");
}

const SESSION_STARTED_AT = Date.now();

export async function executePlaygroundCommand(rawInput: string): Promise<CommandExecutionResult> {
  const prefix = commandMeta.prefix || ".";
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      invokedToken: "",
      args: [],
      mode: "validation-error",
      badgeLabel: "Input required",
      text: `Type a command starting with "${prefix}" (for example: ${prefix}calc 12 * 8, ${prefix}github, or ${prefix}list).`,
      requirements: [],
    };
  }

  const normalized = trimmed.startsWith(prefix) ? trimmed : `${prefix}${trimmed}`;
  const parts = normalized.slice(prefix.length).trim().split(/\s+/);
  const invokedToken = (parts[0] || "").toLowerCase();
  const args = parts.slice(1);
  const cmd = resolveCommandToken(invokedToken);

  if (!cmd) {
    return {
      invokedToken,
      args,
      mode: "unknown-command",
      badgeLabel: "Unknown command",
      text: `❓ Command "${prefix}${invokedToken}" was not found in the 224 verified ProBoy-MD command files.\nType ${prefix}list to see all categories or search the command directory panel.`,
      requirements: [],
    };
  }

  const name = cmd.name.toLowerCase();

  /* ---------------- 1. Locally Executed Browser Logic ---------------- */
  if (cmd.executionMode === "browser-demo") {
    if (name === "calc") {
      if (args.length === 0) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "validation-error",
          badgeLabel: "Usage hint",
          text: `❌ Usage: .calc <expression>\n\nExample: .calc (125 * 4) + 32 / 2`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
      const expression = args.join(" ");
      try {
        const result = evaluateSafeMath(expression);
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "browser-demo",
          badgeLabel: "Locally executed demo logic",
          text: `🧮 Calculator\n\n📝 Expression: ${expression}\n✅ Result: ${result}`,
          copyableText: String(result),
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      } catch (err) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "validation-error",
          badgeLabel: "Validation error",
          text: `❌ Invalid mathematical expression (${
            err instanceof Error ? err.message : "syntax error"
          }). Only numbers and operators (+, -, *, /, %, parentheses) are allowed.`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
    }

    if (name === "readmore") {
      const joined = args.join(" ").trim();
      if (!joined || !joined.includes("+")) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "validation-error",
          badgeLabel: "Usage hint",
          text: `❌ Separate sections with a '+' sign.\n\nExample: .readmore Visible intro + Hidden details`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
      const segments = joined
        .split("+")
        .map((s) => s.trim())
        .filter(Boolean);
      const fullVisibleText = segments.join("\n\n");
      const previewText =
        segments.length === 1
          ? segments[0]
          : `${segments[0]}\n[... 4,001 LTRM readmore padding characters in WhatsApp ...]\n${segments.slice(1).join("\n\n")}`;
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `📄 Readmore Formatter (${segments.length} sections)\n\n${previewText}`,
        copyableText: fullVisibleText,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "ping") {
      const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
      const ms = Math.max(1, Math.round(t1 - t0));
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `🏓 Pong!\n⚡ Browser Playground Response Time: ${ms}ms`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "uptime") {
      const elapsedSec = Math.floor((Date.now() - SESSION_STARTED_AT) / 1000);
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `╭━━『 Bot Uptime 』━━╮\n\n🤖 Bot Name: ProBoy-MD\n🧬 Menu Version: ${commandMeta.version}\n⏱️ Playground Session Uptime: ${formatUptime(
          elapsedSec
        )}\n\n╰━━━━━━━━━━━━━━━╯`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "owner") {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:SHahan\nTEL;waid=923261684315:+92 326 1684315\nEND:VCARD`;
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `👑 Bot Owner Contact (from config.js & owner.js)\n\nName: Shahan Ali (PROBOY)\nGitHub: https://github.com/ProBoy315\n\n${vcard}`,
        copyableText: vcard,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "list") {
      const lines = commandCategories.map((c) => {
        const names = classifiedCommands
          .filter((item) => item.category === c.id)
          .slice(0, 6)
          .map((item) => `${prefix}${item.name}`)
          .join(", ");
        return `• ${c.id.toUpperCase()} (${c.count}): ${names}${c.count > 6 ? " …" : ""}`;
      });
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `📋 ProBoy-MD Verified Repository Command Index (${classifiedCommands.length} files)\n\n${lines.join(
          "\n"
        )}\n\nUse the Command Inspector to search all ${classifiedCommands.length} commands.`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "menuinfo") {
      const summary = commandCategories.map((c) => `${c.id}: ${c.count} files`).join(" | ");
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `📄 ProBoy-MD Command Summary\n• Prefix: ${prefix}\n• Repository files: ${commandMeta.repositoryCommandFiles} (${commandMeta.uniquePrimaryNames} unique primary names, ${commandMeta.uniqueInvocableTokens} invocable tokens)\n• Menu snapshot reported: ${commandMeta.reportedMenuTotal} (${commandMeta.reportedListed} listed)\n• Breakdown: ${summary}`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "roll") {
      const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      const rolled = faces[Math.floor(Math.random() * faces.length)];
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `🎲 Rolling...\n🎲 Result: ${rolled}`,
        frames: ["⚀", "⚂", "⚄", `🎲 Result: ${rolled}`],
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "dare") {
      const pick = DARES_FROM_SOURCE[Math.floor(Math.random() * DARES_FROM_SOURCE.length)];
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `🎯 Dare Challenge:\n${pick}`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "compliment") {
      const target = args[0] ? `${args[0]} — ` : "";
      const pick = COMPLIMENTS_FROM_SOURCE[Math.floor(Math.random() * COMPLIMENTS_FROM_SOURCE.length)];
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `${target}${pick}`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "insult") {
      const target = args[0] ? `${args[0]} — ` : "";
      const pick = INSULTS_FROM_SOURCE[Math.floor(Math.random() * INSULTS_FROM_SOURCE.length)];
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `${target}${pick}`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (name === "gayrate") {
      const target = args[0] || "@visitor";
      const base = target.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const percent = ((base % 101) + Math.floor(Math.random() * 7)) % 101;
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: `✨ ${target} score: ${percent}% pure glitter (reproduced from commands/fun/gayrate.js)`,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }

    if (ANIMATION_FRAMES[name]) {
      const frames = ANIMATION_FRAMES[name];
      return {
        command: cmd,
        invokedToken,
        args,
        mode: "browser-demo",
        badgeLabel: "Locally executed demo logic",
        text: frames[frames.length - 1],
        frames,
        requirements: cmd.requirements,
        sourceFile: cmd.file,
      };
    }
  }

  /* ---------------- 2. Public CORS-Compatible API Commands ---------------- */
  if (cmd.executionMode === "public-api") {
    if (name === "github") {
      try {
        const res = await fetch("https://api.github.com/repos/ProBoy315/ProBoy-MD", {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) {
          throw new Error(`GitHub API returned HTTP ${res.status}`);
        }
        const repo = (await res.json()) as {
          name: string;
          owner?: { login?: string };
          description?: string;
          html_url: string;
          stargazers_count: number;
          forks_count: number;
          watchers_count: number;
          size: number;
          clone_url: string;
        };
        const text = [
          `╭━━『 GitHub Repository (Live API) 』━━╮`,
          `🤖 Bot Name: ProBoy-MD`,
          `🔗 Repository: ${repo.name}`,
          `👨‍💻 Owner: ${repo.owner?.login || "ProBoy315"}`,
          `📄 Description: ${repo.description || "WhatsApp Multi-Device Bot"}`,
          `🌐 URL: ${repo.html_url}`,
          `⭐ Stars: ${Number(repo.stargazers_count || 0).toLocaleString()} | 🍴 Forks: ${Number(
            repo.forks_count || 0
          ).toLocaleString()}`,
          `📦 Size: ${((repo.size || 0) / 1024).toFixed(2)} MB`,
          `📥 Clone: git clone ${repo.clone_url}`,
          `╰━━━━━━━━━━━━━━━╯`,
        ].join("\n");
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API response",
          text,
          copyableText: `git clone ${repo.clone_url}`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      } catch (err) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API fallback",
          text: `⚠️ Live GitHub API request could not complete (${
            err instanceof Error ? err.message : "network/rate limit"
          }).\nRepository URL: https://github.com/ProBoy315/ProBoy-MD`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
    }

    if (name === "npm") {
      if (args.length === 0) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "validation-error",
          badgeLabel: "Usage hint",
          text: `❌ Usage: .npm <package>\nExample: .npm @whiskeysockets/baileys\nNote: '.npm install <package>' is owner-only and disabled in the public playground.`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
      const first = args[0].toLowerCase();
      if (first === "install" || first === "i") {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "simulation-only",
          badgeLabel: "Simulated demo response",
          text: `👑 Owner-only restriction: '.npm install' runs child_process on the bot host and is blocked in this public browser playground.\nUse '.npm <package>' to inspect public npm registry metadata safely.`,
          requirements: ["owner-only", "destructive-restricted"],
          sourceFile: cmd.file,
        };
      }
      const pkg = args[0].trim();
      if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(pkg)) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "validation-error",
          badgeLabel: "Invalid package name",
          text: `❌ Invalid npm package identifier "${pkg}".`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
      try {
        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? `Package "${pkg}" not found` : `Registry HTTP ${res.status}`);
        }
        const meta = (await res.json()) as {
          name: string;
          description?: string;
          "dist-tags"?: { latest?: string };
          license?: string;
          homepage?: string;
        };
        const latest = meta["dist-tags"]?.latest || "unknown";
        const text = [
          `📦 npm Registry Info (Live API)`,
          `• Package: ${meta.name}`,
          `• Latest: v${latest}`,
          `• License: ${typeof meta.license === "string" ? meta.license : "See registry"}`,
          `• Description: ${meta.description || "No description provided"}`,
          `• Registry: https://www.npmjs.com/package/${meta.name}`,
        ].join("\n");
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API response",
          text,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      } catch (err) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API error",
          text: `❌ Could not fetch npm metadata for "${pkg}": ${
            err instanceof Error ? err.message : "Network error"
          }.`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
    }

    if (name === "funfact") {
      try {
        const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { text?: string };
        if (!json.text) throw new Error("Empty fact payload");
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API response",
          text: `🧠 Random Fun Fact (Live API)\n\n${json.text}`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      } catch (err) {
        return {
          command: cmd,
          invokedToken,
          args,
          mode: "public-api",
          badgeLabel: "Live API error",
          text: `⚠️ Could not reach uselessfacts.jsph.pl right now (${
            err instanceof Error ? err.message : "network error"
          }).`,
          requirements: cmd.requirements,
          sourceFile: cmd.file,
        };
      }
    }
  }

  /* ---------------- 3. Simulated / Session-Restricted Commands ---------------- */
  const argPreview = args.length > 0 ? args.join(" ") : "(no arguments supplied)";
  const reqList = cmd.requirements.join(", ");

  let specificPreview = "";
  if (name === "pair") {
    specificPreview = `In ProBoy-MD (${cmd.file}), this command validates a phone number with country code and calls the pairing service (${commandMeta.pairingApiDefault}). Use the official pairing website at ${commandMeta.pairingUrl} to generate a real code.`;
  } else if (name === "getcid") {
    const link = args[0] || "";
    const valid = link.includes("whatsapp.com/channel/");
    specificPreview = valid
      ? `Link syntax verified (${link}). In a live Baileys session, sock.newsletterMetadata('invite', code) resolves the @newsletter JID.`
      : `Pass a valid WhatsApp channel link (https://whatsapp.com/channel/<inviteCode>). Live lookup requires an active Baileys session.`;
  } else if (cmd.requirements.includes("owner-only")) {
    specificPreview = `Protected command (${cmd.file}). In ProBoy-MD, handler.js checks senderNumber against config.ownerNumber / sudoNumbers before executing. Public visitors cannot trigger owner or server actions.`;
  } else if (cmd.requirements.includes("requires-media/context")) {
    specificPreview = `Context-dependent command (${cmd.file}). In WhatsApp, this reads a quoted image/video/audio/sticker message or @mention metadata that does not exist in a browser chat.`;
  } else {
    specificPreview = `Server/session command (${cmd.file}). Requires an active Node.js + Baileys WhatsApp connection${
      cmd.requirements.includes("server-api-required") ? " and server-side API request" : ""
    }.`;
  }

  return {
    command: cmd,
    invokedToken,
    args,
    mode: "simulation-only",
    badgeLabel: "Simulated demo response",
    text: [
      `[Simulated Preview · ${prefix}${cmd.name}]`,
      `• Category: ${cmd.category} | Source: ${cmd.file}`,
      `• Input received: ${argPreview}`,
      `• Missing browser requirements: ${reqList}`,
      ``,
      specificPreview,
    ].join("\n"),
    requirements: cmd.requirements,
    sourceFile: cmd.file,
  };
}
