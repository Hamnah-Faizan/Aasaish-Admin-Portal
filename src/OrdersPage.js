// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import {
//   Typography, Container, Box
// } from '@mui/material';
// import Sidebar from './Sidebar';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
// import { Toolbar } from 'primereact/toolbar';
// import { Button } from 'primereact/button';
// import { useSnackbar } from 'notistack';
// import { Dropdown } from 'primereact/dropdown';
// import 'primereact/resources/themes/saga-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';
// import { BASE_URL } from './config';

// const OrdersPage = () => {
//   const { enqueueSnackbar } = useSnackbar();
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [inventories, setInventories] = useState([]);
//   const [availableColors, setAvailableColors] = useState([]);
//   const [availableSizes, setAvailableSizes] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const dt = useRef(null);
//   const [orderDialog, setOrderDialog] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [statusDialog, setStatusDialog] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [newStatus, setNewStatus] = useState('');
//   const [newOrder, setNewOrder] = useState({
//     userId: '',
//     items: [{
//       productId: '',
//       inventoryId: '',
//       quantity: 1,
//       variant: {
//         color: '',
//         size: ''
//       },
//       price: 0
//     }],
//     total: 0,
//     paymentMethod: '',
//     shippingDetails: {
//       firstName: '',
//       lastName: '',
//       address: '',
//       city: '',
//       country: '',
//       zipCode: ''
//     },
//     deliveryLocation: {
//       coordinates: [0, 0]  // Default coordinates
//     }
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     fetchOrders();
//     fetchProducts();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Order/orders`);
//       setOrders(response.data);
//     } catch (error) {
//       console.error("Failed to fetch orders:", error);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Product/getproducts`);
//       console.log("Fetched products:", response.data); // Debugging line
//       setProducts(response.data);
//     } catch (error) {
//       console.error("Failed to fetch products:", error);
//     }
//   };

//   const fetchInventories = async (productId) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Inventory/getinventory/product/${productId}`);
//       setInventories(response.data);
//       const variants = response.data.flatMap(inventory => inventory.variants);
//       const colors = [...new Set(variants.map(variant => variant.color))];
//       const sizes = [...new Set(variants.map(variant => variant.size))];
//       setAvailableColors(colors);
//       setAvailableSizes(sizes);
//     } catch (error) {
//       console.error("Failed to fetch inventories:", error);
//     }
//   };
//   const handleStatusUpdate = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error("Access token not available.");
//         return;
//       }
//       await axios.patch(`${BASE_URL}/Order/update-item-status`, {
//         orderId: selectedOrder._id,
//         itemId: selectedItem._id,
//         status: newStatus
//       }, { headers: { Authorization: `Bearer ${token}` } });

//       enqueueSnackbar('Order item status updated successfully', { variant: 'success' });
//       setStatusDialog(false);
//       fetchOrders();
//     } catch (error) {
//       console.error('Failed to update order item status:', error);
//       enqueueSnackbar('Failed to update order item status', { variant: 'error' });
//     }
//   };

//   const openStatusDialog = (order, item) => {
//     setSelectedOrder(order);
//     setSelectedItem(item);
//     setNewStatus(item.status);
//     setStatusDialog(true);
//   };

//   const hideStatusDialog = () => {
//     setStatusDialog(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewOrder(prevState => ({
//       ...prevState,
//       [name]: value
//     }));
//   };

//   const handleShippingDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setNewOrder(prevState => ({
//       ...prevState,
//       shippingDetails: {
//         ...prevState.shippingDetails,
//         [name]: value
//       }
//     }));
//   };

//   const handleItemChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedItems = newOrder.items.map((item, i) => (
//         i === index ? { ...item, [name]: name === 'price' ? parseFloat(value) : value } : item
//     ));
//     setNewOrder(prevState => ({
//         ...prevState,
//         items: updatedItems
//     }));

//     if (name === 'productId') {
//         fetchInventories(value);
//     }
// };

