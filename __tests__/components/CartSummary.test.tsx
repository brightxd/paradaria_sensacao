import { render, screen, fireEvent } from "@testing-library/react";
import { CartSummary } from "@/components/cart/CartSummary";
import type { ItemCarrinho } from "@/types/carrinho";

const itens: ItemCarrinho[] = [
  { itemId: "1", nome: "Pão de queijo", valorCents: 300, fotoUrl: null, quantidade: 2 },
  { itemId: "2", nome: "Café", valorCents: 500, fotoUrl: null, quantidade: 1 },
];

describe("CartSummary", () => {
  it("exibe itens do carrinho", () => {
    render(<CartSummary itens={itens} total={1100} onRemover={jest.fn()} />);
    expect(screen.getByText("Pão de queijo")).toBeInTheDocument();
    expect(screen.getByText("Café")).toBeInTheDocument();
  });

  it("exibe total formatado", () => {
    render(<CartSummary itens={itens} total={1100} onRemover={jest.fn()} />);
    expect(screen.getByText("R$ 11,00")).toBeInTheDocument();
  });

  it("chama onRemover ao clicar no botão de remover", () => {
    const onRemover = jest.fn();
    render(<CartSummary itens={itens} total={1100} onRemover={onRemover} />);
    fireEvent.click(screen.getByLabelText(/remover pão de queijo/i));
    expect(onRemover).toHaveBeenCalledWith("1");
  });

  it("exibe mensagem de carrinho vazio quando sem itens", () => {
    render(<CartSummary itens={[]} total={0} onRemover={jest.fn()} />);
    expect(screen.getByText(/vazio/i)).toBeInTheDocument();
  });
});
