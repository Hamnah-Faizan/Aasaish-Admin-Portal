// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import {
//   Typography, Container, Box, Tooltip
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

// const ReservationsPage = () => {
//   const { enqueueSnackbar } = useSnackbar();
//   const [reservations, setReservations] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [inventories, setInventories] = useState([]);
//   const [availableColors, setAvailableColors] = useState([]);
//   const [availableSizes, setAvailableSizes] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [expandedRows, setExpandedRows] = useState(null);
//   const dt = useRef(null);
//   const [reservationDialog, setReservationDialog] = useState(false);
//   const [selectedReservation, setSelectedReservation] = useState(null);
//   const [statusDialog, setStatusDialog] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [newStatus, setNewStatus] = useState('');
//   const [newReservation, setNewReservation] = useState({
//     userId: '',
//     productId: '',
//     inventoryId: '',
//     variant: {
//       color: '',
//       size: ''
//     }
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     fetchReservations();
//     fetchBrands();
//     fetchStores();
//   }, []);

//   const fetchReservations = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Reservation/all`);
//       setReservations(response.data);
//     } catch (error) {
//       console.error("Failed to fetch reservations:", error);
//     }
//   };

//   const fetchBrands = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Brand/getbrands`);
//       setBrands(response.data);
//     } catch (error) {
//       console.error("Failed to fetch brands:", error);
//     }
//   };

//   const fetchStores = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Store/all`);
//       setStores(response.data);
//     } catch (error) {
//       console.error("Failed to fetch stores:", error);
//     }
//   };

//   const fetchInventories = async (storeId) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Inventory/getinventory/store/${storeId}`);
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
//       await axios.put(`${BASE_URL}/Reservation/${selectedReservation._id}/${selectedItem._id}`, {
//         status: newStatus
//       }, { headers: { Authorization: `Bearer ${token}` } });

//       enqueueSnackbar('Reservation item status updated successfully', { variant: 'success' });
//       setStatusDialog(false);
//       fetchReservations();
//     } catch (error) {
//       console.error('Failed to update reservation item status:', error);
//       enqueueSnackbar('Failed to update reservation item status', { variant: 'error' });
//     }
//   };

//   const openStatusDialog = (reservation, item) => {
//     setSelectedReservation(reservation);
//     setSelectedItem(item);
//     setNewStatus(item.status);
//     setStatusDialog(true);
//   };

//   const hideStatusDialog = () => {
//     setStatusDialog(false);
//   };

//   const handleDeleteReservation = async (reservationId) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error("Access token not available.");
//         return;
//       }
//       await axios.delete(`${BASE_URL}/Reservation/${reservationId}`, { headers: { Authorization: `Bearer ${token}` } });
//       enqueueSnackbar('Reservation deleted successfully', { variant: 'success' });
//       fetchReservations();
//     } catch (error) {
//       console.error('Failed to delete reservation:', error);
//       enqueueSnackbar('Failed to delete reservation', { variant: 'error' });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewReservation(prevState => ({
//         ...prevState,
//         [name]: value
//     }));
// };

// const handleDropdownChange = async (e) => {
//   const { name, value } = e.target;
//   if (name === 'storeId') {
//       const selectedStore = stores.find(store => store._id === value);
//       setNewReservation(prevState => ({
//           ...prevState,
//           storeId: value,
//           storeName: selectedStore.name
//       }));
//       await fetchInventories(value);
//   } else if (name === 'brandId') {
//       const selectedBrand = brands.find(brand => brand._id === value);
//       setNewReservation(prevState => ({
//           ...prevState,
//           brandId: value,
//           brandName: selectedBrand.name
//       }));
//   } else if (name === 'inventoryId') {
//       const selectedInventory = inventories.find(inventory => inventory._id === value);
//       setNewReservation(prevState => ({
//           ...prevState,
//           inventoryId: value,
//           inventoryName: selectedInventory.name
//       }));
//   } else {
//       setNewReservation(prevState => ({
//           ...prevState,
//           [name]: value
//       }));
//   }
// };