//   const handleVariantChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedItems = newOrder.items.map((item, i) => (
//       i === index ? { ...item, variant: { ...item.variant, [name]: value } } : item
//     ));
//     setNewOrder(prevState => ({
//       ...prevState,
//       items: updatedItems
//     }));
//   };

// const handleAddOrder = async () => {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.error("Access token not available.");
//             return;
//         }
        
//         // Ensure total is a number
//         const orderData = {
//             ...newOrder,
//             total: parseFloat(newOrder.total),
//             items: newOrder.items.map(item => ({
//                 ...item,
//                 price: parseFloat(item.price)
//             }))
//         };

//         console.log("Order Data:", orderData); // Debugging line

//         await axios.post(`${BASE_URL}/Order/create`, orderData, { headers: { Authorization: `Bearer ${token}` } });
//         enqueueSnackbar('Order added successfully', { variant: 'success' });
//         setOrderDialog(false);
//         fetchOrders();
//     } catch (error) {
//         console.error('Failed to add order:', error);
//         enqueueSnackbar('Failed to add order', { variant: 'error' });
//     }
// };


//   const handleDeleteOrder = async (orderId) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error("Access token not available.");
//         return;
//       }
//       await axios.delete(`${BASE_URL}/Order/deleteorder/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
//       enqueueSnackbar('Order deleted successfully', { variant: 'success' });
//       fetchOrders();
//     } catch (error) {
//       console.error('Failed to delete order:', error);
//       enqueueSnackbar('Failed to delete order', { variant: 'error' });
//     }
//   };

//   const openOrderDialog = () => {
//     setNewOrder({
//       userId: '',
//       items: [{
//         productId: '',
//         inventoryId: '',
//         quantity: 1,
//         variant: {
//           color: '',
//           size: ''
//         },
//         price: 0
//       }],
//       total: 0,
//       paymentMethod: '',
//       shippingDetails: {
//         firstName: '',
//         lastName: '',
//         address: '',
//         city: '',
//         country: '',
//         zipCode: ''
//       },
//       deliveryLocation: {
//         coordinates: [0, 0]  
//       }
//     });
//     setOrderDialog(true);
//   };

//   const hideOrderDialog = () => {
//     setOrderDialog(false);
//   };

//   const actionBodyTemplate = (rowData) => {
//     return (
//       <React.Fragment>
//         <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => openStatusDialog(rowData, rowData.items[0])} />
//         <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDeleteOrder(rowData._id)} />
//       </React.Fragment>
//     );
//   };

//   const orderDetailsBodyTemplate = (rowData) => {
//     return rowData.items.map(item => (
//       <div key={item._id}>
//         {item.quantity} x {item.productId ? item.productId.name : 'Unknown Product'} (Size: {item.variant.size}, Color: {item.variant.color}) - ${item.price.toFixed(2)} each
//       </div>
//     ));
//   };

//   const header = (
//     <div className="table-header">
//       <h5 className="mx-0 my-1">Manage Orders</h5>
//       <span className="custom-search">
//         <i className="pi pi-search" />
//         <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
//       </span>
//     </div>
//   );

//   const leftToolbarTemplate = () => {
//     return (
//       <React.Fragment>
//         <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openOrderDialog} />
//       </React.Fragment>
//     );
//   };

//   const rightToolbarTemplate = () => {
//     return (
//       <React.Fragment>
//         <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={() => dt.current.exportCSV()} />
//       </React.Fragment>
//     );
//   };

