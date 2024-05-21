import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ProductsPage.css';
import {
    Typography, Container, Box, Grid, Chip
} from '@mui/material';
import Sidebar from './Sidebar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
// import { exportCSV, exportExcel, exportPdf } from './exportFunctions';
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

const ProductsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [collections, setCollections] = useState([]);
    const [brands, setBrands] = useState([]);
    const [stores, setStores] = useState([]);
    const [newProduct, setNewProduct] = useState({
        brandId: '',
        name: '',
        description: '',
        category: '',
        tags: [],
        price: '',
        images: [],
        offers: '',
    });
    const [inventory, setInventory] = useState({
        storeId: '',
        variants: [{ color: '', size: '', quantity: '' }],
        offers: { discountPercentage: '', description: '', validUntil: '' }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({});
    const [productDialog, setProductDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
        price: { value: null, matchMode: FilterMatchMode.EQUALS },
        'category.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchProducts();
        fetchCategories();
        fetchCollections();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/Product/getproducts`);
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
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

    const fetchStoresByBrand = async (brandId) => {
        try {
            const response = await axios.get(`${BASE_URL}/Store/getstoresbybrand/${brandId}`);
            setStores(response.data);
        } catch (error) {
            console.error(`Failed to fetch stores for brand ${brandId}:`, error);
        }
    };

    const handleBrandChange = (event) => {
        const selectedBrandId = event.value;
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            brandId: selectedBrandId,
        }));
        fetchStoresByBrand(selectedBrandId);
    };

    const handleStoreChange = (event) => {
        const selectedStoreId = event.value;
        setInventory((prevInventory) => ({
            ...prevInventory,
            storeId: selectedStoreId,
        }));
    };

    const openNew = () => {
        setNewProduct({
            brandId: '',
            name: '',
            description: '',
            category: '',
            price: '',
            images: '',
            offers: '',
        });
        setInventory({
            storeId: '',
            variants: [{ color: '', size: '', quantity: '' }],
            offers: { discountPercentage: '', description: '', validUntil: '' }
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
            await axios.delete(`${BASE_URL}/Product/deleteproducts/${productToDelete._id}`);
            fetchProducts();
            enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        } catch (error) {
            console.error("Failed to delete product:", error.response ? error.response.data : error);
        } finally {
            setDeleteDialog(false);
        }
    };

    const saveProduct = async () => {
        const formData = {
            ...newProduct,
            tags: selectedTags,
        };

        try {
            if (isEditing) {
                await axios.put(`${BASE_URL}/Product/updateproducts/${newProduct._id}`, formData);
                enqueueSnackbar('Product updated successfully', { variant: 'success' });
            } else {
                await axios.post(`${BASE_URL}/Product/createproducts`, formData);
                enqueueSnackbar('Product added successfully', { variant: 'success' });
            }
            setProductDialog(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product', error);
            enqueueSnackbar('Failed to save product', { variant: 'error' });
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/Collection/collections`);
            setCollections(response.data);
        } catch (error) {
            console.error("Failed to fetch collections:", error);
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

    const handleCategoryChange = (event) => {
        const selectedCategoryId = event.value;
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            category: selectedCategoryId,
        }));
        fetchTags(selectedCategoryId);
    };

    const fetchTags = async (parentCategoryId) => {
        if (!parentCategoryId) {
            console.log("Parent category ID is required to fetch tags");
            return;
        }

        try {
            const response = await axios.get(`${BASE_URL}/Tag/by-category/${parentCategoryId}`);
            setTags(response.data);
            setSelectedTags([]);
        } catch (error) {
            console.error(`Failed to fetch tags for category ${parentCategoryId}:`, error);
        }
    };

    const handleChangeTags = (event) => {
        setSelectedTags(event.value);
    };

    const handleVariantChange = (index, event) => {
        const updatedVariants = inventory.variants.map((variant, i) =>
            i === index ? { ...variant, [event.target.name]: event.target.value } : variant
        );
        setInventory({ ...inventory, variants: updatedVariants });
    };

    const handleAddVariant = () => {
        setInventory({
            ...inventory,
            variants: [...inventory.variants, { color: '', size: '', quantity: '' }],
        });
    };

    const handleRemoveVariant = (index) => {
        const filteredVariants = inventory.variants.filter((_, i) => i !== index);
        setInventory({ ...inventory, variants: filteredVariants });
    };

    const handleImageChange = (event) => {
        const files = event.target.files;
        if (files) {
            const imagesArray = Array.from(files).map(file => URL.createObjectURL(file));
            setNewProduct((prevProduct) => ({
                ...prevProduct,
                images: imagesArray,
            }));
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteProduct(rowData)} />
            </React.Fragment>
        );
    };

    const imageBodyTemplate = (rowData) => {
        return rowData.images && rowData.images.length > 0 ? (
            <img src={rowData.images[0]} alt="Product" style={{ width: '100px' }} />
        ) : (
            'No image'
        );
    };

    const priceBodyTemplate = (rowData) => {
        return (
            <span>
                ${rowData.price}
            </span>
        );
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Manage Products</h5>
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

    const footer = `In total there are ${products ? products.length : 0} products.`;

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: "flex" }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Products
                    </Typography>
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={products}
                        paginator
                        header={header}
                        footer={footer}
                        rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 25, 50]}
                        dataKey="_id"
                        selectionMode="checkbox"
                        selection={selectedTags}
                        onSelectionChange={(e) => setSelectedTags(e.value)}
                        filters={filters}
                        filterDisplay="menu"
                        globalFilterFields={['name', 'description', 'price', 'category.name']}
                        emptyMessage="No products found."
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        tableStyle={{ minWidth: '50rem' }}
                        showGridlines
                        stripedRows
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="price" header="Price" body={priceBodyTemplate} sortable filter filterPlaceholder="Search by price" style={{ minWidth: '14rem' }} />
                        <Column field="category.name" header="Category" sortable filter filterPlaceholder="Search by category" style={{ minWidth: '14rem' }} />
                        <Column field="tags" header="Tags" body={(rowData) => rowData.tags ? rowData.tags.map(tag => tag.name).join(', ') : 'N/A'} sortable filter filterPlaceholder="Search by tags" style={{ minWidth: '14rem' }} />
                        <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={() => (
                        <>
                            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
                            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} />
                        </>
                    )} onHide={hideDialog}>
                        <div className="p-field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name" value={newProduct.name || ''} onChange={handleChange} name="name" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="description">Description</label>
                            <InputText id="description" value={newProduct.description || ''} onChange={handleChange} name="description" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="price">Price</label>
                            <InputNumber id="price" value={newProduct.price || ''} onValueChange={(e) => handleChange({ target: { name: 'price', value: e.value } })} mode="currency" currency="USD" locale="en-US" required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="images">Image URL</label>
                            <InputText id="images" value={newProduct.images || ''} onChange={handleChange} name="images" required />
                        </div>
                        <div className="p-field">
                            <input
                                accept="image/*"
                                type="file"
                                multiple
                                onChange={handleImageChange}
                                style={{ margin: "10px 0" }}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="collection">Collection</label>
                            <Dropdown id="collection" value={newProduct.collection || ''} options={collections} onChange={(e) => handleChange({ target: { name: 'collection', value: e.value } })} optionLabel="name" placeholder="Select a Collection" />
                        </div>
                        <div className="p-field">
                            <label htmlFor="brand">Brand</label>
                            <Dropdown id="brand" value={newProduct.brandId || ''} options={brands} onChange={handleBrandChange} optionLabel="name" placeholder="Select a Brand" />
                        </div>
                        <div className="p-field">
                            <label htmlFor="store">Store</label>
                            <Dropdown id="store" value={inventory.storeId || ''} options={stores} onChange={handleStoreChange} optionLabel="name" placeholder="Select a Store" disabled={!newProduct.brandId} />
                        </div>
                        <div className="p-field">
                            <label htmlFor="category">Category</label>
                            <Dropdown id="category" value={newProduct.category || ''} options={categories} onChange={handleCategoryChange} optionLabel="name" placeholder="Select a Category" />
                        </div>
                        <div className="p-field">
                            <label htmlFor="tags">Tags</label>
                            <MultiSelect id="tags" value={selectedTags} options={tags} onChange={handleChangeTags} optionLabel="name" placeholder="Select Tags" display="chip" />
                        </div>
                        {inventory.variants.map((variant, index) => (
                            <div key={index} className="p-field">
                                <label htmlFor={`variant-color-${index}`}>Variant {index + 1} - Color</label>
                                <InputText id={`variant-color-${index}`} value={variant.color || ''} onChange={(e) => handleVariantChange(index, e)} name="color" />
                                <label htmlFor={`variant-size-${index}`}>Size</label>
                                <InputText id={`variant-size-${index}`} value={variant.size || ''} onChange={(e) => handleVariantChange(index, e)} name="size" />
                                <label htmlFor={`variant-quantity-${index}`}>Quantity</label>
                                <InputNumber id={`variant-quantity-${index}`} value={variant.quantity || ''} onValueChange={(e) => handleVariantChange(index, { target: { name: 'quantity', value: e.value } })} integeronly />
                            
                            </div>
                        ))}
                        <Button label="Add Variant" icon="pi pi-plus" className="p-button-rounded p-button-success" onClick={handleAddVariant} />
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

export default ProductsPage;
