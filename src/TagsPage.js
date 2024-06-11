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

const TagsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTag, setNewTag] = useState({ name: '', parentCategory: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchTags();
    fetchCategories();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Tag/tags`);
      setTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Category/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const openNew = () => {
    setNewTag({ name: '', parentCategory: '' });
    setIsEditing(false);
    setTagDialog(true);
  };

  const hideDialog = () => {
    setTagDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setTagToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTag(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = (tag) => {
    setNewTag(tag);
    setIsEditing(true);
    setTagDialog(true);
  };

  const confirmDeleteTag = (tag) => {
    setTagToDelete(tag);
    setDeleteDialog(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) {
      console.error("Tag ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Tag/deletetag/${tagToDelete._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchTags();
      enqueueSnackbar('Tag deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete tag:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveTag = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditing) {
        await axios.put(`${BASE_URL}/Tag/updatetag/${newTag._id}`, newTag, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Tag updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/Tag/createtag`, newTag, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Tag added successfully', { variant: 'success' });
      }
      setTagDialog(false);
      fetchTags();
    } catch (error) {
      console.error('Failed to save tag', error);
      enqueueSnackbar('Failed to save tag', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
         <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteTag(rowData)} />
        </div>
    );
  };

  const parentCategoryBodyTemplate = (rowData) => {
    return categories.find(category => category._id === rowData.parentCategory)?.name || 'None';
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Tags</h5>
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
            Tags
          </Typography>
          <div className="card">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
              ref={dt}
              value={tags}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="_id"
              selectionMode="checkbox"
              globalFilter={globalFilter}
              emptyMessage="No tags found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              tableStyle={{ minWidth: '50rem' }}
              showGridlines
              stripedRows
            >
              <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
              {/* <Column field="parentCategory" header="Parent Category" body={parentCategoryBodyTemplate} sortable filter filterPlaceholder="Search by parent category" style={{ minWidth: '14rem' }} /> */}
              <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
            </DataTable>
          </div>

          <Dialog visible={tagDialog} style={{ width: '450px' }} header="Tag Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveTag} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={newTag.name} onChange={handleChange} name="name" required />
            </div>
            <div className="p-field">
              <label htmlFor="parentCategory">Parent Category</label>
              <Dropdown id="parentCategory" value={newTag.parentCategory} options={categories} onChange={(e) => handleChange({ target: { name: 'parentCategory', value: e.value } })} optionLabel="name" placeholder="Select a Parent Category" />
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteTag} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {tagToDelete && <span>Are you sure you want to delete <b>{tagToDelete.name}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default TagsPage;

