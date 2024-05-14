import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Modal, Box, TextField, Grid, Container, MenuItem, createTheme, ThemeProvider, CssBaseline
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

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [openCollectionModal, setOpenCollectionModal] = useState(false);
  const [currentCollection, setCurrentCollection] = useState({ name: '', description: '', brand: '', products: [], imageUrl: '' });
  const [isEditingCollection, setIsEditingCollection] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchBrands();
  }, []);

  const fetchCollections = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      const response = await axios.get('http://localhost:4000/Collection/collections', { headers: { Authorization: `Bearer ${accessToken}` } });
      setCollections(response.data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    }
  };

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

  const handleOpenCollectionModal = () => {
    setOpenCollectionModal(true);
    setCurrentCollection({ name: '', description: '', brand: '', products: [], images: '' });
    setIsEditingCollection(false);
  };

  const handleCloseCollectionModal = () => {
    setOpenCollectionModal(false);
  };

  const handleChangeCollection = (e) => {
    const { name, value } = e.target;
    setCurrentCollection(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitCollection = async (id) => {

    const accessToken = localStorage.getItem('token');
    if (!accessToken) {
        console.error("Access token not available.");
        return;
    }

    // Using id directly from arguments when editing
    if (isEditingCollection) {
        try {
            await axios.put(`http://localhost:4000/Collection/updatecollections/${id}`, currentCollection, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            handleCloseCollectionModal();
            await fetchCollections();
        } catch (error) {
            console.error("Failed to update collection:", error);
        }
    } else {
        // Handle create new collection case
        try {
            await axios.post('http://localhost:4000/Collection/createcollection', currentCollection, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            handleCloseCollectionModal();
            await fetchCollections();
        } catch (error) {
            console.error("Failed to add new collection:", error);
        }
    }
};

  const handleEditCollection = (id) => {
    const collectionToEdit = collections.find((collection) => collection._id === id);
    if (collectionToEdit) {
      setCurrentCollection(collectionToEdit);
      setOpenCollectionModal(true);
      setIsEditingCollection(true);
    } else {
      console.error("Collection not found");
    }
  };
  
  const handleDeleteCollection = async (id) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`http://localhost:4000/Collection/deletecollections/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      await fetchCollections();
    } catch (error) {
      console.error("Failed to delete collection:", error);
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
              Collections
            </Typography>

            <Modal open={openCollectionModal} onClose={handleCloseCollectionModal}>
              <Box sx={modalStyle} component="form" onSubmit={handleSubmitCollection}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  {isEditingCollection ? "Edit Collection" : "Add New Collection"}
                </Typography>
                <TextField margin="normal" fullWidth label="Name" name="name" value={currentCollection.name} onChange={handleChangeCollection} />
                <TextField margin="normal" fullWidth label="Description" name="description" value={currentCollection.description} onChange={handleChangeCollection} />
                <TextField margin="normal" fullWidth label="Brand" name="brand" select value={currentCollection.brand} onChange={handleChangeCollection}>
                  {brands.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField margin="normal" fullWidth label="Image Url" name="images" value={currentCollection.images} onChange={handleChangeCollection} />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                  {isEditingCollection ? "Update" : "Add"}
                </Button>
              </Box>
            </Modal>

            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenCollectionModal} sx={{ mb: 2 }}>
              Add New Collection
            </Button>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Image URL</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection._id}>
                      <TableCell>{collection.name}</TableCell>
                      <TableCell>{collection.description}</TableCell>
                      <TableCell>{collection.brand.name}</TableCell> 
                      <TableCell>{collection.images}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEditCollection(collection._id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleDeleteCollection(collection._id)}>
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

export default CollectionsPage;
