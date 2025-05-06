"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Removed direct import of ThemeProviderProps, will infer or use a more robust method if needed.

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 