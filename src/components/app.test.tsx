import App from "components/app";
import * as React from "react";
import * as renderer from "react-test-renderer";

it("renders without crashing", () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});
