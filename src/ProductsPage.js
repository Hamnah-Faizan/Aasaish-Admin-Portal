import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setLoading(false);
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
            console.log("Stores fetched:", response.data); // Debug log
            setStores(response.data);
        } catch (error) {
            console.error(`Failed to fetch stores for brand ${brandId}:`, error);
        }
    };
    

    const handleBrandChange = (event) => {
        const selectedBrandId = event.value;
        setNewProduct(prevProduct => ({
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

    const brandBodyTemplate = (rowData) => {
        const brandName = rowData.brand?.name || 'No Brand';
        console.log(brandName)
        return <React.Fragment>{brandName}</React.Fragment>;
    };

    const storeBodyTemplate = (rowData) => {
        const storeName = rowData.store?.name || 'No Store';
        console.log(storeName)
        return <React.Fragment>{storeName}</React.Fragment>;
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
            <div className="button-container">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteProduct(rowData)} />
            </div>
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
            <span className="custom-search">
        <       i className="pi pi-search" />
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
                        Products
                    </Typography>
                    <div className="card" style={{ overflowX: 'auto' }}>
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
                        globalFilterFields={['name', 'brand.name', 'store.name','description', 'price', 'category.name']}
                        emptyMessage="No products found."
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        tableStyle={{ minWidth: '50rem' }}
                        showGridlines
                        stripedRows
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                        <Column field="brand.name" header="Brand" body={brandBodyTemplate} sortable filter filterPlaceholder="Search by brand" style={{ minWidth: '14rem' }} />
                         <Column field="store.name" header="Store" body={storeBodyTemplate} sortable filter filterPlaceholder="Search by store" style={{ minWidth: '14rem' }} />
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="price" header="Price" body={priceBodyTemplate} sortable filter filterPlaceholder="Search by price" style={{ minWidth: '14rem' }} />
                        <Column field="category.name" header="Category" sortable filter filterPlaceholder="Search by category" style={{ minWidth: '14rem' }} />
                        <Column field="tags" header="Tags" body={(rowData) => rowData.tags ? rowData.tags.map(tag => tag.name).join(', ') : 'N/A'} sortable filter filterPlaceholder="Search by tags" style={{ minWidth: '14rem' }} />
                        <Column header="Actions" headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
                    </DataTable>
                    </div>

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
                            <InputNumber id="price" value={newProduct.price || ''} onValueChange={(e) => handleChange({ target: { name: 'price', value: e.value } })} required />
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

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import 'primeflex/primeflex.css';
// import 'primeicons/primeicons.css';
// import './ProductsPage.css';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   FormControlLabel, Paper, Typography, IconButton, Button, Modal, Box,
//   Checkbox, TextField, Container, Select, MenuItem, InputLabel,
//   FormControl, Chip, OutlinedInput, Grid, List, ListItem, ListItemText,
//   CircularProgress, TablePagination, Menu
// } from '@mui/material';
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from './firebase'; 
// import Sidebar from './Sidebar';
// import { useSnackbar } from 'notistack';
// import { BASE_URL } from './config';
// import { FaPlusCircle, FaEdit, FaTrashAlt } from 'react-icons/fa';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// function ProductsPage() {
//   const { enqueueSnackbar } = useSnackbar(); 
//   const [openBulkImport, setOpenBulkImport] = useState(false);
//   const [file, setFile] = useState(null);
//   const [mapping, setMapping] = useState({});
//   const [fileHeaders, setFileHeaders] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const isMenuOpen = Boolean(anchorEl);
//   const [open, setOpen] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [images, setImages] = useState([]);
//   const [selectedProducts, setSelectedProducts] = useState(new Set());
//   const [collections, setCollections] = useState([]);
//   const [openCollections, setOpenCollections] = useState(false);
//   const [currentCollection, setCurrentCollection] = useState(null);
//   const [isEditingCollection, setIsEditingCollection] = useState(false);
//   const [bulkImportCollection, setBulkImportCollection] = useState('');
//   const [newProduct, setNewProduct] = useState({
//     brandId: '',
//     name: '',
//     description: '',
//     category: '',
//     tags: [],
//     price: '',
//     images: [],
//     offers: '',
//     productCode: '' // Added productCode field
//   });
//   const [inventory, setInventory] = useState({
//     storeId: '',
//     variants: [{ color: '', size: '', quantity: '' }],
//     offers: { discountPercentage: '', description: '', validUntil: '' }
//   });
//   const [currentVendor, setCurrentVendor] = useState({
//     name: '',
//     brand: '',
//     store: '',
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState({});
//   const [loading, setLoading] = useState(true); // Loading state
//   const [page, setPage] = useState(0); // Pagination state
//   const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
//   const [bulkImportLoading, setBulkImportLoading] = useState(false); // Loading state for bulk import
//   const [searchQuery, setSearchQuery] = useState(''); // Search query state

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     fetchProducts();
//     fetchCategories();
//     fetchCollections();
//   }, []);

//   const showSuccessSnackbar = (message) => {
//     enqueueSnackbar(message, { variant: 'success', anchorOrigin: {
//       vertical: 'top',
//       horizontal: 'right',
//     }, autoHideDuration: 1000 }); // Notification appears for 1 second
//   };


//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Product/getproducts`);
//       const uniqueProducts = getUniqueProducts(response.data); // Get unique products
//       setProducts(uniqueProducts);
//       setLoading(false); // Set loading to false once data is fetched
//     } catch (error) {
//       console.error("Failed to fetch products:", error);
//       setLoading(false); // Set loading to false even if there's an error
//     }
//   };

//   const getUniqueProducts = (products) => {
//     const uniqueProductsMap = new Map();
//     products.forEach(product => {
//       if (!uniqueProductsMap.has(product.productCode)) {
//         uniqueProductsMap.set(product.productCode, product);
//       }
//     });
//     return Array.from(uniqueProductsMap.values());
//   };

//   const handleOpenForAdd = () => {
//     setOpen(true);
//     setIsEditing(false);
//     setNewProduct({
//       brandId: currentVendor.brand,
//       name: '',
//       description: '',
//       category: '',
//       tags: [],
//       price: '',
//       images: [],
//       offers: '',
//       productCode: '' // Added productCode field
//     });
//     handleMenuClose();
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setIsEditing(false);
//     setCurrentProduct(null);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduct(prevState => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleEdit = (product) => {
//     setOpen(true);
//     setIsEditing(true);
//     setCurrentProduct(product);
//     setNewProduct(product);
//     setSelectedTags(product.tags.map(tag => tag._id));
//     setInventory(prevState => ({
//       ...prevState,
//       variants: product.variants.map(variant => ({
//         color: variant.color,
//         size: variant.size,
//         quantity: variant.quantity
//       }))
//     }));
//   };

//   const handleDeleteProduct = async (id) => {
//     if (!id) {
//       console.error("Product ID is undefined, cannot delete");
//       return;
//     }
    
//     try {
//       const response = await axios.delete(`${BASE_URL}/Product/deleteproducts/${id}`);
//       fetchProducts(); // Refresh the list after deleting
//     } catch (error) {
//       console.error("Failed to delete product:", error.response ? error.response.data : error);
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const uploadedImageUrls = await uploadImages();
    
//     const formData = {
//       ...newProduct,
//       collection: newProduct.collection,
//       tags: selectedTags,
//       images: uploadedImageUrls,
//     };
    
//     try {
//       let productResponse;
//       if (isEditing) {
//         productResponse = await axios.put(`${BASE_URL}/Product/updateproducts/${currentProduct.id}`, formData);
//         const productId = currentProduct._id;
//       } else {
//         productResponse = await axios.post(`${BASE_URL}/Product/createproducts`, formData);
//         const productId = productResponse.data._id;
//         await axios.post(`${BASE_URL}/Inventory/createinventory`, {
//           productId,
//           storeId: currentVendor.store,
//           variants: inventory.variants,
//           offers: inventory.offers
//         });
//       }
      
//       setOpen(false); // Close modal
//       fetchProducts(); // Refresh products list
//       showSuccessSnackbar(isEditing ? 'Product Updated' : 'Product Added'); // Display success notification
//     } catch (error) {
//       console.error('Failed to submit product or inventory', error);
//     }
//   };

//   const fetchCollections = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Collection/collections`);
//       const filteredCollections = response.data.filter(
//         (collection) => collection.brand._id === currentVendor.brand
//       );
//       setCollections(filteredCollections);
//     } catch (error) {
//       console.error("Failed to fetch collections:", error);
//     }
//   };


//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Category/categories`);
//       setCategories(response.data);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   const handleCategoryChange = (event) => {
//     const selectedCategoryId = event.target.value;
//     setNewProduct((prevProduct) => ({
//       ...prevProduct,
//       category: selectedCategoryId,
//     }));
//     fetchTags(selectedCategoryId);
//   };

//   const fetchTags = async (parentCategoryId) => {
//     if (!parentCategoryId) {
//       console.log("Parent category ID is required to fetch tags");
//       return;
//     }

//     try {
//       const response = await axios.get(`${BASE_URL}/Tag/by-category/${parentCategoryId}`);
//       setTags(response.data);
//       setSelectedTags([]);
//     } catch (error) {
//       console.error("Failed to fetch tags for category", error);
//     }
//   };

//   const handleChangeTags = (event) => {
//     const { target: { value } } = event;
//     setSelectedTags(
//       typeof value === 'string' ? value.split(',') : value,
//     );
//   };

//   const handleVariantChange = (index, event) => {
//     const updatedVariants = inventory.variants.map((variant, i) =>
//       i === index ? { ...variant, [event.target.name]: event.target.value } : variant
//     );
//     setInventory({ ...inventory, variants: updatedVariants });
//   };

//   const handleAddVariant = () => {
//     setInventory({
//       ...inventory,
//       variants: [...inventory.variants, { color: '', size: '', quantity: '' }],
//     });
//   };

//   const handleRemoveVariant = (index) => {
//     const filteredVariants = inventory.variants.filter((_, i) => i !== index);
//     setInventory({ ...inventory, variants: filteredVariants });
//   };

//   const handleImageChange = (event) => {
//     setImages([...event.target.files]);
//   };

//   const uploadImages = async () => {
//     const urls = await Promise.all(
//       images.map(async (image) => {
//         const imageRef = ref(storage, products/`${image.name}`);
//         await uploadBytes(imageRef, image);
//         return getDownloadURL(imageRef);
//       })
//     );
//     return urls;
//   };

//   const handleOpenBulkImport = () => {
//     setOpenBulkImport(true);
//     setFile(null);
//     setMapping({});
//     setFileHeaders([]);
//   };

//   const handleCloseBulkImport = () => {
//     setOpenBulkImport(false);
//     setFile(null);
//     setMapping({});
//     setFileHeaders([]);
//     handleMenuClose();
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (!file) {
//       return;
//     }

//     setFile(file);
//     setFileHeaders([]);

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: 'array' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//         if (json.length > 0) {
//           setFileHeaders(json[0]);
//         }
//       } catch (err) {
//         console.error('Error reading file:', err);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleMappingChange = (e) => {
//     const { name, value } = e.target;
//     setMapping(prev => ({ ...prev, [name]: value }));
//   };

//   const handleBulkImportSubmit = async (event) => {
//     event.preventDefault();
//     setBulkImportLoading(true); // Set loading state to true
//     const formData = new FormData();
//     formData.append('file', file);

//     const enhancedMapping = {
//       ...mapping,
//       brandId: currentVendor.brand,
//       storeId: currentVendor.store
//     };

//     formData.append('mapping', JSON.stringify(enhancedMapping));
//     formData.append('collectionId', bulkImportCollection);

//     try {
//       const response = await axios.post(`${BASE_URL}/Product/bulk-import`, formData, {
//           headers: {
//               'Content-Type': 'multipart/form-data',
//           },
//       });

//       setOpenBulkImport(false);
//       fetchProducts(); // Refresh products list
//       showSuccessSnackbar('Bulk Import Successful'); // Display success notification

//     } catch (error) {
//       console.error('Error during bulk import:', error);
//     } finally {
//       setBulkImportLoading(false); // Set loading state to false
//     }
//   };

//   const handleMenuClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleSelectAllClick = (event) => {
//     if (event.target.checked) {
//       const newSelectedProducts = new Set(products.map((product) => product._id));
//       setSelectedProducts(newSelectedProducts);
//       return;
//     }
//     setSelectedProducts(new Set());
//   };

//   const handleClick = (productId) => {
//     const newSelectedProducts = new Set(selectedProducts);
//     if (newSelectedProducts.has(productId)) {
//       newSelectedProducts.delete(productId);
//     } else {
//       newSelectedProducts.add(productId);
//     }
//     setSelectedProducts(newSelectedProducts);
//   };

//   const isAllSelected = products.length > 0 && selectedProducts.size === products.length;
//   const isIndeterminate = selectedProducts.size > 0 && selectedProducts.size < products.length;

//   const handlePageChange = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleRowsPerPageChange = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const filteredProducts = products.filter((product) => {
//     const searchTerm = searchQuery.toLowerCase();
//     return (
//       (product.productCode && product.productCode.toLowerCase().includes(searchTerm)) ||
//       (product.name && product.name.toLowerCase().includes(searchTerm)) ||
//       (product.description && product.description.toLowerCase().includes(searchTerm)) ||
//       (product.price && product.price.toString().toLowerCase().includes(searchTerm)) ||
//       (product.category && product.category.name && product.category.name.toLowerCase().includes(searchTerm)) ||
//       (product.tags && product.tags.some(tag => tag.name.toLowerCase().includes(searchTerm)))
//     );
//   });

//   const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handleExportCSV = () => {
//     const headers = ['Product Code', 'Name', 'Description', 'Price', 'Category', 'Tags'];
//     const rows = paginatedProducts.map((product) => [
//       product.productCode,
//       product.name,
//       product.description,
//       product.price,
//       product.category ? product.category.name : 'N/A',
//       product.tags.map((tag) => tag.name).join(", ")
//     ]);
//     const csvContent = [
//       headers.join(','), 
//       ...rows.map(row => row.map(value => "${value}").join(',')) 
//     ].join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, 'products.csv');
//   };

//   const modalStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '80%',
//     maxWidth: '1000px',
//     height: 'auto',
//     maxHeight: '90vh',
//     bgcolor: 'background.paper',
//     boxShadow: 24,
//     p: 4,
//     overflowY: 'auto',
//   };

//   const bulkImportModalStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '80%',
//     maxWidth: '800px',
//     height: 'auto',
//     maxHeight: '90vh',
//     bgcolor: 'background.paper',
//     boxShadow: 24,
//     p: 4,
//     overflowY: 'auto',
//   };

//   return (
//     <Container maxWidth="lg">
//       <Box className="p-d-flex p-flex-column p-jc-center">
//         <Sidebar />
//         <Box component="main" className="p-flex-grow-1 p-p-3 main-content">
//           <Typography variant="h4" gutterBottom align="center">
//             Products
//           </Typography>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//             <TextField
//               label="Search"
//               variant="outlined"
//               fullWidth
//               size="small"
//               value={searchQuery}
//               onChange={handleSearchChange}
//               sx={{ width: '50%' }}
//             />
//             <Button
//               aria-controls="actions-menu"
//               aria-haspopup="true"
//               onClick={handleMenuClick}
//               variant="contained"
//               className="p-mb-2 p-ml-2"
//             >
//               Actions
//             </Button>
//             <Menu
//               id="actions-menu"
//               anchorEl={anchorEl}
//               keepMounted
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={handleOpenBulkImport}>Bulk Import</MenuItem>
//               <MenuItem onClick={handleOpenForAdd}>Add New Product</MenuItem>
//             </Menu>
//             <Button variant="contained" onClick={handleExportCSV}>
//               Export CSV
//             </Button>
//           </Box>


//           {/* Bulk Import Modal */}
//           <Modal open={openBulkImport} onClose={handleCloseBulkImport}>
//             <Box
//               sx={bulkImportModalStyle}
//               component="form"
//               onSubmit={handleBulkImportSubmit}
//               noValidate
//             >
//               <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
//                 Bulk Import Products
//               </Typography>
//               <input
//                 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                 type="file"
//                 onChange={handleFileChange}
//                 style={{ margin: "10px 0" }}
//               />
//               {file && <Typography>Selected file: {file.name}</Typography>}
//               {fileHeaders.length > 0 && (
//                 <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//                   <InputLabel id="bulk-import-collection-label">Collection</InputLabel>
//                   <Select
//                     labelId="bulk-import-collection-label"
//                     value={bulkImportCollection}
//                     onChange={(event) => setBulkImportCollection(event.target.value)}
//                     displayEmpty
//                     inputProps={{ "aria-label": "Without label" }}
//                   >
//                     <MenuItem value="">
//                       <em></em>
//                     </MenuItem>
//                     {collections.map((collection) => (
//                       <MenuItem key={collection._id} value={collection._id}>
//                         {collection.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               )}
//               {fileHeaders.length > 0 && (
//                 <Grid container spacing={2}>
//                   {[
//                     "productCode", // Added productCode field
//                     "name",
//                     "description",
//                     "category",
//                     "tags",
//                     "price",
//                     "images",
//                   ].map((field, index) => (
//                     <Grid key={index} item xs={12} container spacing={2}>
//                       <Grid item xs={6}>
//                         <TextField fullWidth disabled value={field} />
//                       </Grid>
//                       <Grid item xs={6}>
//                         <FormControl fullWidth>
//                           <InputLabel>{`Map to ${field}`}</InputLabel>
//                           <Select
//                             name={field}
//                             value={mapping[field] || ""}
//                             onChange={handleMappingChange}
//                           >
//                             {fileHeaders.map((header, idx) => (
//                               <MenuItem key={idx} value={header}>
//                                 {header}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
//                   ))}
//                   {["color", "size", "quantity"].map((variantField, variantIndex) => (
//                     <Grid
//                       key={`variant-${variantIndex}`}
//                       item
//                       xs={12}
//                       container
//                       spacing={2}
//                     >
//                       <Grid item xs={6}>
//                         <TextField fullWidth disabled value={variantField} />
//                       </Grid>
//                       <Grid item xs={6}>
//                         <FormControl fullWidth>
//                           <InputLabel>{`Map to ${variantField}`}</InputLabel>
//                           <Select
//                             name={`variant-${variantField}`}
//                             value={mapping[`variant-${variantField}`] || ""}
//                             onChange={handleMappingChange}
//                           >
//                             {fileHeaders.map((header, idx) => (
//                               <MenuItem key={idx} value={header}>
//                                 {header}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}
//               <Button type="submit" variant="contained" color="secondary" className="p-mt-3">
//                 Upload
//               </Button>
//               {bulkImportLoading && ( // Show loading indicator when bulk import is in progress
//                 <Box className="p-d-flex p-jc-center p-mt-2">
//                   <Typography>Bulk importing products, please wait...</Typography>
//                   <CircularProgress className="p-ml-2" />
//                 </Box>
//               )}
//             </Box>
//           </Modal>

//           <Modal open={open} onClose={handleClose}>
//             <Box
//               sx={modalStyle}
//               component="form"
//               onSubmit={handleSubmit}
//               noValidate
//             >
//               {!isEditing && ( // Only show productCode field when not editing an existing product
//                 <TextField
//                   margin="normal"
//                   fullWidth
//                   label="Product Code"
//                   name="productCode"
//                   value={newProduct.productCode}
//                   onChange={handleChange}
//                   helperText="Enter a unique product code"
//                 />
//               )}
//               <TextField
//                 margin="normal"
//                 fullWidth
//                 label="Name"
//                 name="name"
//                 value={newProduct.name}
//                 onChange={handleChange}
//               />
//               <TextField
//                 margin="normal"
//                 fullWidth
//                 label="Description"
//                 name="description"
//                 value={newProduct.description}
//                 onChange={handleChange}
//               />
//               <TextField
//                 margin="normal"
//                 fullWidth
//                 label="Price"
//                 type="number"
//                 name="price"
//                 value={newProduct.price}
//                 onChange={handleChange}
//               />
//               <TextField
//                 margin="normal"
//                 fullWidth
//                 label="Image URL"
//                 name="images"
//                 value={newProduct.images}
//                 onChange={handleChange}
//               />
//               <input
//                 accept="image/*"
//                 type="file"
//                 multiple
//                 onChange={handleImageChange}
//                 style={{ margin: "10px 0" }}
//               />
//               <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//                 <InputLabel id="collection-label">Collection</InputLabel>
//                 <Select
//                   labelId="collection-label"
//                   id="collection-select"
//                   value={newProduct.collection}
//                   label="Collection"
//                   onChange={(event) =>
//                     handleChange({
//                       target: {
//                         name: "collection",
//                         value: event.target.value,
//                       },
//                     })
//                   }
//                   name="collection"
//                 >
//                   {collections.map((collection) => (
//                     <MenuItem key={collection._id} value={collection._id}>
//                       {collection.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               {/* Grid for Category and Tags */}
//               <Grid container spacing={2}>
//                 {/* Category */}
//                 <Grid item xs={6}>
//                   <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//                     <InputLabel id="category-label">Category</InputLabel>
//                     <Select
//                       labelId="category-label"
//                       id="category-select"
//                       value={newProduct.category}
//                       label="Category"
//                       onChange={handleCategoryChange}
//                       name="category"
//                     >
//                       {categories.map((category) => (
//                         <MenuItem key={category._id} value={category._id}>
//                           {category.name}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 {/* Tags */}
//                 <Grid item xs={6}>
//                   <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//                     <InputLabel id="tags-label">Tags</InputLabel>
//                     <Select
//                       labelId="tags-label"
//                       id="tags-select-multiple-chip"
//                       multiple
//                       value={selectedTags}
//                       onChange={handleChangeTags}
//                       input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
//                       renderValue={(selected) => (
//                         <Box className="p-d-flex p-flex-wrap p-gap-1">
//                           {selected.map((value) => (
//                             <Chip
//                               key={value}
//                               label={
//                                 tags.find((tag) => tag._id === value)?.name || value
//                               }
//                             />
//                           ))}
//                         </Box>
//                       )}
//                       name="tags"
//                     >
//                       {tags.map((tag) => (
//                         <MenuItem key={tag._id} value={tag._id}>
//                           {tag.name}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>

//               {/* Variants Section */}
//               {!isEditing && (
//                 <>
//                   {inventory.variants.map((variant, index) => (
//                     <Box key={index} sx={{ mb: 2 }}>
//                       <Typography variant="subtitle2" sx={{ mt: 0.1, mb: 0.1 }}>
//                         Variant {index + 1}
//                       </Typography>
//                       <TextField
//                         margin="normal"
//                         label="Color"
//                         name="color"
//                         value={variant.color}
//                         onChange={(e) => handleVariantChange(index, e)}
//                         sx={{ mr: 1, width: "30%" }}
//                       />
//                       <TextField
//                         margin="normal"
//                         label="Size"
//                         name="size"
//                         value={variant.size}
//                         onChange={(e) => handleVariantChange(index, e)}
//                         sx={{ mr: 1, width: "30%" }}
//                       />
//                       <TextField
//                         margin="normal"
//                         label="Quantity"
//                         type="number"
//                         name="quantity"
//                         value={variant.quantity}
//                         onChange={(e) => handleVariantChange(index, e)}
//                         sx={{ width: "30%" }}
//                       />
//                       {index > 0 && (
//                         <IconButton
//                           color="error"
//                           onClick={() => handleRemoveVariant(index)}
//                         >
//                           <FaTrashAlt />
//                         </IconButton>
//                       )}
//                     </Box>
//                   ))}
//                   <Button
//                     startIcon={<FaPlusCircle />}
//                     onClick={handleAddVariant}
//                     sx={{ mb: 0.1 }}
//                   >
//                     Add Variant
//                   </Button>
//                 </>
//               )}
//               <Box className="p-d-flex p-jc-end p-mt-1">
//                 <Button type="submit" variant="contained" color="primary">
//                   {isEditing ? "Update" : "Add"}
//                 </Button>
//               </Box>
//             </Box>
//           </Modal>

//           {loading ? ( // Show loading spinner while fetching data
//             <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//               <CircularProgress />
//             </Box>
//           ) : (
//             <>
//               <TableContainer component={Paper} className="table-container">
//                 <Table className="custom-table" aria-label="customized table">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Product Code</TableCell>
//                       <TableCell>Name</TableCell>
//                       <TableCell>Description</TableCell>
//                       <TableCell>Price</TableCell>
//                       <TableCell>Category</TableCell>
//                       <TableCell>Tags</TableCell>
//                       <TableCell style={{ width: '200px' }}>Image</TableCell> {/* Adjusted width */}
//                       <TableCell>Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {paginatedProducts.map((product) => (
//                       <TableRow key={product._id}>
//                         <TableCell>{product.productCode}</TableCell>
//                         <TableCell>{product.name}</TableCell>
//                         <TableCell>{product.description}</TableCell>
//                         <TableCell>{product.price}</TableCell>
//                         <TableCell>{product.category ? product.category.name : "N/A"}</TableCell>
//                         <TableCell>{product.tags.map((tag) => tag.name).join(", ")}</TableCell>
//                         <TableCell className="table-cell-image">
//                           <img
//                             src={product.images && product.images[0]}
//                             alt={product.name}
//                             className="product-image"
//                           />
//                         </TableCell>
//                         <TableCell className="action-buttons">
//                           <IconButton
//                             className="edit-button"
//                             onClick={() => handleEdit(product)}
//                           >
//                             <FaEdit />
//                           </IconButton>
//                           <IconButton
//                             className="delete-button"
//                             onClick={() => handleDeleteProduct(product._id)}
//                           >
//                             <FaTrashAlt />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//                 <TablePagination
//                   component="div"
//                   count={filteredProducts.length}
//                   page={page}
//                   onPageChange={handlePageChange}
//                   rowsPerPage={rowsPerPage}
//                   onRowsPerPageChange={handleRowsPerPageChange}
//                 />
//               </TableContainer>
//             </>
//           )}
//         </Box>
//       </Box>
//     </Container>
//   );
// }

// export default ProductsPage;