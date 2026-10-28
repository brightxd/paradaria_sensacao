import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/Textarea";

describe("Textarea", () => {
  it("renderiza com label", () => {
    render(<Textarea id="desc" label="Descrição" />);
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
  });

  it("exibe mensagem de erro", () => {
    render(<Textarea id="desc" label="Descrição" error="Campo obrigatório" />);
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("dispara onChange ao digitar", () => {
    const onChange = jest.fn();
    render(<Textarea id="desc" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "texto" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
