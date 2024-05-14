import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, IconButton, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Modal, Box, TextField, Container, createTheme, ThemeProvider, CssBaseline,
  MenuItem, FormControl, Select, InputLabel, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { blue, pink } from '@mui/material/colors';
import Sidebar from './Sidebar';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink['A400'],
    },
  },
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  p: 4,
  overflowY: 'auto',
  maxHeight: '90vh',
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [brands, setBrands] = useState([]); // State variable for brands
  const [stores, setStores] = useState([]); // State variable for stores
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendor, setCurrentVendor] = useState({
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

  useEffect(() => {
    fetchVendors();
    fetchBrands(); // Fetch brands when the component mounts
    fetchStores(); // Fetch stores when the component mounts
  }, []);

  const fetchVendors = async () => {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:4000/User/vendors', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log(response.data);
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]); // Set to empty array on error
    }
  };

  const fetchBrands = async () => {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:4000/Brand/getbrands', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log(response.data);
      setBrands(response.data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]); // Set to empty array on error
    }
  };

  const handleBrandChange = (event) => {
    const brand = event.target.value;
    setCurrentVendor(prev => ({
      ...prev,
      brand: brand,
    }));
  };
  
  


  const fetchStores = async () => {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:4000/Store/all', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log(response.data);
      setStores(response.data); // Update this line
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setStores([]); // Set to empty array on error
    }
  };
  

  const handleOpenModal = () => {
    setOpenModal(true);
    setIsEditing(false);
    setCurrentVendor({
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
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'stores') {
        setCurrentVendor(prev => ({
            ...prev,
            [name]: [...value], // Ensure value is handled as an array
        }));
    } else {
        setCurrentVendor(prev => ({
            ...prev,
            [name]: value,
        }));
    }
};


  const handleSubmit = async (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    const url = isEditing ? `http://localhost:4000/User/vendor/${currentVendor._id}` : 'http://localhost:4000/User/signup';
    const method = isEditing ? axios.put : axios.post;
    try {
      await method(url, currentVendor, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      handleCloseModal();
      fetchVendors();
    } catch (error) {
      console.error("Failed to submit vendor:", error.response?.data || error.message);
    }
  };

  const handleEdit = (vendor) => {
    setOpenModal(true);
    setIsEditing(true);
    setCurrentVendor({
        _id: vendor._id, 
        firstname: vendor.user?.firstname || '',
        lastname: vendor.user?.lastname || '',
        username: vendor.user?.username || '',
        email: vendor.user?.email || '',
        password: '', // 
        role: vendor.user?.role || 'Vendor',
        status: vendor.user?.status || 'ACTIVE',
        brand: vendor.brand?._id || '',
        stores: vendor.stores?.map(store => store._id) || [], 
    });
};


const handleDelete = async (id) => {
  console.log("Deleting vendor with ID:", id); // Log the ID to ensure it's correct
  const accessToken = localStorage.getItem('token');
  if (!accessToken) {
    console.error("Access token not available.");
    return;
  }
  const deleteUrl = `http://localhost:4000/User/${id}`;
  try {
    const response = await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log("Deletion successful, server response:", response);
    fetchVendors(); // Refresh the list after deletion
  } catch (error) {
    console.error("Failed to delete vendor:", error);
    if (error.response) {
      console.error("Server responded with:", error.response.status, error.response.data);
    }
  }
};


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="primary.main">
              Vendor Management
            </Typography>
            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenModal} sx={{ mb: 2 }}>
              Add New Vendor
            </Button>
            <Modal open={openModal} onClose={handleCloseModal}>
  <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
      {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
    </Typography>
    <TextField margin="normal" fullWidth label="First Name" name="firstname" value={currentVendor.firstname} onChange={handleChange} />
    <TextField margin="normal" fullWidth label="Last Name" name="lastname" value={currentVendor.lastname} onChange={handleChange} />
    <TextField margin="normal" fullWidth label="User Name" name="username" value={currentVendor.username} onChange={handleChange} />
    <TextField margin="normal" fullWidth label="Email" name="email" value={currentVendor.email} onChange={handleChange} />
    <TextField margin="normal" fullWidth label="Password" name="password" type="password" value={currentVendor.password} onChange={handleChange} />
    <FormControl fullWidth margin="normal">
      <InputLabel id="role-select-label">Role</InputLabel>
      <Select
        labelId="role-select-label"
        id="role-select"
        value={currentVendor.role}
        label="Role"
        name="role"
        onChange={handleChange}
      >
        <MenuItem value="Vendor">Vendor</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal">
      <InputLabel id="status-select-label">Status</InputLabel>
      <Select
        labelId="status-select-label"
        id="status-select"
        value={currentVendor.status}
        label="Status"
        name="status"
        onChange={handleChange}
      >
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal">
      <InputLabel id="brand-select-label">Brand</InputLabel>
      <Select
        labelId="brand-select-label"
        id="brand-select"
        value={currentVendor.brand}
        label="Brand"
        name="brand"
        onChange={handleBrandChange}
      >
        {brands?.length > 0 ? brands.map((brand) => (
          <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
        )) : <MenuItem value="">No Brands Available</MenuItem>}
      </Select>

    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel id="stores-select-label">Stores</InputLabel>
      <Select
        labelId="stores-select-label"
        id="stores-select"
        multiple
        value={currentVendor.stores || []}
        label="Stores"
        name="stores"
        onChange={handleChange}
      >
        {stores?.length > 0 ? stores.map((store) => (
              <MenuItem key={store._id} value={store._id}>{store.name}</MenuItem>
            )) : <MenuItem value="">No Stores Available</MenuItem>}
          </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </Box>
        </Modal>
            <TableContainer component={Paper}>
              <Table sx={{ width: '100%' }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '15%' }}>Vendor ID</TableCell>
                    <TableCell style={{ width: '15%' }}>First Name</TableCell>
                    <TableCell style={{ width: '15%' }}>Last Name</TableCell>
                    <TableCell style={{ width: '15%' }}>User Name</TableCell>
                    <TableCell style={{ width: '15%' }}>Email</TableCell>
                    <TableCell style={{ width: '15%' }}>Password</TableCell>
                    <TableCell style={{ width: '15%' }}>Role</TableCell>
                    <TableCell style={{ width: '15%' }}>Status</TableCell>
                    <TableCell style={{ width: '15%' }}>Brand</TableCell>
                    <TableCell style={{ width: '15%' }}>Stores</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.user._id}>
                  <TableCell>{vendor.user ? vendor.user._id : 'No data'}</TableCell>
                  <TableCell>{vendor.user ? vendor.user.firstname : 'No data'}</TableCell>
                  <TableCell>{vendor.user ? vendor.user.lastname : 'No data'}</TableCell>
                  <TableCell>{vendor.user ? vendor.user.username : 'No data'}</TableCell>
                  <TableCell>{vendor.user ? vendor.user.email : 'No data'}</TableCell>
                  <TableCell>{'******'}</TableCell>
                  <TableCell>{vendor.user ? vendor.user.role : 'No role'}</TableCell>
                  <TableCell>{vendor.user ? (vendor.user.status === 'ACTIVE' ? 'Active' : 'Inactive') : 'No status'}</TableCell>
                  <TableCell>
                    {vendor.brand ? vendor.brand._id : (vendor.brandId ? 'Brand loading...' : 'No brand assigned')}
                  </TableCell>
                  <TableCell>
                    {vendor.stores && vendor.stores.length > 0 ? (
                      vendor.stores.map((store) => (
                        <Chip key={store._id} label={store.name} />
                      ))
                    ) : (
                      'No stores assigned'
                    )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEdit(vendor)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleDelete(vendor.user._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VendorsPage;
