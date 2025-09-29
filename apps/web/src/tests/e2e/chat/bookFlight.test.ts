import { test, expect } from "@playwright/test";
import { ChatPage } from "./ChatPage";

test.describe("Flight Booking Flow", () => {
  test("should skip setup page and allow flight booking", async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.navigateToPage();

    await chatPage.sendMessage(
      "Book a flight from New York to San Francisco. My name is John Doe and my email is john.doe@example.com.",
    );

    // act
    const flightItinerariesList = chatPage.getFlightItinerariesList();
    await expect(flightItinerariesList).toBeVisible({ timeout: 15000 });
  });
});
