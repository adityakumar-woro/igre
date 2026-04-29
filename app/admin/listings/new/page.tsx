import { redirect } from 'next/navigation';
// Single source of truth — /dashboard/listings/new handles ADMIN agent assignment.
export default function AdminNewListingRedirect() {
  redirect('/dashboard/listings/new');
}
