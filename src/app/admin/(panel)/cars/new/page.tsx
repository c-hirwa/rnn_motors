import Link from "next/link";
import CarForm from "../CarForm";

export const metadata = { title: "Add a car" };

export default function NewCar() {
  return (
    <>
      <header className="ahead">
        <div>
          <Link href="/admin/cars" className="back">← Inventory</Link>
          <h1>Add a car</h1>
          <p>Fill in what you know; anything left blank shows as "On request" on the website.</p>
        </div>
      </header>
      <CarForm />
    </>
  );
}
