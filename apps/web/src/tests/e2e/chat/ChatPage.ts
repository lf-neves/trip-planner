import { Page, expect } from "@playwright/test";

export class ChatPage {
  private page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage() {
    await this.page.goto("/");

    await expect(this.page.getByText("Agent Chat")).toBeVisible();
    await expect(this.page.getByRole("textbox")).toBeVisible({
      timeout: 10000,
    });
  }

  async sendMessage(message: string) {
    await this.page.getByRole("textbox").fill(message);
    await this.page.getByRole("button", { name: /send/i }).click();
  }

  getFlightItinerariesList() {
    return this.page.locator("[data-testid='flight-itineraries-list']");
  }
}
