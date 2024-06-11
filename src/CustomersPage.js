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
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { BASE_URL } from './config';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  marginTop: '20px',
};


const CustomersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    location: { lat: 24.8607, lng: 67.0011 },
    address: '',
    role: 'Customer',
    status: 'ACTIVE'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [customerDialog, setCustomerDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/User/customers`);
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const openNew = () => {
    setNewCustomer({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      location: { lat: 24.8607, lng: 67.0011 },
      address: '',
      role: 'Customer',
      status: 'ACTIVE'
    });
    setIsEditing(false);
    setCustomerDialog(true);
  };

  const hideDialog = () => {
    setCustomerDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setCustomerToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLatLngChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prevState => ({
      ...prevState,
      location: {
        ...prevState.location,
        [name]: value // Simply update the value without parsing
      }
    }));
  };

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setNewCustomer(prevState => ({
          ...prevState,
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        }));
      },
    });
    return null;
  };

  const handleEdit = (customer) => {
    setNewCustomer({
      _id: customer._id,
      firstname: customer.user?.firstname || '',
      lastname: customer.user?.lastname || '',
      username: customer.user?.username || '',
      email: customer.user?.email || '',
      password: '',
      location: customer.location?.coordinates
        ? { lat: customer.location.coordinates[1], lng: customer.location.coordinates[0] }
        : { lat: 24.8607, lng: 67.0011 },
      address: customer.address || '',
      role: customer.user?.role || 'Customer',
      status: customer.user?.status || 'ACTIVE'
    });
    setIsEditing(true);
    setCustomerDialog(true);
  };

  const confirmDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialog(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) {
      console.error("Customer ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/User/${customerToDelete.user._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchCustomers();
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete customer:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveCustomer = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }

      const updatedCustomer = {
        ...newCustomer,
        location: {
          type: "Point",
          coordinates: [newCustomer.location.lng, newCustomer.location.lat]
        },
        address: newCustomer.address,
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/User/user/${newCustomer._id}`, updatedCustomer, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Customer updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/User/signup`, updatedCustomer, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Customer added successfully', { variant: 'success' });
      }
      setCustomerDialog(false);
      fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer', error);
      enqueueSnackbar('Failed to save customer', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteCustomer(rowData)} />
      </div>
    );
  };

  const locationBodyTemplate = (rowData) => {
    const coordinatesExist = rowData.location && Array.isArray(rowData.location.coordinates) && rowData.location.coordinates.length === 2;
    return coordinatesExist ? `Lat: ${rowData.location.coordinates[1]}, Lng: ${rowData.location.coordinates[0]}` : 'Location not provided';
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Customers</h5>
      <span className="custom-search">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
      </span>
    </div>
  );

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
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
    <Container maxWidth="xl" style={{ overflowX: 'hidden' }}>
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
            Customers
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={customers}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No customers found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '100%' }}
              showGridlines
              stripedRows
            >
              <Column field="user._id" header="Customer ID" sortable filter filterPlaceholder="Search by ID" style={{ minWidth: '12rem' }} />
              <Column field="user.firstname" header="First Name" sortable filter filterPlaceholder="Search by first name" style={{ minWidth: '12rem' }} />
              <Column field="user.lastname" header="Last Name" sortable filter filterPlaceholder="Search by last name" style={{ minWidth: '12rem' }} />
              <Column field="user.username" header="Username" sortable filter filterPlaceholder="Search by username" style={{ minWidth: '8rem' }} />
              <Column field="user.email" header="Email" sortable filter filterPlaceholder="Search by email" style={{ minWidth: '9rem' }} />
              <Column field="user.status" header="Status" sortable filter filterPlaceholder="Search by status" style={{ minWidth: '5rem' }} />
              <Column field="location" header="Location" body={locationBodyTemplate} sortable filter filterPlaceholder="Search by location" style={{ minWidth: '12rem' }} />
              <Column field="address" header="Address" sortable filter filterPlaceholder="Search by address" style={{ minWidth: '10rem' }} />
              <Column header="Actions" headerStyle={{ width: '3rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={customerDialog} style={{ width: '450px' }} header="Customer Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveCustomer} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="firstname">First Name</label>
              <InputText id="firstname" value={newCustomer.firstname} onChange={handleChange} name="firstname" required />
            </div>
            <div className="p-field">
              <label htmlFor="lastname">Last Name</label>
              <InputText id="lastname" value={newCustomer.lastname} onChange={handleChange} name="lastname" required />
            </div>
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText id="username" value={newCustomer.username} onChange={handleChange} name="username" required />
            </div>
            <div className="p-field">
              <label htmlFor="email">Email</label>
              <InputText id="email" value={newCustomer.email} onChange={handleChange} name="email" required />
            </div>
            <div className="p-field">
              <label htmlFor="password">Password</label>
              <InputText id="password" value={newCustomer.password} onChange={handleChange} name="password" required type="password" />
            </div>
            <div className="p-field">
              <label htmlFor="status">Status</label>
              <Dropdown id="status" value={newCustomer.status} options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]} onChange={(e) => handleChange({ target: { name: 'status', value: e.value } })} placeholder="Select a Status" />
            </div>
            <div className="p-field">
              <label htmlFor="address">Address</label>
              <InputText id="address" value={newCustomer.address} onChange={handleChange} name="address" required />
            </div>
            <div className="p-field">
              <MapContainer center={[newCustomer.location.lat, newCustomer.location.lng]} zoom={13} style={mapContainerStyle} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClick />
                <Marker position={[newCustomer.location.lat, newCustomer.location.lng]}>
                  <Popup>Location</Popup>
                </Marker>
              </MapContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <InputText value={newCustomer.location.lat} name="lat" onChange={handleLatLngChange} placeholder="Latitude" />
                <InputText value={newCustomer.location.lng} name="lng" onChange={handleLatLngChange} placeholder="Longitude" />
              </div>
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteCustomer} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {customerToDelete && <span>Are you sure you want to delete <b>{customerToDelete.user.firstname} {customerToDelete.user.lastname}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default CustomersPage;