// const handleVariantChange = (e) => {
//   const { name, value } = e.target;
//   setNewReservation(prevState => ({
//       ...prevState,
//       variant: {
//           ...prevState.variant,
//           [name]: value
//       }
//   }));
// };

// const handleAddReservation = async () => {
//   try {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error("Access token not available.");
//       return;
//     }
//     await axios.post(`${BASE_URL}/Reservation/create`, {
//       userId: newReservation.userId,
//       productId: newReservation.productId,
//       inventoryId: newReservation.inventoryId,
//       variant: {
//         color: newReservation.variant.color,
//         size: newReservation.variant.size
//       }
//     }, { 
//       headers: { Authorization: `Bearer ${token}` } 
//     });
//     enqueueSnackbar('Reservation added successfully', { variant: 'success' });
//     setReservationDialog(false);
//     fetchReservations();
//   } catch (error) {
//     console.error('Failed to add reservation:', error);
//     enqueueSnackbar('Failed to add reservation', { variant: 'error' });
//   }
// };

//   const openReservationDialog = () => {
//     setNewReservation({
//       userId: '',
//       productId: '',
//       inventoryId: '',
//       variant: {
//         color: '',
//         size: ''
//       }
//     });
//     setReservationDialog(true);
//   };

//   const hideReservationDialog = () => {
//     setReservationDialog(false);
//   };

//   const actionBodyTemplate = (rowData) => {
//     const handleEditClick = () => {
//       if (rowData.items && rowData.items.length > 0) {
//         openStatusDialog(rowData, rowData.items[0]);
//       } else {
//         console.error('No items available for this reservation');
//       }
//     };
//     return (
//       <div className="button-container">
//         <Tooltip title="Edit Status">
//           <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={handleEditClick} />
//         </Tooltip>
//         <Tooltip title="Delete Reservation">
//           <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDeleteReservation(rowData._id)} />
//         </Tooltip>
//       </div>
//     );
//   };

//   const header = (
//     <div className="table-header">
//       <h5 className="mx-0 my-1">Admin Reservations</h5>
//       <span className="custom-search">
//         <i className="pi pi-search" />
//         <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
//       </span>
//     </div>
//   );

//   const leftToolbarTemplate = () => (
//     <React.Fragment>
//       <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openReservationDialog} />
//     </React.Fragment>
//   );

//   const rightToolbarTemplate = () => (
//     <React.Fragment>
//       <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={() => dt.current.exportCSV()} />
//     </React.Fragment>
//   );

//   const itemTemplate = (items) => (
//     <DataTable value={items} responsiveLayout="scroll" className="p-datatable-sm">
//       <Column field="productId.name" header="Product Name" sortable />
//       <Column field="variant.color" header="Color" sortable />
//       <Column field="variant.size" header="Size" sortable />
//       <Column field="productId.brandId.name" header="Brand Name" sortable />
//       <Column field="inventoryId.storeId.name" header="Store Name" sortable />
//       <Column field="status" header="Status" sortable />
//       <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '10rem', textAlign: 'center' }} />
//     </DataTable>
//   );

