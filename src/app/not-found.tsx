import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

/** Unmatched URLs get the full site chrome too. */
export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
