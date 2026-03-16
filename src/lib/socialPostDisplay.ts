interface SocialPostDisplaySource {
  content?: string | null;
  name?: string | null;
  post_channel?: string | null;
  subject?: string | null;
}

function getFirstNonEmptyValue(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function containsPersonaMetadata(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("persona_data") ||
    normalized.includes("age_distribution") ||
    normalized.includes("gender") ||
    normalized.includes("top_locations") ||
    normalized.includes("device_type") ||
    normalized.includes("interests") ||
    (normalized.includes("{") && normalized.includes("}"))
  );
}

export function getSocialPostDisplayTitle(post: SocialPostDisplaySource): string {
  if (post.post_channel === "ad") {
    return (
      getFirstNonEmptyValue([post.name, post.content, post.subject]) ??
      "Untitled Ad"
    );
  }

  if (post.post_channel === "email") {
    return (
      getFirstNonEmptyValue([post.subject, post.name, post.content]) ??
      "Untitled Campaign"
    );
  }

  const safeOrganicName =
    typeof post.name === "string" && post.name.trim().length > 0 && !containsPersonaMetadata(post.name)
      ? post.name
      : null;

  // Organic posts: use `name` only when it is human-readable and not persona metadata.
  return (
    getFirstNonEmptyValue([safeOrganicName, post.content, post.subject]) ??
    "Untitled Post"
  );
}
