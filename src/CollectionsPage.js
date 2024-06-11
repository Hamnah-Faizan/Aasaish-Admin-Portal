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

const CollectionsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', brand: '', products: [], imageUrl: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [collectionDialog, setCollectionDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchCollections();
    fetchBrands();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Collection/collections`);
      setCollections(response.data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
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
    setNewCollection({ name: '', description: '', brand: '', products: [], imageUrl: '' });
    setIsEditing(false);
    setCollectionDialog(true);
  };

  const hideDialog = () => {
    setCollectionDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setCollectionToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCollection(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = (collection) => {
    setNewCollection(collection);
    setIsEditing(true);
    setCollectionDialog(true);
  };

  const confirmDeleteCollection = (collection) => {
    setCollectionToDelete(collection);
    setDeleteDialog(true);
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) {
      console.error("Collection ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Collection/deletecollections/${collectionToDelete._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchCollections();
      enqueueSnackbar('Collection deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete collection:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveCollection = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditing) {
        await axios.put(`${BASE_URL}/Collection/updatecollections/${newCollection._id}`, newCollection, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Collection updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/Collection/createcollection`, newCollection, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Collection added successfully', { variant: 'success' });
      }
      setCollectionDialog(false);
      fetchCollections();
    } catch (error) {
      console.error('Failed to save collection', error);
      enqueueSnackbar('Failed to save collection', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteCollection(rowData)} />
      </div>
    );
  };

  const brandBodyTemplate = (rowData) => {
    return rowData.brand.name;
  };
  
  const brandFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={brands.map(brand => ({ label: brand.name, value: brand.name }))}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select a Brand"
        className="p-column-filter"
        showClear
      />
    );
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Collections</h5>
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
            Collections
          </Typography>
          <div className="card" style={{ overflowX: 'auto' }}>
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={collections}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No collections found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '100%' }}
              showGridlines
              stripedRows
            >
              <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
              <Column field="description" header="Description" sortable filter filterPlaceholder="Search by description" style={{ minWidth: '12rem' }} />
              <Column field="brand" header="Brand" body={brandBodyTemplate} sortable filter filterElement={brandFilterTemplate} style={{ minWidth: '12rem' }} />
              {/* <Column field="imageUrl" header="Image URL" sortable filter filterPlaceholder="Search by image URL" style={{ minWidth: '12rem' }} /> */}
              <Column header="Actions" headerStyle={{ width: '8rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={collectionDialog} style={{ width: '450px' }} header="Collection Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveCollection} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={newCollection.name} onChange={handleChange} name="name" required />
            </div>
            <div className="p-field">
              <label htmlFor="description">Description</label>
              <InputText id="description" value={newCollection.description} onChange={handleChange} name="description" required />
            </div>
            <div className="p-field">
              <label htmlFor="brand">Brand</label>
              <Dropdown id="brand" value={newCollection.brand} options={brands.map(brand => ({ label: brand.name, value: brand._id }))} onChange={(e) => handleChange({ target: { name: 'brand', value: e.value } })} placeholder="Select a Brand" />
            </div>
            <div className="p-field">
              <label htmlFor="imageUrl">Image URL</label>
              <InputText id="imageUrl" value={newCollection.imageUrl} onChange={handleChange} name="imageUrl" required />
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteCollection} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {collectionToDelete && <span>Are you sure you want to delete <b>{collectionToDelete.name}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default CollectionsPage;
