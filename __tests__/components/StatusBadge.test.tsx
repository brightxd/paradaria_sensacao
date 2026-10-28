import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/StatusBadge";

describe("StatusBadge", () => {
  it('exibe "Recebido" para status recebido', () => {
    render(<StatusBadge status="recebido" />);
    expect(screen.getByText("Recebido")).toBeInTheDocument();
  });

  it('exibe "Confirmado" para status confirmado', () => {
    render(<StatusBadge status="confirmado" />);
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });
});
