import Header from "./components/Header";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import FinalCTA from "./components/FinalCTA";
import { useScrollReveal } from "./lib/useScrollReveal";
import { useAccessBlock } from "./lib/ipBlock";
import { PhoneProvider } from "./lib/PhoneContext";
import type { PhoneKey } from "./lib/contact";

function App({ phone }: { phone: PhoneKey }) {
  const blocked = useAccessBlock();
  useScrollReveal();

  // Visitante bloqueado está sendo redirecionado para o Google: não mostra o site.
  if (blocked) {
    return null;
  }

  return (
    <PhoneProvider phone={phone}>
      <main className="page-shell">
        <Header />
        <Hero />
        <ServiceCards />
        <FinalCTA />
      </main>
    </PhoneProvider>
  );
}

export default App;
