import { Page } from "@playwright/test";

export class ChatPage {
  private page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage() {
    await this.page.goto("/");
  }

  async sendMessage(message: string) {
    await this.page.getByRole("textbox").fill(message);
    await this.page.getByRole("button", { name: /send/i }).click();
  }
}
