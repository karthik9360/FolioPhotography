// Profiles live at the top level, like instagram.com/username. Every other top-level route name
// is reserved in lib/validation.js so a handle can never shadow a page.
export const profilePath = (handle) => `/${handle}`
