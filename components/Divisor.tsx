// Divisor decorativo: losango central entre duas linhas finas.
export default function Divisor({ claro = false }: { claro?: boolean }) {
  return (
    <div className={`divisor ${claro ? "divisor-claro" : ""}`}>
      <span />
      <i />
      <span />
    </div>
  );
}
