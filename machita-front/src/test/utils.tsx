import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { AuthProvider } from "@/features/auth";

interface RenderWithAuthOptions extends Omit<RenderOptions, "wrapper"> {
  initialAuthState?: {
    user?: any;
    isAuthenticated?: boolean;
  };
}

/**
 * Custom render function that wraps components with AuthProvider
 * Useful for testing components that depend on authentication context
 */
export function renderWithAuth(
  ui: ReactElement,
  { initialAuthState, ...renderOptions }: RenderWithAuthOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // If initial auth state is provided, we can mock it
    // For now, just wrap with AuthProvider (can be extended later)
    return <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
