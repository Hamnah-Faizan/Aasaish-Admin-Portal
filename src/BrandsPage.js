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
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { BASE_URL } from './config';

const BrandsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: '', description: '', logoUrl: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [brandDialog, setBrandDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const openNew = () => {
    setNewBrand({ name: '', description: '', logoUrl: '' });
    setIsEditing(false);
    setBrandDialog(true);
  };

  const hideDialog = () => {
    setBrandDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setBrandToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBrand(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = (brand) => {
    setNewBrand(brand);
    setIsEditing(true);
    setBrandDialog(true);
  };

  const confirmDeleteBrand = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialog(true);
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) {
      console.error("Brand ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Brand/${brandToDelete._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchBrands();
      enqueueSnackbar('Brand deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete brand:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveBrand = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditing) {
        await axios.put(`${BASE_URL}/Brand/${newBrand._id}`, newBrand, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Brand updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/Brand/create`, newBrand, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Brand added successfully', { variant: 'success' });
      }
      setBrandDialog(false);
      fetchBrands();
    } catch (error) {
      console.error('Failed to save brand', error);
      enqueueSnackbar('Failed to save brand', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteBrand(rowData)} />
      </div>
    );
  };

  const logoBodyTemplate = (rowData) => {
    return (
      <img src={rowData.logoUrl} alt={rowData.name} style={{ width: '50px', height: '50px' }} />
    );
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Brands</h5>
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
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Brands
          </Typography>
          <div className="card">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={brands}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No brands found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '50rem' }}
              showGridlines
              stripedRows
            >
              <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
              <Column field="description" header="Description" sortable filter filterPlaceholder="Search by description" style={{ width: '40%'}} />
              <Column header="Logo" body={logoBodyTemplate} style={{ minWidth: '14rem' }} />
              <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={brandDialog} style={{ width: '450px' }} header="Brand Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveBrand} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={newBrand.name} onChange={handleChange} name="name" required />
            </div>
            <div className="p-field">
              <label htmlFor="description">Description</label>
              <InputText id="description" value={newBrand.description} onChange={handleChange} name="description" required />
            </div>
            <div className="p-field">
              <label htmlFor="logoUrl">Logo URL</label>
              <InputText id="logoUrl" value={newBrand.logoUrl} onChange={handleChange} name="logoUrl" required />
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteBrand} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {brandToDelete && <span>Are you sure you want to delete <b>{brandToDelete.name}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default BrandsPage;


