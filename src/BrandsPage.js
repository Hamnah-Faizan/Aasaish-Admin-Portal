// BrandsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, TableBody, TableCell, TableContainer, MenuItem, TableHead, TableRow, Paper, Typography, IconButton, Modal, Box, TextField, Grid, Container, createTheme, ThemeProvider, CssBaseline
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
    width: '90%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    borderRadius: '16px',
    p: 4,
    overflowY: 'auto',
    maxHeight: '90vh',
  };
  

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [currentBrand, setCurrentBrand] = useState({ name: '', description: '', logoUrl: '' });
  const [isEditingBrand, setIsEditingBrand] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      const response = await axios.get('http://localhost:4000/Brand/getbrands', { headers: { Authorization: `Bearer ${accessToken}` } });
      setBrands(response.data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleOpenBrandModal = () => {
    setOpenBrandModal(true);
    setCurrentBrand({ name: '', description: '', logoUrl: '' });
    setIsEditingBrand(false);
  };

  const handleCloseBrandModal = () => {
    setOpenBrandModal(false);
  };

  const handleChangeBrand = (e) => {
    const { name, value } = e.target;
    setCurrentBrand(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitBrand = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      if (isEditingBrand) {
        await axios.put(`http://localhost:4000/Brand/${currentBrand._id}`, currentBrand, { headers: { Authorization: `Bearer ${accessToken}` } });
      } else {
        await axios.post('http://localhost:4000/Brand/create', currentBrand, { headers: { Authorization: `Bearer ${accessToken}` } });
      }
      handleCloseBrandModal();
      await fetchBrands();
    } catch (error) {
      console.error("Failed to submit brand:", error);
    }
  };

  const handleEditBrand = (id) => {
    const brandToEdit = brands.find((brand) => brand._id === id);
    if (brandToEdit) {
      setCurrentBrand(brandToEdit);
      setOpenBrandModal(true);
      setIsEditingBrand(true);
    } else {
      console.error("Brand not found");
    }
  };
  
  const handleDeleteBrand = async (id) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`http://localhost:4000/Brand/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      await fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
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
            Brands
          </Typography>

          <Modal open={openBrandModal} onClose={handleCloseBrandModal}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmitBrand}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                {isEditingBrand ? "Edit Brand" : "Add New Brand"}
              </Typography>
              <TextField margin="normal" fullWidth label="Name" name="name" value={currentBrand.name} onChange={handleChangeBrand} />
              <TextField margin="normal" fullWidth label="Description" name="description" value={currentBrand.description} onChange={handleChangeBrand} />
              <TextField margin="normal" fullWidth label="Logo URL" name="logoUrl" value={currentBrand.logoUrl} onChange={handleChangeBrand} />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                {isEditingBrand ? "Update" : "Add"}
              </Button>
            </Box>
          </Modal>

          <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenBrandModal} sx={{ mb: 2 }}>
            Add New Brand
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>LogoUrl</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand._id}>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.description}</TableCell>
                    <TableCell>{brand.logoUrl}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditBrand(brand._id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteBrand(brand._id)}>
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

export default BrandsPage;
