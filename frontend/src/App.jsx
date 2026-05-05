import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import CreateBill from './pages/CreateBill';
import Invoice from './pages/Invoice';
import Sales from './pages/Sales';
import Export from './pages/Export';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/create-bill" element={<CreateBill />} />
          <Route path="/create-bill/:id" element={<CreateBill />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
