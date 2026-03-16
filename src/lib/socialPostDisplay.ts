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

  return (
    getFirstNonEmptyValue([post.content, post.name, post.subject]) ??
    "Untitled Post"
  );
}
