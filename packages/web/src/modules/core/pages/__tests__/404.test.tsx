import { it, describe, expect } from "vitest";
import { render } from "@testing-library/react";
import { NotFoundScreen } from "../404";

describe("NotFoundScreen", () => {
  it("should render the NotFoundScreen component", () => {
    const { getByTestId } = render(<NotFoundScreen />);
    const notFoundScreen = getByTestId("not-found-screen");
    expect(notFoundScreen).toBeInTheDocument();
  });
});
