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

  // Organic posts: `name` is intentionally excluded — it can contain person/persona
  // names from external sync paths (e.g. chat ingestion), which would show as the
  // post title. Only `content` and `subject` are safe display sources here.
  return (
    getFirstNonEmptyValue([post.content, post.subject]) ??
    "Untitled Post"
  );
}
