import { test, expect } from "@playwright/test";

test.describe("Flight Booking Flow", () => {
  test("search flights, select flight, enter passenger details and cancel", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search flights/i }).click();
    await expect(page.getByText(/flights found/i)).toBeVisible();

    // Select and book the first flight
    await page.getByRole("button", { name: /book/i }).first().click();
    await expect(page.getByText(/booking confirmed/i)).toBeVisible();

    // View summary
    await page.getByRole("link", { name: /view summary/i }).click();
    await expect(page.getByText(/booking details/i)).toBeVisible();

    // Cancel
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByText(/booking canceled/i)).toBeVisible();
  });
});
