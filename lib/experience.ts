// A build without account services is an explicit, self-contained product preview.
export const previewMode = !(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
export const startHref = previewMode ? "/demo" : "/sign-in";
