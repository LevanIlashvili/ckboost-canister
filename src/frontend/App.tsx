import { Header } from './components/header';
import { Hero } from './components/hero';
import { Features } from './components/features';
import { HowItWorks } from './components/how-it-works';
import { Boosters } from './components/boosters';
import { Footer } from './components/footer';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Boosters />
      </main>
      <Footer />
    </div>
  );
}

export default App;
