import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import StoresPage from './StoresPage';
import LoginPage from './LoginPage';
import BrandsPage from './BrandsPage';
import InventoryPage from './InventoryPage';
import CategoriesPage from './CategoryPage';
import CollectionsPage from './CollectionsPage';
import ProductsPage from './ProductsPage';
import CustomersPage from './CustomersPage';
import VendorsPage from './VendorsPage';
import TagsPage from './TagsPage';
import OrdersPage from './OrdersPage';
import ReservationPage from './ReservationPage';
import DashboardPage from './Dashboard'
import 'primereact/resources/themes/saga-blue/theme.css';  // Choose a theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


// Import other components

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <Routes>
          <Route path="/dashboard" element = {<DashboardPage/>}/> 
          <Route path="/login" element = {<LoginPage/>}/>
          <Route path="/stores" element = {<StoresPage/>}/>
          <Route path="/brands" element = {<BrandsPage/>}/>
          <Route path="/collections" element = {<CollectionsPage/>}/>
          <Route path="/categories" element = {<CategoriesPage/>}/>
          <Route path="/tags" element = {<TagsPage/>}/>
          <Route path="/products" element = {<ProductsPage/>}/>
          <Route path="/customers" element = {<CustomersPage/>}/>
          <Route path="/vendors" element = {<VendorsPage/>}/>
          <Route path="/inventory" element = {<InventoryPage/>}/> 
          <Route path="/orders" element = {<OrdersPage/>}/> 
          <Route path="/reservation" element = {<ReservationPage/>}/> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
