import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("exibe o nome da padaria", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /padaria 100sação/i }).first()).toBeVisible();
  });

  test("link para o cardápio funciona", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ver cardápio", exact: true }).first().click();
    await expect(page).toHaveURL("/itens");
  });
});

test.describe("Navbar", () => {
  test("contém os links de navegação", async ({ page }) => {
    await page.goto("/");
    const burger = page.getByRole("button", { name: "Menu" });
    if (await burger.isVisible()) {
      await burger.click();
    }
    await expect(page.getByRole("link", { name: "Cardápio" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /meu pedido/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /acompanhar/i }).first()).toBeVisible();
  });
});

test.describe("Novo produto", () => {
  test("exibe formulário de cadastro", async ({ page }) => {
    await page.goto("/itens/novo");
    await expect(page.getByLabel(/nome do produto/i)).toBeVisible();
    await expect(page.getByLabel(/preço/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /salvar produto/i })).toBeVisible();
  });

  test("mostra erros de validação para campos obrigatórios", async ({ page }) => {
    await page.goto("/itens/novo");
    await page.getByLabel(/nome do produto/i).fill("a"); // length < 2 → fails React validation
    await page.getByLabel(/preço/i).fill("0");           // value <= 0  → fails React validation
    await page.getByRole("button", { name: /salvar produto/i }).click();
    await expect(page.getByText(/ao menos 2 caracteres/i)).toBeVisible();
  });
});

test.describe("Checkout com carrinho vazio", () => {
  test("redireciona para o cardápio", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText(/vazio/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /ver cardápio/i })).toBeVisible();
  });
});

test.describe("Pedidos", () => {
  test("exibe a página de pedidos", async ({ page }) => {
    await page.goto("/pedidos");
    await expect(page.getByRole("heading", { name: /meus pedidos/i })).toBeVisible();
  });
});
