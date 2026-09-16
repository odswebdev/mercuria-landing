import Hero from "./components/Hero";
import About from "./components/About";
import Performance from "./components/Performance";
import Exterior from "./components/Exterior";
import Configurator from "./components/Configurator";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-black font-sans antialiased">
      <Hero />
      <About />
      <Performance />
      <Exterior />
      <Configurator />
      <CallToAction />
      <Footer />
    </div>
  );
}
