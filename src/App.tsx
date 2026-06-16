import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import OrderList from "@/pages/OrderList";
import OrderCreate from "@/pages/OrderCreate";
import OrderDetail from "@/pages/OrderDetail";
import ModelLayout from "@/pages/ModelLayout";
import ResinPrep from "@/pages/ResinPrep";
import PrintControl from "@/pages/PrintControl";
import CleaningCuring from "@/pages/CleaningCuring";
import SupportRemoval from "@/pages/SupportRemoval";
import Delivery from "@/pages/Delivery";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderCreate />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/layout" element={<ModelLayout />} />
          <Route path="/resin" element={<ResinPrep />} />
          <Route path="/print" element={<PrintControl />} />
          <Route path="/cleaning" element={<CleaningCuring />} />
          <Route path="/support" element={<SupportRemoval />} />
          <Route path="/delivery" element={<Delivery />} />
        </Routes>
      </Layout>
    </Router>
  );
}
