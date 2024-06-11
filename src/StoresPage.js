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
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from './config';

const mapContainerStyle = {
  height: '300px',
  width: '100%',
  marginTop: '16px',
};



  

const StoresPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    contactInfo: '',
    location: { lat: 24.8607, lng: 67.0011 },
    brand: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [storeDialog, setStoreDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchStores();
    fetchBrands();
  }, []);

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

  const openNew = () => {
    setNewStore({
      name: '',
      address: '',
      contactInfo: '',
      location: { lat: 24.8607, lng: 67.0011 },
      brand: ''
    });
    setIsEditing(false);
    setStoreDialog(true);
  };

  const hideDialog = () => {
    setStoreDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setStoreToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStore(prevState => ({
      ...prevState,
      [name]: value,
      location: {
        ...prevState.location,
        [name]: value // Simply update the value without parsing
      }
    }));
  };

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setNewStore(prevState => ({
          ...prevState,
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        }));
      },
    });
    return null;
  };

  const handleEdit = (store) => {
    setNewStore({
      _id: store._id,
      name: store.name,
      address: store.address,
      contactInfo: store.contactInfo,
      location: store.location?.coordinates
        ? { lat: store.location.coordinates[1], lng: store.location.coordinates[0] }
        : { lat: 24.8607, lng: 67.0011 },
      brand: store.brand._id
    });
    setIsEditing(true);
    setStoreDialog(true);
  };

  const confirmDeleteStore = (store) => {
    setStoreToDelete(store);
    setDeleteDialog(true);
  };

  const handleDeleteStore = async () => {
    if (!storeToDelete) {
      console.error("Store ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Store/${storeToDelete._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchStores();
      enqueueSnackbar('Store deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete store:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveStore = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }

      const storeData = {
        ...newStore,
        location: {
          type: 'Point',
          coordinates: [newStore.location.lng, newStore.location.lat]
        }
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/Store/${newStore._id}`, storeData, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Store updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/Store/create`, storeData, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Store added successfully', { variant: 'success' });
      }
      setStoreDialog(false);
      fetchStores();
    } catch (error) {
      console.error('Failed to save store', error);
      enqueueSnackbar('Failed to save store', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
         <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteStore(rowData)} />
        </div>
    );
  };

  const brandBodyTemplate = (rowData) => {
    return rowData.brand.name;
  };


  const locationBodyTemplate = (rowData) => {
    const coordinatesExist = rowData.location && Array.isArray(rowData.location.coordinates) && rowData.location.coordinates.length === 2;
    return coordinatesExist ? `Lat: ${rowData.location.coordinates[1]}, Lng: ${rowData.location.coordinates[0]}` : 'Location not provided';
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Stores</h5>
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
      <Box sx={{ display: "flex",  overflowX: 'hidden', width:'100%' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden' }}>
          <Typography variant="h4" gutterBottom align="center">
            Stores
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
            ref={dt}
            value={stores}
            paginator
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[10, 25, 50]}
            dataKey="_id"
            selectionMode="checkbox"
            globalFilter={globalFilter}
            emptyMessage="No stores found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            tableStyle={{ minWidth: '50rem' }}
            showGridlines
            stripedRows
          >
            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '10rem' }} />
            <Column field="address" header="Address" sortable filter filterPlaceholder="Search by address" style={{ minWidth: '10rem' }} />
            <Column field="contactInfo" header="Contact Info" sortable filter filterPlaceholder="Search by contact info" style={{ minWidth: '10rem' }} />
            <Column field="brand" header="Brand" body={brandBodyTemplate} sortable filter filterPlaceholder="Search by brand" style={{ minWidth: '12rem' }} />
            <Column field="location" header="Location" body={locationBodyTemplate} sortable filter filterPlaceholder="Search by location" style={{ minWidth: '10rem' }} />
            <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
          </DataTable>

          </div>

          <Dialog visible={storeDialog} style={{ width: '450px' }} header="Store Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveStore} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="brand">Brand</label>
              <Dropdown id="brand" value={newStore.brand} options={brands.map(brand => ({ label: brand.name, value: brand._id }))} onChange={(e) => handleChange({ target: { name: 'brand', value: e.value } })} placeholder="Select a Brand" />
            </div>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={newStore.name} onChange={handleChange} name="name" required />
            </div>
            <div className="p-field">
              <label htmlFor="address">Address</label>
              <InputText id="address" value={newStore.address} onChange={handleChange} name="address" required />
            </div>
            <div className="p-field">
              <label htmlFor="contactInfo">Contact Info</label>
              <InputText id="contactInfo" value={newStore.contactInfo} onChange={handleChange} name="contactInfo" required />
            </div>
            <div className="p-field">
              <MapContainer center={[newStore.location.lat, newStore.location.lng]} zoom={13} style={mapContainerStyle} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClick />
                <Marker position={[newStore.location.lat, newStore.location.lng]}>
                  <Popup>Store Location</Popup>
                </Marker>
              </MapContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <InputText value={newStore.location.lat} onChange={(e) => handleChange({ target: { name: 'lat', value: e.target.value } })} placeholder="Latitude" />
                <InputText value={newStore.location.lng} onChange={(e) => handleChange({ target: { name: 'lng', value: e.target.value } })} placeholder="Longitude" />
              </div>
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteStore} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {storeToDelete && <span>Are you sure you want to delete <b>{storeToDelete.name}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default StoresPage;