//   return (
//     <Container maxWidth="xl">
//       <style jsx>{`
//         .custom-search {
//           display: flex;
//           align-items: center;
//         }
//         .custom-search .pi {
//           margin-right: 8px;
//         }
//       `}</style>
//       <Box sx={{ display: "flex", overflowX: 'hidden' }}>
//         <Sidebar />
//         <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden' }}>
//           <Typography variant="h4" gutterBottom align="center">
//             Orders
//           </Typography>
//           <div className="card" style={{ overflowX: 'auto' }}>
//             <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
//             <DataTable
//               ref={dt}
//               value={orders}
//               paginator
//               header={header}
//               rows={10}
//               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
//               rowsPerPageOptions={[10, 25, 50]}
//               dataKey="_id"
//               selectionMode="checkbox"
//               globalFilter={globalFilter}
//               emptyMessage="No orders found."
//               currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
//               tableStyle={{ minWidth: '100%' }}
//               showGridlines
//               stripedRows
//             >
//               <Column field="userId.username" header="User" sortable filter filterPlaceholder="Search by user" style={{ minWidth: '12rem' }} />
//               <Column field="total" header="Total" sortable filter filterPlaceholder="Search by total" style={{ minWidth: '12rem' }} />
//               <Column field="paymentMethod" header="Payment Method" sortable filter filterPlaceholder="Search by payment method" style={{ minWidth: '12rem' }} />
//               <Column field="shippingDetails.address" header="Shipping Address" sortable filter filterPlaceholder="Search by address" style={{ minWidth: '12rem' }} />
//               <Column header="Order Details" body={orderDetailsBodyTemplate} style={{ minWidth: '12rem' }} />
//               <Column header="Actions" headerStyle={{ width: '8rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
//             </DataTable>
//           </div>

//           <Dialog visible={statusDialog} style={{ width: '450px' }} header="Update Order Item Status" modal className="p-fluid" footer={() => (
//             <>
//               <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideStatusDialog} />
//               <Button label="Update" icon="pi pi-check" className="p-button-text" onClick={handleStatusUpdate} />
//             </>
//           )} onHide={hideStatusDialog}>
//             <div className="p-field">
//               <label htmlFor="status">Status</label>
//               <Dropdown id="status" value={newStatus} options={[
//                 { label: 'Pending', value: 'Pending' },
//                 { label: 'Processing', value: 'Processing' },
//                 { label: 'Shipped', value: 'Shipped' },
//                 { label: 'Delivered', value: 'Delivered' },
//                 { label: 'Cancelled', value: 'Cancelled' },
//               ]} onChange={(e) => setNewStatus(e.value)} placeholder="Select a Status" />
//             </div>
//           </Dialog>

