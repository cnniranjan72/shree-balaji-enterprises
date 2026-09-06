import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ModeProvider } from './contexts/ModeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import CreateBill from './pages/CreateBill';
import Invoice from './pages/Invoice';
import Sales from './pages/Sales';
import Export from './pages/Export';
import PurchaseDashboard from './pages/PurchaseDashboard';
import PurchaseSuppliers from './pages/PurchaseSuppliers';
import PurchaseProducts from './pages/PurchaseProducts';
import CreatePurchaseBill from './pages/CreatePurchaseBill';
import PurchaseBillView from './pages/PurchaseBillView';
import Purchases from './pages/Purchases';
import PurchaseExport from './pages/PurchaseExport';

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/create-bill" element={
                <ProtectedRoute>
                  <CreateBill />
                </ProtectedRoute>
              } />
              <Route path="/create-bill/:id" element={
                <ProtectedRoute>
                  <CreateBill />
                </ProtectedRoute>
              } />
              <Route path="/invoice/:id" element={<Invoice />} />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/export" element={
                <ProtectedRoute>
                  <Export />
                </ProtectedRoute>
              } />
              <Route path="/purchases" element={
                <ProtectedRoute>
                  <PurchaseDashboard />
                </ProtectedRoute>
              } />
              <Route path="/purchase-suppliers" element={
                <ProtectedRoute>
                  <PurchaseSuppliers />
                </ProtectedRoute>
              } />
              <Route path="/purchase-products" element={
                <ProtectedRoute>
                  <PurchaseProducts />
                </ProtectedRoute>
              } />
              <Route path="/create-purchase" element={
                <ProtectedRoute>
                  <CreatePurchaseBill />
                </ProtectedRoute>
              } />
              <Route path="/create-purchase/:id" element={
                <ProtectedRoute>
                  <CreatePurchaseBill />
                </ProtectedRoute>
              } />
              <Route path="/purchase-view/:id" element={
                <ProtectedRoute>
                  <PurchaseBillView />
                </ProtectedRoute>
              } />
              <Route path="/purchases-history" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              <Route path="/purchase-export" element={
                <ProtectedRoute>
                  <PurchaseExport />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;
