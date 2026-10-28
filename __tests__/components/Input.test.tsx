import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renderiza com label", () => {
    render(<Input id="test" label="Nome" />);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("exibe mensagem de erro", () => {
    render(<Input id="test" label="Email" error="E-mail inválido" />);
    expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
  });

  it("aceita valor digitado", () => {
    render(<Input id="test" label="Nome" defaultValue="João" />);
    expect(screen.getByDisplayValue("João")).toBeInTheDocument();
  });

  it("dispara onChange ao digitar", () => {
    const onChange = jest.fn();
    render(<Input id="test" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
