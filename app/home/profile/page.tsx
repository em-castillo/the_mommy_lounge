import { SignedIn, SignedOut, UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div>
      <SignedIn>
        <UserProfile path="/home/profile" />
      </SignedIn>
      <SignedOut>
        <p>Please sign in to view your profile.</p>
      </SignedOut>
    </div>
  );
}
