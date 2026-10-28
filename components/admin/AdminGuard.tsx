"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "1") {
      setOk(true);
    } else {
      router.replace("/admin");
    }
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
