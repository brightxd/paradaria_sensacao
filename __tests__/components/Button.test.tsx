import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza texto do botão", () => {
    render(<Button>Confirmar</Button>);
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
  });

  it("fica desabilitado quando loading=true", () => {
    render(<Button loading>Salvando</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("chama onClick quando clicado", () => {
    const mock = jest.fn();
    render(<Button onClick={mock}>Clique aqui</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("não chama onClick quando disabled", () => {
    const mock = jest.fn();
    render(<Button disabled onClick={mock}>Desabilitado</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(mock).not.toHaveBeenCalled();
  });
});
