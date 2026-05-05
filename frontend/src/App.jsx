import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import CreateBill from './pages/CreateBill';
import Invoice from './pages/Invoice';
import Sales from './pages/Sales';
import Export from './pages/Export';

function App() {
  return (
    <AuthProvider>
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
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
