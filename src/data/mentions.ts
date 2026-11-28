// Public mentions data.
//
// Rule enforced in code and copy: an "independent mention" only appears here once an
// external publisher has published it and the URL has been checked. Owned profiles are
// listed separately and are never presented as independent coverage.
export type MentionType = "Editorial" | "Community contribution" | "Project listing" | "Repository reference" | "Guest article" | "Video" | "Directory listing";

export type VerifiedMention = {
  id: string;
  publication: string;
  title: string;
  date: string; // ISO date of publication, verified
  type: MentionType;
  summary: string;
  url: string;
};

export type OwnedProfile = {
  id: string;
  platform: string;
  handle: string;
  url: string;
  purpose: string;
  verifiedOn: string;
};

export const verifiedMentions: VerifiedMention[] = [];

export const ownedProfiles: OwnedProfile[] = [
  {
    id: "github-profile",
    platform: "GitHub",
    handle: "ProBoy315",
    url: "https://github.com/ProBoy315",
    purpose: "Primary code profile and the account that owns the ProBoy-MD repository.",
    verifiedOn: "2026-11-07",
  },
  {
    id: "bot-repository",
    platform: "GitHub (repository)",
    handle: "proboy315/ProBoy-MD",
    url: "https://github.com/proboy315/ProBoy-MD",
    purpose: "The open-source WhatsApp multi-device bot this portfolio documents.",
    verifiedOn: "2026-11-07",
  },
  {
    id: "portfolio",
    platform: "This site",
    handle: "proboy.vercel.app",
    url: "https://proboy.vercel.app/",
    purpose: "Primary owned site: portfolio, project pages, engineering blog and ProBoy-MD documentation.",
    verifiedOn: "2026-11-07",
  },
];

export const mentionPolicy = [
  "An entry appears in the independent-mentions list only after a third party has published it and the live URL has been checked.",
  "Submissions, drafts, planned pitches and self-published articles are never counted as independent coverage.",
  "Owned profiles and the author's own repositories are labelled as owned, because they are controlled by the author.",
  "Every entry records the publication, headline, publication date and the canonical external URL, with no ranking, traffic or award language.",
  "If a published item is later removed, the entry is removed from this page as well.",
];
