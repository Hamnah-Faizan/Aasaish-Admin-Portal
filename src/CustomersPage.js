import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, IconButton, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Modal, Box, TextField, Container, createTheme, ThemeProvider, CssBaseline,
  MenuItem, FormControl, Select, InputLabel
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

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    location: {
      type: 'Point',
      coordinates: [0, 0] 
    },
    address: '',
    role: 'Customer',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:4000/User/customers', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      // Ensure that you are setting an array even if data is undefined or null
      console.log(response.data.data)
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]); // Set to empty array on error
    }
  };
  

  const handleOpenModal = () => {
    setOpenModal(true);
    setIsEditing(false);
    setCurrentCustomer({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      address: '',
      role: 'Customer',
      status: 'ACTIVE'
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { value } = e.target;
    const [longitude, latitude] = value.split(',').map(Number);
    setCurrentCustomer(prevState => ({
      ...prevState,
      location: {
        ...prevState.location,
        coordinates: [longitude, latitude]
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    const url = isEditing ? `http://localhost:4000/User/user/${currentCustomer._id}` : 'http://localhost:4000/User/signup';
    const method = isEditing ? axios.put : axios.post;
    try {
      await method(url, currentCustomer, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.error("Failed to submit customer:", error.response?.data || error.message);
    }
  };

  const handleEdit = (customer) => {
    setOpenModal(true);
    setIsEditing(true);
    const coordinates = customer.location && Array.isArray(customer.location.coordinates) 
                         ? customer.location.coordinates 
                         : [0, 0];
    setCurrentCustomer({
      firstname: customer.user?.firstname || '',
      lastname: customer.user?.lastname || '',
      username: customer.user?.username || '',
      email: customer.user?.email || '',
      password: customer.user?.password || '',
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      address: customer.address || '',
      role: customer.user?.role || 'Customer',
      status: customer.user?.status || 'ACTIVE'
    });
  };
  
  const handleDelete = async (id) => {
    try {
    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
      console.error("Access token not available.");
      return;
    }
    await axios.delete(`http://localhost:4000/User/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } }); 
    await fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
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
              Customer Management
            </Typography>
            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenModal} sx={{ mb: 2 }}>
              Add New Customer
            </Button>
            <Modal open={openModal} onClose={handleCloseModal}>
              <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </Typography>
                <TextField margin="normal" fullWidth label="First Name" name="firstname" value={currentCustomer.firstname} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Last Name" name="lastname" value={currentCustomer.lastname} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="User Name" name="username" value={currentCustomer.username} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Email" name="email" value={currentCustomer.email} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Password" name="password" type="password" value={currentCustomer.password} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Location" name="location" value={currentCustomer.location.coordinates} onChange={handleLocationChange} />
                <TextField margin="normal" fullWidth label="Address" name="address" value={currentCustomer.address} onChange={handleChange} />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={currentCustomer.role}
                    label="Role"
                    name="role"
                    onChange={handleChange}
                  >
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Vendor">Vendor</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                  {isEditing ? 'Update' : 'Add'}
                </Button>
              </Box>
            </Modal>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer ID</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Password</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>  
                  <TableCell>{customer.user ? customer.user._id : 'No data'}</TableCell>
                    <TableCell>{customer.user ? customer.user.firstname : 'No data'}</TableCell>
                    <TableCell>{customer.user ? customer.user.lastname : 'No data'}</TableCell>
                    <TableCell>{customer.user ? customer.user.username : 'No data'}</TableCell>
                    <TableCell>{customer.user ? customer.user.email : 'No data'}</TableCell>
                    <TableCell>{'******'}</TableCell>
                    <TableCell>{customer.location && customer.location.coordinates
                          ? customer.location.coordinates.join(', ')
                          : 'Location not provided'}
                      </TableCell>
                    <TableCell>{customer.address || 'Address not provided'}</TableCell>
                    <TableCell>{customer.user ? customer.user.role : 'No role'}</TableCell>
                    <TableCell>{customer.user ? (customer.user.status === 'ACTIVE' ? 'Active' : 'Inactive') : 'No status'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(customer)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(customer.user._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No customers found</TableCell>
                  </TableRow>
                )}
              </TableBody>

              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CustomersPage;
