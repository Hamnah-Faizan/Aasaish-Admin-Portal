import React, { useState, useEffect } from 'react';

// Importing Axios for HTTP requests
import axios from 'axios';

// Importing Material-UI components
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControlLabel, Paper, Typography, IconButton, Button, Modal, Box,
  Checkbox, TextField, Container, Select, Menu, MenuItem, InputLabel,
  FormControl, Chip, OutlinedInput, Grid, List, ListItem, ListItemText
} from '@mui/material';

// Importing Firebase storage functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebase'; 

// Importing custom components and icons
import Sidebar from './Sidebar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';

// Importing Snackbar for notifications
import { useSnackbar } from 'notistack';
import { BASE_URL } from './config';

function InventoryPage() {
  // Snackbar for user notifications
  const { enqueueSnackbar } = useSnackbar(); 

  // State for managing product data
  const [products, setProducts] = useState([]);

  // State for inventory details
  const [inventory, setInventory] = useState({
    storeId: '',
    variants: [{ color: '', size: '', quantity: '' }],
    offers: { discountPercentage: '', description: '', validUntil: '' }
  });

  // State for vendor details
  const [currentVendor, setCurrentVendor] = useState({
    name: '',
    brand: '',
    store: '',
  });

  // State for editing controls
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

// Snackbar Notifications -----------------------
// These functions handle showing snackbar notifications
const showSuccessSnackbar = (message) => {
  enqueueSnackbar(message, { variant: 'success', anchorOrigin: {
    vertical: 'top',
    horizontal: 'right',
  }, autoHideDuration: 1000 }); // Notification appears for 1 second
};

// API Initialization -----------------------
// Setup common API configurations and fetch initial data
useEffect(() => {
  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // fetchVendorDetails();
  fetchProducts();
}, []);


// Product Management -----------------------
// Functions to handle CRUD operations on products
const fetchProducts = async () => {
  try {

    const response = await axios.get(`${BASE_URL}/Product/getproducts`);
    setProducts(response.data);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};

// Inside the InventoryPage component

const handleEdit = async (productId) => {
  // Fetch the product details based on the productId
  try {
    const response = await axios.get(`${BASE_URL}/Product/updateproducts/${productId}`);
    setCurrentProduct(response.data);
    setIsEditing(true);
  } catch (error) {
    console.error("Failed to fetch product for editing:", error);
  }
};

const handleDelete = async (productId) => {
  // Delete the product based on the productId
  try {
    await axios.delete(`${BASE_URL}/Product/deleteproducts/${productId}`);
    showSuccessSnackbar('Product deleted successfully!');
    fetchProducts(); // Refresh the product list after deletion
  } catch (error) {
    console.error("Failed to delete product:", error);
    enqueueSnackbar('Failed to delete product!', { variant: 'error' });
  }
};


// Inventory Variants -----------------------
// Functions to handle inventory variants
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
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Inventory
          </Typography>

  
          <TableContainer component={Paper}>
  <Table sx={{ width: '100%' }} aria-label="customized table">
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
        </TableCell>
        <TableCell style={{ width: '15%' }}>Product ID</TableCell>
        <TableCell style={{ width: '15%' }}>Name</TableCell>
        <TableCell style={{ width: '10%' }}>Colors</TableCell>
        <TableCell style={{ width: '10%' }}>Sizes</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
          {products.map((product) => {
            console.log('Product:', product); // Debugging statement
            return (
              <TableRow key={product.id}>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                      {product.variants && product.variants
                        .map((variant) => variant.color)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {product.variants && product.variants.map((variant) => variant.size).join(", ")}
                    </TableCell>
                <TableCell>
                <IconButton color="primary" onClick={() => handleEdit(product.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(product.id)}>
                  <DeleteIcon />
                </IconButton>
                </TableCell>
              </TableRow>
            );
          })}

        </TableBody>
      </Table>
    </TableContainer>
            </Box>
          </Box>
        </Container>
  );
};
  export default InventoryPage;