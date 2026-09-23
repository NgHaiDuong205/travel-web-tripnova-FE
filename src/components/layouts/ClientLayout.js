import { Outlet } from "react-router-dom";
import Header from "../client/Header";
import Footer from "../client/Footer";

function ClientLayout(){
    return(
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
export default ClientLayout;