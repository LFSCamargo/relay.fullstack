import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LandingPage } from "../LandingPage";

describe("LandingPage", () => {
  const { getByTestId } = render(<LandingPage />);

  it("renders the landing page title", () => {
    const title = getByTestId("landing-page-title");
    const icon = getByTestId("landing-page-icon");
    const quote = getByTestId("landing-page-quote");

    expect(title).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(quote).toBeInTheDocument();
  });
});
