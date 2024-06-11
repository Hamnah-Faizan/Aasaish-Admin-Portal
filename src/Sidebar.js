import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import StoreIcon from '@mui/icons-material/StoreOutlined';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import InventoryIcon from '@mui/icons-material/InventoryOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import CollectionsIcon from '@mui/icons-material/CollectionsOutlined';
import LabelIcon from '@mui/icons-material/LabelOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import BookOnlineIcon from '@mui/icons-material/BookOnlineOutlined';

function Sidebar({ handleItemClick }) {
  const items = [
    { text: 'DASHBOARD', icon: <HomeIcon /> },
    { text: 'CUSTOMERS', icon: <PeopleIcon /> },
    { text: 'VENDORS', icon: <PeopleIcon /> },
    { text: 'BRANDS', icon: <BrandingWatermarkIcon /> },
    { text: 'STORES', icon: <StoreIcon /> },
    { text: 'CATEGORIES', icon: <CategoryIcon /> },
    { text: 'COLLECTIONS', icon: <CollectionsIcon /> },
    { text: 'TAGS', icon: <LabelIcon /> },
    { text: 'PRODUCTS', icon: <ShoppingCartIcon /> },
    { text: 'INVENTORY', icon: <InventoryIcon /> },
    { text: 'ORDERS', icon: <AssignmentIcon /> },
    { text: 'RESERVATION', icon: <BookOnlineIcon /> },
  ];


  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#212121', // Dark theme background
          color: '#ffffff', // Light text for better contrast
          borderRadius: '0px 25px 25px 0px', // Rounded corners on the right
          paddingTop: '20px', // Top padding
          paddingBottom: '20px', // Bottom padding
          // '::-webkit-scrollbar': {
          //   display: 'none', // Hide scrollbar for Chrome, Safari, and Opera
          // },
          // '-ms-overflow-style': 'none', // Hide scrollbar for IE and Edge
          // 'scrollbar-width': 'none', // Hide scrollbar for Firefox
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 'bold' }}>
          Admin Portal
        </Typography>
      </Box>
      <List>
        {items.map((item, index) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={`/${item.text.toLowerCase()}`}
            onClick={() => handleItemClick(`/${item.text.toLowerCase()}`)}
            sx={{
              borderRadius: '20px',
              marginBottom: '10px',
              '&:hover': {
                backgroundColor: '#424242',
                '& .MuiListItemIcon-root': {
                  color: '#4caf50',
                },
              },
              '&.Mui-selected': {
                backgroundColor: '#333',
                '&:hover': {
                  backgroundColor: '#424242',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'gray', minWidth: '40px' }}>
            {index === 0 && <HomeIcon />}
                {index === 1 && <PeopleIcon />}
                {index === 2 && <PeopleIcon />}
                {index === 3 && <BrandingWatermarkIcon />}
                {index === 4 && <StoreIcon />}
                {index === 5 && <CategoryIcon />}
                {index === 6 && <CollectionsIcon />}
                {index === 7 && <LabelIcon />}
                {index === 8 && <ShoppingCartIcon />}
                {index === 9 && <InventoryIcon />}
                {index === 10 && <AssignmentIcon />}
                {index === 11 && <BookOnlineIcon />}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 'medium' } }} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
