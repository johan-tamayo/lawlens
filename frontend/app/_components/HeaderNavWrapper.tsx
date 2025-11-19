"use client";

/**
 * HeaderNav Wrapper
 *
 * Client Component wrapper for HeaderNav to avoid passing functions from Server Components.
 */

import { useCallback } from "react";
import HeaderNav from "./HeaderNav";

export default function HeaderNavWrapper() {
  const handleSignOut = useCallback(() => {
    // TODO: Implement sign out functionality
    console.log("Sign out clicked");
  }, []);

  return <HeaderNav signOut={handleSignOut} />;
}
