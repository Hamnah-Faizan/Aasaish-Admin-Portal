import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Table, TableBody, TableCell, TableContainer, MenuItem, TableHead, TableRow, Paper, Typography, IconButton, Modal, Box, TextField, Grid, Container, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { blue, pink } from '@mui/material/colors';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  marginTop: '20px',
};

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

const StoresPage = () => {
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [openStoreModal, setOpenStoreModal] = useState(false);
  const [currentStore, setCurrentStore] = useState({ name: '', address: '', contactInfo: '', location: { lat: 24.8607, lng: 67.0011 }, brand: '' });
  const [isEditingStore, setIsEditingStore] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchStores();
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

  const fetchStores = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      const response = await axios.get('http://localhost:4000/Store/all', { headers: { Authorization: `Bearer ${accessToken}` } });
      console.log('Fetched stores:', response.data); // Debugging line to check fetched stores
      setStores(response.data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const handleOpenStoreModal = () => {
    setOpenStoreModal(true);
    setCurrentStore({ name: '', address: '', contactInfo: '', location: { lat: 24.8607, lng: 67.0011 }, brand: '' });
    setIsEditingStore(false);
  };

  const handleCloseStoreModal = () => {
    setOpenStoreModal(false);
  };

  const handleChangeStore = (e) => {
    const { name, value } = e.target;
    setCurrentStore(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitStore = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }

      const storeData = {
        ...currentStore,
        location: {
          type: 'Point',
          coordinates: [currentStore.location.lng, currentStore.location.lat]
        }
      };

      if (isEditingStore) {
        await axios.put(`http://localhost:4000/Store/${currentStore._id}`, storeData, { headers: { Authorization: `Bearer ${accessToken}` } });
      } else {
        await axios.post('http://localhost:4000/Store/create', storeData, { headers: { Authorization: `Bearer ${accessToken}` } });
      }
      handleCloseStoreModal();
      await fetchStores();
    } catch (error) {
      console.error("Failed to submit store:", error.response?.data || error.message);
    }
  };

  const handleEditStore = (id) => {
    const storeToEdit = stores.find((store) => store._id === id);
    if (storeToEdit) {
      setCurrentStore({
        ...storeToEdit,
        location: {
          lat: storeToEdit.location.coordinates[1],
          lng: storeToEdit.location.coordinates[0]
        }
      });
      setOpenStoreModal(true);
      setIsEditingStore(true);
    } else {
      console.error("Store not found");
    }
  };

  const handleDeleteStore = async (id) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        console.error("Access token not available.");
        return;
      }
      await axios.delete(`http://localhost:4000/Store/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      await fetchStores();
    } catch (error) {
      console.error("Failed to delete store:", error);
    }
  };

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setCurrentStore(prevState => ({
          ...prevState,
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        }));
      },
    });
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="primary.main">
              Stores
            </Typography>

            {/* Store Modal */}
            <Modal open={openStoreModal} onClose={handleCloseStoreModal}>
              <Box sx={modalStyle} component="form" onSubmit={handleSubmitStore}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  {isEditingStore ? "Edit Store" : "Add New Store"}
                </Typography>
                <TextField margin="normal" fullWidth label="Brand" name="brand" select value={currentStore.brand} onChange={handleChangeStore}>
                  {brands.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField margin="normal" fullWidth label="Name" name="name" value={currentStore.name} onChange={handleChangeStore} />
                <TextField margin="normal" fullWidth label="Address" name="address" value={currentStore.address} onChange={handleChangeStore} />
                <TextField margin="normal" fullWidth label="Contact Info" name="contactInfo" value={currentStore.contactInfo} onChange={handleChangeStore} />
                <MapContainer center={[currentStore.location.lat, currentStore.location.lng]} zoom={13} style={mapContainerStyle} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClick />
                  <Marker position={[currentStore.location.lat, currentStore.location.lng]}>
                    <Popup>Store Location</Popup>
                  </Marker>
                </MapContainer>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Latitude" name="lat" value={currentStore.location.lat} onChange={handleChangeStore} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Longitude" name="lng" value={currentStore.location.lng} onChange={handleChangeStore} />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                  {isEditingStore ? "Update" : "Add"}
                </Button>
              </Box>
            </Modal>

            {/* Store Table */}

            <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary" onClick={handleOpenStoreModal} sx={{ mb: 2 }}>
              Add New Store
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => {
                    const coordinatesExist = store.location && Array.isArray(store.location.coordinates) && store.location.coordinates.length === 2;
                    return (
                      <TableRow key={store._id}>
                        <TableCell>{store.name}</TableCell>
                        <TableCell>{store.address}</TableCell>
                        <TableCell>{store.contactInfo}</TableCell>
                        <TableCell>{store.brand.name}</TableCell>
                        <TableCell>
                          {coordinatesExist
                            ? `Lat: ${store.location.coordinates[1]}, Lng: ${store.location.coordinates[0]}`
                            : 'Location not provided'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleEditStore(store._id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteStore(store._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {stores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center">No stores found</TableCell>
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



export default StoresPage;