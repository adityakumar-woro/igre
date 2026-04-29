// Admin "all listings" view — same data, just routed under /admin so the
// admin sidebar stays highlighted. The dashboard listings page already shows
// all listings when the user is ADMIN, so we redirect there to avoid duplication.
import { redirect } from 'next/navigation';

export default function AdminListingsRedirect() {
  redirect('/dashboard/listings');
}
