import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Typography, Container, Box, CircularProgress
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

const InventoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    variants: [{ color: '', size: '', quantity: '' }],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Product/getproducts`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    }
  };

  const openNew = () => {
    setNewProduct({
      name: '',
      variants: [{ color: '', size: '', quantity: '' }],
    });
    setIsEditing(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setProductDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleVariantChange = (index, event) => {
    const updatedVariants = newProduct.variants.map((variant, i) =>
      i === index ? { ...variant, [event.target.name]: event.target.value } : variant
    );
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { color: '', size: '', quantity: '' }],
    });
  };

  const handleRemoveVariant = (index) => {
    const filteredVariants = newProduct.variants.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, variants: filteredVariants });
  };

  const handleEdit = (product) => {
    setNewProduct(product);
    setIsEditing(true);
    setProductDialog(true);
  };

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteDialog(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) {
      console.error("Product ID is undefined, cannot delete");
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`${BASE_URL}/Product/deleteproducts/${productToDelete.id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      fetchProducts();
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error("Failed to delete product:", error.response ? error.response.data : error);
    } finally {
      setDeleteDialog(false);
    }
  };

  const saveProduct = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditing) {
        await axios.put(`${BASE_URL}/Product/updateproducts/${newProduct.id}`, newProduct, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await axios.post(`${BASE_URL}/Product/createproduct`, newProduct, { headers: { Authorization: `Bearer ${accessToken}` } });
        enqueueSnackbar('Product added successfully', { variant: 'success' });
      }
      setProductDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      enqueueSnackbar('Failed to save product', { variant: 'error' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="button-container">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteProduct(rowData)} />
      </div>
    );
  };

  const variantsBodyTemplate = (rowData) => {
    return (
      <div>
        {rowData.variants.map((variant, index) => (
          <div key={index}>
            {variant.color} / {variant.size} / {variant.quantity}
          </div>
        ))}
      </div>
    );
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Inventory</h5>
      <span className="custom-search">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search" />
      </span>
    </div>
  );


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
            Inventory
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
              <CircularProgress />
            </Box>
          ) : (
            <div className="card">
              <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>
              <DataTable
                ref={dt}
                value={products}
                paginator
                header={header}
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="id"
                selectionMode="checkbox"
                globalFilter={globalFilter}
                emptyMessage="No products found."
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                tableStyle={{ minWidth: '50rem' }}
                showGridlines
                stripedRows
              >
                <Column field="id" header="Product ID" sortable filter filterPlaceholder="Search by ID" style={{ minWidth: '14rem' }} />
                <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                <Column field="variants" header="Variants" body={variantsBodyTemplate} sortable filter filterPlaceholder="Search by variants" style={{ minWidth: '14rem' }} />
                <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
              </DataTable>
            </div>
          )}

          <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={() => (
            <>
              <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} />
            </>
          )} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={newProduct.name} onChange={handleChange} name="name" required />
            </div>
            <div className="p-field">
              <label>Variants</label>
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="p-field p-grid">
                  <div className="p-col">
                    <InputText placeholder="Color" name="color" value={variant.color} onChange={(e) => handleVariantChange(index, e)} />
                  </div>
                  <div className="p-col">
                    <InputText placeholder="Size" name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} />
                  </div>
                  <div className="p-col">
                    <InputText placeholder="Quantity" name="quantity" value={variant.quantity} onChange={(e) => handleVariantChange(index, e)} />
                  </div>
                  <div className="p-col">
                    <Button icon="pi pi-minus" className="p-button-danger" onClick={() => handleRemoveVariant(index)} />
                  </div>
                </div>
              ))}
              <Button icon="pi pi-plus" className="p-button-success" onClick={handleAddVariant} />
            </div>
          </Dialog>

          <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={() => (
            <>
              <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
              <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={handleDeleteProduct} />
            </>
          )} onHide={hideDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
              {productToDelete && <span>Are you sure you want to delete <b>{productToDelete.name}</b>?</span>}
            </div>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default InventoryPage;

