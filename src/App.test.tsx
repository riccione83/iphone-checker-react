import React from "react";
import { render, screen, act } from "@testing-library/react";
import axios from "axios";
import App from "./App";
import { Availability, Stores } from "./Mock/mock";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

test("renders learn react link", async () => {
  let payload: object = {};
  mockedAxios.get.mockResolvedValueOnce(async () => Promise.resolve(payload));
  mockedAxios.all.mockResolvedValueOnce([
    { data: Stores },
    { data: Availability },
  ]);

  await act(async () => render(<App />));
  expect(axios.all).toHaveBeenCalled();
  const linkElement = screen.getByText(/IPhone Checker by Riccardo Rizzo/i);
  expect(linkElement).toBeInTheDocument();

  const bromleyElement = screen.getByText("Bromley [15 Pro MAX (256GB Blue)]");
  expect(bromleyElement).toBeInTheDocument();

  const isDeviceAvailableInBromley = await screen.findAllByText(
    "Contract: YES"
  );
  expect(isDeviceAvailableInBromley[0]).toBeInTheDocument();
});
