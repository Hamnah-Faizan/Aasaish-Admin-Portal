import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Typography, Container, Box
} from '@mui/material';
import Sidebar from './Sidebar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { useSnackbar } from 'notistack';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from './config';

const StoresPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [stores, setStores] = useState([]);
    const [brands, setBrands] = useState([]);
    const [newStore, setNewStore] = useState({
        name: '', address: '', contactInfo: '', location: { lat: 24.8607, lng: 67.0011 }, brand: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentStore, setCurrentStore] = useState({});
    const [storeDialog, setStoreDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchStores();
        fetchBrands();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/Store/all`);
            setStores(response.data);
        } catch (error) {
            console.error("Failed to fetch stores:", error);
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

    const openNew = () => {
        setNewStore({
            name: '', address: '', contactInfo: '', location: { lat: 24.8607, lng: 67.0011 }, brand: ''
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
        }));
    };

    const handleEdit = (store) => {
        const coordinates = store.location?.coordinates || [67.0011, 24.8607];
        setNewStore({
            ...store,
            location: {
                lat: coordinates[1] || 24.8607,
                lng: coordinates[0] || 67.0011
            }
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
            await axios.delete(`${BASE_URL}/Store/${storeToDelete._id}`);
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
            if (isEditing) {
                await axios.put(`${BASE_URL}/Store/${newStore._id}`, newStore);
                enqueueSnackbar('Store updated successfully', { variant: 'success' });
            } else {
                await axios.post(`${BASE_URL}/Store/create`, newStore);
                enqueueSnackbar('Store added successfully', { variant: 'success' });
            }
            setStoreDialog(false);
            fetchStores();
        } catch (error) {
            console.error('Failed to save store', error);
            enqueueSnackbar('Failed to save store', { variant: 'error' });
        }
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

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteStore(rowData)} />
            </React.Fragment>
        );
    };

    const locationBodyTemplate = (rowData) => {
        const coordinates = rowData.location?.coordinates || [67.0011, 24.8607];
        return `Lat: ${coordinates[1]}, Lng: ${coordinates[0]}`;
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Manage Stores</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
            </span>
        </div>
    );

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                {/* <Button type="button" icon="pi pi-file" rounded onClick={() => exportCSV(false)} data-pr-tooltip="CSV" />
                <Button type="button" icon="pi pi-file-excel" severity="success" rounded onClick={exportExcel} data-pr-tooltip="XLS" />
                <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPdf} data-pr-tooltip="PDF" /> */}
            </React.Fragment>
        )
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={() => dt.current.exportCSV()} />
            </React.Fragment>
        )
    };

    const footer = `In total there are ${stores ? stores.length : 0} stores.`;

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: "flex" }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Stores
                    </Typography>
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={stores}
                        paginator
                        header={header}
                        footer={footer}
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
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                        <Column field="address" header="Address" sortable filter filterPlaceholder="Search by address" style={{ minWidth: '14rem' }} />
                        <Column field="contactInfo" header="Contact Info" sortable filter filterPlaceholder="Search by contact info" style={{ minWidth: '14rem' }} />
                        <Column field="brand.name" header="Brand" sortable filter filterPlaceholder="Search by brand" style={{ minWidth: '14rem' }} />
                        <Column header="Location" body={locationBodyTemplate} sortable filter filterPlaceholder="Search by location" style={{ minWidth: '14rem' }} />
                        <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
                    </DataTable>

                    <Dialog visible={storeDialog} style={{ width: '450px' }} header="Store Details" modal className="p-fluid" footer={() => (
                        <>
                            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
                            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveStore} />
                        </>
                    )} onHide={hideDialog}>
                        <div className="p-field">
                            <label htmlFor="brand">Brand</label>
                            <Dropdown id="brand" value={newStore.brand || ''} options={brands} onChange={(e) => handleChange({ target: { name: 'brand', value: e.value } })} optionLabel="name" placeholder="Select a Brand" />
                        </div>
                        <div className="p-field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name" value={newStore.name || ''} onChange={handleChange} name="name" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="address">Address</label>
                            <InputText id="address" value={newStore.address || ''} onChange={handleChange} name="address" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="contactInfo">Contact Info</label>
                            <InputText id="contactInfo" value={newStore.contactInfo || ''} onChange={handleChange} name="contactInfo" required />
                        </div>
                        <MapContainer center={[newStore.location.lat, newStore.location.lng]} zoom={13} style={{ height: '400px', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }} scrollWheelZoom={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClick />
                            <Marker position={[newStore.location.lat, newStore.location.lng]}>
                                <Popup>Store Location</Popup>
                            </Marker>
                        </MapContainer>
                        <div className="p-field">
                            <label htmlFor="lat">Latitude</label>
                            <InputText id="lat" value={newStore.location.lat || ''} onChange={(e) => handleChange({ target: { name: 'location.lat', value: e.target.value } })} name="lat" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="lng">Longitude</label>
                            <InputText id="lng" value={newStore.location.lng || ''} onChange={(e) => handleChange({ target: { name: 'location.lng', value: e.target.value } })} name="lng" required />
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
