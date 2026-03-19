import Home from"../page";
import Login from"@/components/Login";

export const dynamic ="force-dynamic";

export default function DemoOnePage() {
 return (
 <main className="min-h-screen w-full">
 <Home />
 <Login />
 </main>
 );
}