//   const rowExpansionTemplate = (data) => {
//     return (
//       <div className="p-3">
//         <h6>Items</h6>
//         {itemTemplate(data.items)}
//       </div>
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
//         .button-container {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .button-container .p-button {
//           margin: 0 5px;
//         }
//       `}</style>
//       <Box sx={{ display: "flex", overflowX: 'hidden' }}>
//         <Sidebar />
//         <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden' }}>
//           <Typography variant="h4" gutterBottom align="center">
//             Admin Reservations
//           </Typography>
//           <div className="card" style={{ overflowX: 'auto' }}>
//             <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
//             <DataTable
//               ref={dt}
//               value={reservations}
//               paginator
//               header={header}
//               rows={10}
//               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
//               rowsPerPageOptions={[10, 25, 50]}
//               dataKey="_id"
//               globalFilter={globalFilter}
//               emptyMessage="No reservations found."
//               currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
//               tableStyle={{ minWidth: '100%' }}
//               showGridlines
//               stripedRows
//               expandedRows={expandedRows}
//               onRowToggle={(e) => setExpandedRows(e.data)}
//               rowExpansionTemplate={rowExpansionTemplate}
//             >
//               <Column expander style={{ width: '3em' }} />
//               <Column field="_id" header="Reservation ID" sortable filter filterPlaceholder="Search by ID" style={{ minWidth: '12rem' }} />
//               <Column header="Total Items" body={(rowData) => rowData.items.length} style={{ minWidth: '10rem' }} />
//             </DataTable>
//           </div>
//           <Dialog visible={statusDialog} style={{ width: '450px' }} header="Update Reservation Item Status" modal className="p-fluid" footer={() => (
//             <>
//               <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideStatusDialog} />
//               <Button label="Update" icon="pi pi-check" className="p-button-text" onClick={handleStatusUpdate} />
//             </>
//           )} onHide={hideStatusDialog}>
//             <div className="p-field">
//               <label htmlFor="status">Status</label>
//               <Dropdown id="status" value={newStatus} options={[
//                 { label: 'Active', value: 'Active' },
//                 { label: 'Cancelled by Customer', value: 'Cancelled by Customer' },
//                 { label: 'Completed', value: 'Completed' },
//                 { label: 'Cancelled by Vendor', value: 'Cancelled by Vendor' },
//                 { label: 'Expired', value: 'Expired' },
//               ]} onChange={(e) => setNewStatus(e.value)} placeholder="Select a Status" />
//             </div>
//           </Dialog>

//           <Dialog visible={reservationDialog} style={{ width: '450px' }} header="New Reservation" modal className="p-fluid" footer={() => (
//             <>
//               <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideReservationDialog} />
//               <Button label="Add" icon="pi pi-check" className="p-button-text" onClick={handleAddReservation} />
//             </>
//           )} onHide={hideReservationDialog}>
//             <div className="p-field">
//               <label htmlFor="userId">User ID</label>
//               <InputText id="userId" value={newReservation.userId} onChange={handleChange} name="userId" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="productId">Product ID</label>
//               <InputText id="productId" value={newReservation.productId} onChange={handleChange} name="productId" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="storeId">Store</label>
//               <Dropdown id="storeId" value={newReservation.storeId} options={stores.map(store => ({ label: store.name, value: store._id }))} onChange={handleDropdownChange} name="storeId" placeholder="Select a Store" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="inventoryId">Inventory</label>
//               <Dropdown id="inventoryId" value={newReservation.inventoryId} options={inventories.map(inventory => ({ label: inventory._id, value: inventory._id }))} onChange={handleDropdownChange} name="inventoryId" placeholder="Select an Inventory" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="color">Color</label>
//               <Dropdown id="color" value={newReservation.variant.color} options={availableColors.map(color => ({ label: color, value: color }))} onChange={handleVariantChange} name="color" placeholder="Select a Color" required />
//             </div>
//             <div className="p-field">
//               <label htmlFor="size">Size</label>
//               <Dropdown id="size" value={newReservation.variant.size} options={availableSizes.map(size => ({ label: size, value: size }))} onChange={handleVariantChange} name="size" placeholder="Select a Size" required />
//             </div>
//           </Dialog>
//         </Box>
//       </Box>
//     </Container>
//   );
// };

// export default ReservationsPage;


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

const ReservationsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef(null);
  const [reservationDialog, setReservationDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newReservation, setNewReservation] = useState({
    userId: '',
    productId: '',
    inventoryId: '',
    variant: {
      color: '',
      size: ''
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchReservations();
    fetchBrands();
    fetchStores();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Reservation/all`);
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Brand/getbrands`);
      setBrands(response.data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Store/all`);
      setStores(response.data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const fetchInventories = async (storeId) => {
    try {
      const response = await axios.get(`${BASE_URL}/Inventory/getinventory/store/${storeId}`);
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
      await axios.put(`${BASE_URL}/Reservation/${selectedReservation._id}/${selectedItem._id}`, {
        status: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      enqueueSnackbar('Reservation item status updated successfully', { variant: 'success' });
      setStatusDialog(false);
      fetchReservations();
    } catch (error) {
      console.error('Failed to update reservation item status:', error);
      enqueueSnackbar('Failed to update reservation item status', { variant: 'error' });
    }
  };

  const openStatusDialog = (reservation, item) => {
    setSelectedReservation(reservation);
    setSelectedItem(item);
    setNewStatus(item.status);
    setStatusDialog(true);
  };

  const hideStatusDialog = () => {
    setStatusDialog(false);
  };

  const handleDeleteReservation = async (reservationId, itemId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Access token not available.");
            return;
        }
        await axios.delete(`${BASE_URL}/Reservation/reservations/${reservationId}/items/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Reservation item deleted successfully', { variant: 'success' });
        fetchReservations();
    } catch (error) {
        console.error('Failed to delete reservation item:', error);
        enqueueSnackbar('Failed to delete reservation item', { variant: 'error' });
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReservation(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDropdownChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'storeId') {
      const selectedStore = stores.find(store => store._id === value);
      setNewReservation(prevState => ({
        ...prevState,
        storeId: value,
        storeName: selectedStore?.name || '' // Add check here
      }));
      await fetchInventories(value);
    } else if (name === 'brandId') {
      const selectedBrand = brands.find(brand => brand._id === value);
      setNewReservation(prevState => ({
        ...prevState,
        brandId: value,
        brandName: selectedBrand?.name || '' // Add check here
      }));
    } else if (name === 'inventoryId') {
      const selectedInventory = inventories.find(inventory => inventory._id === value);
      setNewReservation(prevState => ({
        ...prevState,
        inventoryId: value,
        inventoryName: selectedInventory?.name || '' // Add check here
      }));
    } else {
      setNewReservation(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewReservation(prevState => ({
      ...prevState,
      variant: {
        ...prevState.variant,
        [name]: value
      }
    }));
  };

  const handleAddReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Access token not available.");
        return;
      }
      await axios.post(`${BASE_URL}/Reservation/create`, newReservation, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('Reservation added successfully', { variant: 'success' });
      setReservationDialog(false);
      fetchReservations();
    } catch (error) {
      console.error('Failed to add reservation:', error);
      enqueueSnackbar('Failed to add reservation', { variant: 'error' });
    }
  };

  const openReservationDialog = () => {
    setNewReservation({
      userId: '',
      productId: '',
      inventoryId: '',
      variant: {
        color: '',
        size: ''
      }
    });
    setReservationDialog(true);
  };

  const hideReservationDialog = () => {
    setReservationDialog(false);
  };

  const actionBodyTemplate = (rowData) => (
    rowData.items.map(item => (
        <React.Fragment key={item._id}>
           <div className="button-container">
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => openStatusDialog(rowData, item)} />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDeleteReservation(rowData._id, item._id)} />
            </div>
        </React.Fragment>
    ))
);

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Admin Reservations</h5>
      <span className="custom-search">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
      </span>
    </div>
  );

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openReservationDialog} />
      </React.Fragment>
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
            Admin Reservations
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={reservations}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No reservations found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '100%' }}
              showGridlines
              stripedRows
            >
              <Column field="_id" header="Reservation ID" sortable filter filterPlaceholder="Search by ID" style={{ minWidth: '12rem' }} />
              <Column header="Product ID" field="productId" body={(rowData) => rowData.items.map(item => item.productId?.productCode || 'N/A').join(', ')} sortable filter filterPlaceholder="Search by Product ID" style={{ minWidth: '12rem' }} />
              <Column header="Product Name" body={(rowData) => rowData.items.map(item => item.productId?.name || 'N/A').join(', ')}  style={{ minWidth: '15rem' }} />
              <Column header="Variant" body={(rowData) => rowData.items.map(item => `Color: ${item.variant?.color || 'N/A'}, Size: ${item.variant?.size || 'N/A'}`).join(', ')}  style={{ minWidth: '15rem' }} />
              <Column header="Brand Name" body={(rowData) => rowData.items.map(item => item.productId?.brandId?.name || 'N/A').join(', ')}  style={{ minWidth: '10rem' }} />
              <Column header="Store Name" body={(rowData) => rowData.items.map(item => item.inventoryId?.storeId?.name || 'N/A').join(', ')}  style={{ minWidth: '15rem' }} />
              <Column header="Status" body={(rowData) => rowData.items.map(item => item.status).join(', ')} style={{ minWidth: '10rem' }} />
              <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '10rem', textAlign: 'center' }} />
            </DataTable>
          </div>

          <Dialog visible={statusDialog} style={{ width: '450px' }} header="Update Reservation Item Status" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideStatusDialog} />
              <Button label="Update" icon="pi pi-check" className="p-button-text" onClick={handleStatusUpdate} />
            </>
          )} onHide={hideStatusDialog}>
            <div className="p-field">
              <label htmlFor="status">Status</label>
              <Dropdown id="status" value={newStatus} options={[
                { label: 'Active', value: 'Active' },
                { label: 'Cancelled by Customer', value: 'Cancelled by Customer' },
                { label: 'Completed', value: 'Completed' },
                { label: 'Cancelled by Vendor', value: 'Cancelled by Vendor' },
                { label: 'Expired', value: 'Expired' },
              ]} onChange={(e) => setNewStatus(e.value)} placeholder="Select a Status" />
            </div>
          </Dialog>

          <Dialog visible={reservationDialog} style={{ width: '450px' }} header="New Reservation" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideReservationDialog} />
              <Button label="Add" icon="pi pi-check" className="p-button-text" onClick={handleAddReservation} />
            </>
          )} onHide={hideReservationDialog}>
            <div className="p-field">
              <label htmlFor="userId">User ID</label>
              <InputText id="userId" value={newReservation.userId} onChange={handleChange} name="userId" required />
            </div>
            <div className="p-field">
              <label htmlFor="productId">Product ID</label>
              <InputText id="productId" value={newReservation.productId} onChange={handleChange} name="productId" required />
            </div>
            <div className="p-field">
              <label htmlFor="storeId">Store</label>
              <Dropdown id="storeId" value={newReservation.storeId} options={stores.map(store => ({ label: store.name, value: store._id }))} onChange={handleDropdownChange} name="storeId" placeholder="Select a Store" required />
            </div>
            <div className="p-field">
              <label htmlFor="inventoryId">Inventory</label>
              <Dropdown id="inventoryId" value={newReservation.inventoryId} options={inventories.map(inventory => ({ label: inventory._id, value: inventory._id }))} onChange={handleDropdownChange} name="inventoryId" placeholder="Select an Inventory" required />
            </div>
            <div className="p-field">
              <label htmlFor="color">Color</label>
              <Dropdown id="color" value={newReservation.variant.color} options={availableColors.map(color => ({ label: color, value: color }))} onChange={handleVariantChange} name="color" placeholder="Select a Color" required />
            </div>
            <div className="p-field">
              <label htmlFor="size">Size</label>
              <Dropdown id="size" value={newReservation.variant.size} options={availableSizes.map(size => ({ label: size, value: size }))} onChange={handleVariantChange} name="size" placeholder="Select a Size" required />
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default ReservationsPage;
