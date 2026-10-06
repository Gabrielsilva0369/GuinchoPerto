import { useEffect, useRef, useState } from "react";
import "../styles/header.css";

const LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#contato", label: "Contato" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao pressionar Escape e ao clicar fora
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="logo">
        <span className="logo__guincho">Guincho</span>
        <span className="logo__perto">Perto</span>
      </div>

      <div className="menu" ref={menuRef}>
        <button
          type="button"
          className="menu__toggle"
          aria-label={open ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={open}
          aria-controls="menu-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="menu__bar" aria-hidden="true"></span>
          <span className="menu__bar" aria-hidden="true"></span>
          <span className="menu__bar" aria-hidden="true"></span>
        </button>

        {open && (
          <nav id="menu-panel" className="menu__panel" aria-label="Navegação principal">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="menu__link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
