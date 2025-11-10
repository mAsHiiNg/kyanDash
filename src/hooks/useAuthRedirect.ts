import { useEffect } from "react";
import { useRouter } from "next/router";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // only run client-side
    if (typeof window === "undefined") return;

    const user = localStorage.getItem("crm_user");

    // If no user found and not already on /login, redirect
    if (!user && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [router]);
}
