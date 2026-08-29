// Public surface of the Web Profile feature. Routes and shared code should
// import from here rather than reaching into the folder.

export { ProfilePage } from "./components/ProfilePage";
export { getProfileContent } from "./api/profile-content";
export { FALLBACK_CONTENT } from "./data/fallback-content";
export type { ProfileContent, ProfilePayload, TeamMember, Publication } from "./types";