//           <Dialog visible={orderDialog} style={{ width: '450px' }} header="New Order" modal className="p-fluid" footer={() => (
//             <>
//               <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideOrderDialog} />
//               <Button label="Add" icon="pi pi-check" className="p-button-text" onClick={handleAddOrder} />
//             </>
//           )} onHide={hideOrderDialog}>
//             <div className="p-field">
//               <label htmlFor="userId">User ID</label>
//               <InputText id="userId" value={newOrder.userId} onChange={handleChange} name="userId" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="total">Total</label>
//               <InputText id="total" value={newOrder.total} onChange={handleChange} name="total" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="paymentMethod">Payment Method</label>
//               <InputText id="paymentMethod" value={newOrder.paymentMethod} onChange={handleChange} name="paymentMethod" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="firstName">First Name</label>
//               <InputText id="firstName" value={newOrder.shippingDetails.firstName} onChange={handleShippingDetailsChange} name="firstName" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="lastName">Last Name</label>
//               <InputText id="lastName" value={newOrder.shippingDetails.lastName} onChange={handleShippingDetailsChange} name="lastName" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="phone">Phone</label>
//               <InputText id="phone" value={newOrder.shippingDetails.phone} onChange={handleShippingDetailsChange} name="phone" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="address">Address</label>
//               <InputText id="address" value={newOrder.shippingDetails.address} onChange={handleShippingDetailsChange} name="address" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="city">City</label>
//               <InputText id="city" value={newOrder.shippingDetails.city} onChange={handleShippingDetailsChange} name="city" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="country">Country</label>
//               <InputText id="country" value={newOrder.shippingDetails.country} onChange={handleShippingDetailsChange} name="country" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="zipCode">Zip Code</label>
//               <InputText id="zipCode" value={newOrder.shippingDetails.zipCode} onChange={handleShippingDetailsChange} name="zipCode" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="latitude">Latitude</label>
//               <InputText id="latitude" value={newOrder.deliveryLocation.coordinates[1]} onChange={(e) => setNewOrder(prevState => ({
//                 ...prevState,
//                 deliveryLocation: {
//                   ...prevState.deliveryLocation,
//                   coordinates: [prevState.deliveryLocation.coordinates[0], parseFloat(e.target.value)]
//                 }
//               }))} required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="longitude">Longitude</label>
//               <InputText id="longitude" value={newOrder.deliveryLocation.coordinates[0]} onChange={(e) => setNewOrder(prevState => ({
//                 ...prevState,
//                 deliveryLocation: {
//                   ...prevState.deliveryLocation,
//                   coordinates: [parseFloat(e.target.value), prevState.deliveryLocation.coordinates[1]]
//                 }
//               }))} required />
//             </div>
//             {newOrder.items.map((item, index) => (
//               <div key={index}>
//                 <div className="p-field">
//                   <label htmlFor={`productId-${index}`}>Product ID</label>
//                   <InputText id={`productId-${index}`} value={item.productId} onChange={(e) => handleItemChange(e, index)} name="productId" required />
//                 </div>
//                 <div className="p-field">
//                   <label htmlFor={`inventoryId-${index}`}>Inventory</label>
//                   <Dropdown id={`inventoryId-${index}`} value={item.inventoryId} options={inventories.map(inventory => ({ label: inventory._id, value: inventory._id }))} onChange={(e) => handleItemChange(e, index)} name="inventoryId" required />
//                 </div>
//                 <div className="p-field">
//                   <label htmlFor={`quantity-${index}`}>Quantity</label>
//                   <InputText id={`quantity-${index}`} value={item.quantity} onChange={(e) => handleItemChange(e, index)} name="quantity" required />
//                 </div>
//                 <div className="p-field">
//                   <label htmlFor={`color-${index}`}>Color</label>
//                   <Dropdown id={`color-${index}`} value={item.variant.color} options={availableColors.map(color => ({ label: color, value: color }))} onChange={(e) => handleVariantChange(e, index)} name="color" placeholder="Select a Color" required />
//                 </div>
//                 <div className="p-field">
//                   <label htmlFor={`size-${index}`}>Size</label>
//                   <Dropdown id={`size-${index}`} value={item.variant.size} options={availableSizes.map(size => ({ label: size, value: size }))} onChange={(e) => handleVariantChange(e, index)} name="size" placeholder="Select a Size" required />
//                 </div>
//                 <div className="p-field">
//                   <label htmlFor={`price-${index}`}>Price</label>
//                   <InputText id={`price-${index}`} value={item.price} onChange={(e) => handleItemChange(e, index)} name="price" required />
//                 </div>
//               </div>
//             ))}
//           </Dialog>
//         </Box>
//       </Box>
//     </Container>
//   );
// };

// export default OrdersPage;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Typography, Container, Box
} from '@mui/material';
import Sidebar from './Sidebar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { useSnackbar } from 'notistack';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { BASE_URL } from './config';

const OrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newOrder, setNewOrder] = useState({
    userId: '',
    items: [{
      productId: '',
      inventoryId: '',
      quantity: 1,
      variant: {
        color: '',
        size: ''
      },
      price: 0
    }],
    total: 0,
    paymentMethod: '',
    shippingDetails: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      zipCode: ''
    },
    deliveryLocation: {
      coordinates: [0, 0]  // Default coordinates
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Order/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Product/getproducts`);
      console.log("Fetched products:", response.data); // Debugging line
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchInventories = async (productId) => {
    try {
      const response = await axios.get(`${BASE_URL}/Inventory/getinventory/product/${productId}`);
      setInventories(response.data);
      const variants = response.data.flatMap(inventory => inventory.variants);
      const colors = [...new Set(variants.map(variant => variant.color))];
      const sizes = [...new Set(variants.map(variant => variant.size))];
      setAvailableColors(colors);
      setAvailableSizes(sizes);
    } catch (error) {
      console.error("Failed to fetch inventories:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Access token not available.");
        return;
      }
      await axios.patch(`${BASE_URL}/Order/update-item-status`, {
        orderId: selectedOrder._id,
      }, { headers: { Authorization: `Bearer ${token}` } });

      enqueueSnackbar('Order item status updated successfully', { variant: 'success' });
      setStatusDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order item status:', error);
      enqueueSnackbar('Failed to update order item status', { variant: 'error' });
    }
  };

  const openStatusDialog = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setNewStatus(item.status);
    setStatusDialog(true);
  };

  const hideStatusDialog = () => {
    setStatusDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleShippingDetailsChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prevState => ({
      ...prevState,
      shippingDetails: {
        ...prevState.shippingDetails,
        [name]: value
      }
    }));
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = newOrder.items.map((item, i) => (
      i === index ? { ...item, [name]: name === 'price' ? parseFloat(value) : value } : item
    ));
    setNewOrder(prevState => ({
      ...prevState,
      items: updatedItems
    }));

    if (name === 'productId') {
      fetchInventories(value);
    }
  };

  const handleVariantChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = newOrder.items.map((item, i) => (
      i === index ? { ...item, variant: { ...item.variant, [name]: value } } : item
    ));
    setNewOrder(prevState => ({
      ...prevState,
      items: updatedItems
    }));
  };

  const handleAddOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Access token not available.");
        return;
      }
      const orderData = {
        ...newOrder,
        total: parseFloat(newOrder.total),
        items: newOrder.items.map(item => ({
          ...item,
          price: parseFloat(item.price)
        }))
      };

      console.log("Order Data:", orderData); // Debugging line

      await axios.post(`${BASE_URL}/Order/create`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('Order added successfully', { variant: 'success' });
      setOrderDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to add order:', error);
      enqueueSnackbar('Failed to add order', { variant: 'error' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Order/deleteorder/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('Order deleted successfully', { variant: 'success' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      enqueueSnackbar('Failed to delete order', { variant: 'error' });
    }
  };

  const openOrderDialog = () => {
    setNewOrder({
      userId: '',
      items: [{
        productId: '',
        inventoryId: '',
        quantity: 1,
        variant: {
          color: '',
          size: ''
        },
        price: 0,
      }],
      total: 0,
      paymentMethod: '',
      shippingDetails: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        zipCode: ''
      },
      deliveryLocation: {
        coordinates: [0, 0]  
      }
    });
    setOrderDialog(true);
  };

  const hideOrderDialog = () => {
    setOrderDialog(false);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => openStatusDialog(rowData, rowData.items[0])} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDeleteOrder(rowData._id)} />
      </div>
    );
  };

  const orderDetailsBodyTemplate = (rowData) => {
    return rowData.items.map((item, index) => (
      <div key={index} style={{ padding: '0.5rem 0' }}>
        <strong>Product Name:</strong> {item.productId ? item.productId.name : 'Unknown Product'}<br />
        <strong>Brand:</strong> {item.productId && item.productId.brandId ? item.productId.brandId.name : 'No brand info'}<br />
        <strong>Price:</strong> ${item.price.toFixed(2)}<br />
        <strong>Quantity:</strong> {item.quantity}<br />
        <strong>Size:</strong> {item.variant.size}<br />
        <strong>Color:</strong> {item.variant.color}<br />
      </div>
    ));
  };

  const shippingDetailsBodyTemplate = (rowData) => (
    <div>
      {rowData.shippingDetails.firstName} {rowData.shippingDetails.lastName}<br />
      {rowData.shippingDetails.address}, {rowData.shippingDetails.city}<br />
      {rowData.shippingDetails.zipCode}, {rowData.shippingDetails.country}
    </div>
  );

  const deliveryLocationBodyTemplate = (rowData) => (
    <div>
      Coordinates: {rowData.deliveryLocation.coordinates[1]}, {rowData.deliveryLocation.coordinates[0]}
    </div>
  );

  const orderStatusBodyTemplate = (rowData) => {
    return rowData.items.map((item, index) => (
      <div key={index} style={{ padding: '0.5rem 0' }}>
        {item.status}<br />
      </div>
    ));
  };
  

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Orders</h5>
      <span className="custom-search">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
      </span>
    </div>
  );

  const leftToolbarTemplate = () => {
    return (
      <div className="button-container">
        <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openOrderDialog} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={() => dt.current.exportCSV()} />
      </React.Fragment>
    );
  };

  return (
    <Container maxWidth="xl">
      <style jsx>{`
        .custom-search {
          display: flex;
          align-items: center;
        }
        .custom-search .pi {
          margin-right: 8px;
        }
        .button-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .button-container .p-button {
          margin: 0 5px;
        }  
      `}</style>
      <Box sx={{ display: "flex", overflowX: 'hidden' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden' }}>
          <Typography variant="h4" gutterBottom align="center">
            Orders
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={orders}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No orders found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '100%' }}
              showGridlines
              stripedRows
            >
               <Column field="userId.username" header="User Details" sortable filter filterPlaceholder="Search by user" style={{ minWidth: '12rem' }} />
              <Column header="Shipping Address" body={shippingDetailsBodyTemplate} style={{ minWidth: '12rem' }} />
              <Column header="Delivery Location" body={deliveryLocationBodyTemplate} style={{ minWidth: '12rem' }} />
              <Column header="Order Details" body={orderDetailsBodyTemplate} sortable filter filterPlaceholder="Search by brand" style={{ minWidth: '25rem' }} />
              <Column field="total" header="Total ($)" sortable filter filterPlaceholder="Search by total" style={{ minWidth: '10rem' }} />
              <Column field="paymentMethod" header="Payment Method" sortable filter filterPlaceholder="Search by payment method" style={{ minWidth: '10rem' }} />
              <Column header="Status" body={orderStatusBodyTemplate} sortable filter filterPlaceholder="Search by status" style={{ minWidth: '12rem' }} />
              <Column header="Actions" headerStyle={{ width: '8rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={statusDialog} style={{ width: '450px' }} header="Update Order Item Status" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideStatusDialog} />
              <Button label="Update" icon="pi pi-check" className="p-button-text" onClick={handleStatusUpdate} />
            </>
          )} onHide={hideStatusDialog}>
            <div className="p-field">
              <label htmlFor="status">Status</label>
              <Dropdown id="status" value={newStatus} options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Processing', value: 'Processing' },
                { label: 'Shipped', value: 'Shipped' },
                { label: 'Delivered', value: 'Delivered' },
                { label: 'Cancelled', value: 'Cancelled' },
              ]} onChange={(e) => setNewStatus(e.value)} placeholder="Select a Status" />
            </div>
          </Dialog>

          <Dialog visible={orderDialog} style={{ width: '450px' }} header="New Order" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideOrderDialog} />
              <Button label="Add" icon="pi pi-check" className="p-button-text" onClick={handleAddOrder} />
            </>
          )} onHide={hideOrderDialog}>
            <div className="p-field">
              <label htmlFor="userId">User ID</label>
              <InputText id="userId" value={newOrder.userId} onChange={handleChange} name="userId" required />
            </div>
            <div className="p-field">
              <label htmlFor="firstName">First Name</label>
              <InputText id="firstName" value={newOrder.shippingDetails.firstName} onChange={handleShippingDetailsChange} name="firstName" required />
            </div>
            <div className="p-field">
              <label htmlFor="lastName">Last Name</label>
              <InputText id="lastName" value={newOrder.shippingDetails.lastName} onChange={handleShippingDetailsChange} name="lastName" required />
            </div>
            <div className="p-field">
              <label htmlFor="phone">Phone</label>
              <InputText id="phone" value={newOrder.shippingDetails.phone} onChange={handleShippingDetailsChange} name="phone" required />
            </div>
            <div className="p-field">
              <label htmlFor="address">Address</label>
              <InputText id="address" value={newOrder.shippingDetails.address} onChange={handleShippingDetailsChange} name="address" required />
            </div>
            <div className="p-field">
              <label htmlFor="city">City</label>
              <InputText id="city" value={newOrder.shippingDetails.city} onChange={handleShippingDetailsChange} name="city" required />
            </div>
            <div className="p-field">
              <label htmlFor="country">Country</label>
              <InputText id="country" value={newOrder.shippingDetails.country} onChange={handleShippingDetailsChange} name="country" required />
            </div>
            <div className="p-field">
              <label htmlFor="zipCode">Zip Code</label>
              <InputText id="zipCode" value={newOrder.shippingDetails.zipCode} onChange={handleShippingDetailsChange} name="zipCode" required />
            </div>
            <div className="p-field">
              <label htmlFor="latitude">Latitude</label>
              <InputText id="latitude" value={newOrder.deliveryLocation.coordinates[1]} onChange={(e) => setNewOrder(prevState => ({
                ...prevState,
                deliveryLocation: {
                  ...prevState.deliveryLocation,
                  coordinates: [prevState.deliveryLocation.coordinates[0], parseFloat(e.target.value)]
                }
              }))} required />
            </div>
            <div className="p-field">
              <label htmlFor="longitude">Longitude</label>
              <InputText id="longitude" value={newOrder.deliveryLocation.coordinates[0]} onChange={(e) => setNewOrder(prevState => ({
                ...prevState,
                deliveryLocation: {
                  ...prevState.deliveryLocation,
                  coordinates: [parseFloat(e.target.value), prevState.deliveryLocation.coordinates[1]]
                }
              }))} required />
            </div>
            {newOrder.items.map((item, index) => (
              <div key={index}>
                <div className="p-field">
                  <label htmlFor={`productId-${index}`}>Product ID</label>
                  <InputText id={`productId-${index}`} value={item.productId} onChange={(e) => handleItemChange(e, index)} name="productId" required />
                </div>
                <div className="p-field">
                  <label htmlFor={`inventoryId-${index}`}>Inventory</label>
                  <Dropdown id={`inventoryId-${index}`} value={item.inventoryId} options={inventories.map(inventory => ({ label: inventory._id, value: inventory._id }))} onChange={(e) => handleItemChange(e, index)} name="inventoryId" required />
                </div>
                <div className="p-field">
                  <label htmlFor={`quantity-${index}`}>Quantity</label>
                  <InputText id={`quantity-${index}`} value={item.quantity} onChange={(e) => handleItemChange(e, index)} name="quantity" required />
                </div>
                <div className="p-field">
                  <label htmlFor={`color-${index}`}>Color</label>
                  <Dropdown id={`color-${index}`} value={item.variant.color} options={availableColors.map(color => ({ label: color, value: color }))} onChange={(e) => handleVariantChange(e, index)} name="color" placeholder="Select a Color" required />
                </div>
                <div className="p-field">
                  <label htmlFor={`size-${index}`}>Size</label>
                  <Dropdown id={`size-${index}`} value={item.variant.size} options={availableSizes.map(size => ({ label: size, value: size }))} onChange={(e) => handleVariantChange(e, index)} name="size" placeholder="Select a Size" required />
                </div>
                <div className="p-field">
                  <label htmlFor={`price-${index}`}>Price</label>
                  <InputText id={`price-${index}`} value={item.price} onChange={(e) => handleItemChange(e, index)} name="price" required />
                </div>
                <div className="p-field">
              <label htmlFor="total">Total</label>
              <InputText id="total" value={newOrder.total} onChange={handleChange} name="total" required />
            </div>
            <div className="p-field">
              <label htmlFor="paymentMethod">Payment Method</label>
              <InputText id="paymentMethod" value={newOrder.paymentMethod} onChange={handleChange} name="paymentMethod" required />
            </div>
              </div>
            ))}
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default OrdersPage;


