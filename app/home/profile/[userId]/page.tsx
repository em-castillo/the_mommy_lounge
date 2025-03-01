"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string; 

  const [user, setUser] = useState<{ username: string; bio: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      const res = await fetch(`/api/user/${userId}`);
      const data = await res.json();
      setUser(data);
    }
    fetchUser();
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile">
      <h1>{user.username}</h1>
      <p>{user.bio || "No bio available"}</p>
    </div>
  );
}
