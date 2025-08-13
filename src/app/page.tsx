import Image from "next/image";
import Header from "./components/header/header";
import Grid from "./components/grid/grid";
import Landing from "./components/landing/landing";

export default function Home() {
  return (
    <div className="page">
      <main>
        <Landing/>
      </main>
    </div>
  );
}
