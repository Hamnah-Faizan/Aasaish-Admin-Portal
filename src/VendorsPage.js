import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Typography, Container, Box, Chip
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

const VendorsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [vendors, setVendors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [newVendor, setNewVendor] = useState({
    brand: '',
    stores: [],
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    role: 'Vendor',
    status: 'ACTIVE'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [vendorDialog, setVendorDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchVendors();
    fetchBrands();
    fetchStores();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/User/vendors`);
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
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

  const openNew = () => {
    setNewVendor({
      brand: '',
      stores: [],
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      role: 'Vendor',
      status: 'ACTIVE'
    });
    setIsEditing(false);
    setVendorDialog(true);
  };

  const hideDialog = () => {
    setVendorDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setVendorToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVendor(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = (vendor) => {
    setNewVendor({
      _id: vendor.user._id,
      firstname: vendor.user.firstname,
      lastname: vendor.user.lastname,
      username: vendor.user.username,
      email: vendor.user.email,
      password: '',
      role: vendor.user.role,
      status: vendor.user.status,
      brand: vendor.brand._id,
      stores: vendor.stores.map(store => store._id)
    });
    setIsEditing(true);
    setVendorDialog(true);
  };

  const confirmDeleteVendor = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialog(true);
  };

  const handleDeleteVendor = async () => {
    if (!vendorToDelete) {
      console.error("Vendor ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/User/${vendorToDelete.user._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchVendors();
      enqueueSnackbar('Vendor deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete vendor:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveVendor = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditing) {
        await axios.put(`${BASE_URL}/User/vendor/${newVendor._id}`, newVendor, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Vendor updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/User/signup`, newVendor, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Vendor added successfully', { variant: 'success' });
      }
      setVendorDialog(false);
      fetchVendors();
    } catch (error) {
      console.error('Failed to save vendor', error);
      enqueueSnackbar('Failed to save vendor', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteVendor(rowData)} />
      </div>
    );
  };

  const brandBodyTemplate = (rowData) => {
    return rowData.brand.name;
  };

  const storesBodyTemplate = (rowData) => {
    return rowData.stores.map(store => <Chip key={store._id} label={store.name} />);
  };


  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Vendors</h5>
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
      <Box sx={{ display: "flex", overflowX: 'hidden' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden' }}>
          <Typography variant="h4" gutterBottom align="center">
            Vendors
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={vendors}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No vendors found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '100%' }}
              showGridlines
              stripedRows
            >
              {/* <Column field="user._id" header="Vendor ID" sortable filter filterPlaceholder="Search by ID" style={{ minWidth: '12rem' }} />
              <Column field="user.firstname" header="First Name" sortable filter filterPlaceholder="Search by first name" style={{ minWidth: '12rem' }} />
              <Column field="user.lastname" header="Last Name" sortable filter filterPlaceholder="Search by last name" style={{ minWidth: '12rem' }} /> */}
              <Column field="user.username" header="Username" sortable filter filterPlaceholder="Search by username" style={{ minWidth: '12rem' }} />
              <Column field="user.email" header="Email" sortable filter filterPlaceholder="Search by email" style={{ minWidth: '12rem' }} />
              {/* <Column field="user.role" header="Role" sortable filter filterPlaceholder="Search by role" style={{ minWidth: '12rem' }} /> */}
              {/* <Column field="user.status" header="Status" sortable filter filterPlaceholder="Search by status" style={{ minWidth: '12rem' }} /> */}
              <Column field="brand.name" header="Brand" body={brandBodyTemplate} sortable filter filterPlaceholder="Search by brand" style={{ minWidth: '12rem' }} />
              <Column field="stores.name" header="Stores" body={storesBodyTemplate} sortable filter filterPlaceholder="Search by stores" style={{ minWidth: '12rem' }} />
              <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={vendorDialog} style={{ width: '450px' }} header="Vendor Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveVendor} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="firstname">First Name</label>
              <InputText id="firstname" value={newVendor.firstname} onChange={handleChange} name="firstname" required />
            </div>
            <div className="p-field">
              <label htmlFor="lastname">Last Name</label>
              <InputText id="lastname" value={newVendor.lastname} onChange={handleChange} name="lastname" required />
            </div>
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText id="username" value={newVendor.username} onChange={handleChange} name="username" required />
            </div>
            <div className="p-field">
              <label htmlFor="email">Email</label>
              <InputText id="email" value={newVendor.email} onChange={handleChange} name="email" required />
            </div>
            <div className="p-field">
              <label htmlFor="password">Password</label>
              <InputText id="password" value={newVendor.password} onChange={handleChange} name="password" required type="password" />
            </div>
            <div className="p-field">
              <label htmlFor="role">Role</label>
              <Dropdown id="role" value={newVendor.role} options={[{ label: 'Vendor', value: 'Vendor' }]} onChange={(e) => handleChange({ target: { name: 'role', value: e.value } })} placeholder="Select a Role" />
            </div>
            <div className="p-field">
              <label htmlFor="status">Status</label>
              <Dropdown id="status" value={newVendor.status} options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]} onChange={(e) => handleChange({ target: { name: 'status', value: e.value } })} placeholder="Select a Status" />
            </div>
            <div className="p-field">
              <label htmlFor="brand">Brand</label>
              <Dropdown id="brand" value={newVendor.brand} options={brands.map(brand => ({ label: brand.name, value: brand._id }))} onChange={(e) => handleChange({ target: { name: 'brand', value: e.value } })} placeholder="Select a Brand" />
            </div>
            <div className="p-field">
              <label htmlFor="stores">Stores</label>
              <Dropdown id="stores" value={newVendor.stores} options={stores.map(store => ({ label: store.name, value: store._id }))} onChange={(e) => handleChange({ target: { name: 'stores', value: e.value } })} placeholder="Select Stores" multiple />
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteVendor} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {vendorToDelete && <span>Are you sure you want to delete <b>{vendorToDelete.user.firstname} {vendorToDelete.user.lastname}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default VendorsPage;
