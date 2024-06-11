import React, { useState } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar'; // Adjust the import path according to your file structure

const DashboardPage = () => {
  const [loading, setLoading] = useState(false); // Adjust based on your actual loading logic

  return (
    <Container maxWidth='xl'>
      <style jsx>{`
        .main-content {
          overflow: hidden; 
        }
      `}</style>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Analytics
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
              <CircularProgress />
            </Box>
          ) : (
            <iframe 
              title="competitor2" 
              width="100%" 
              height="525" 
              src="https://app.powerbi.com/view?r=eyJrIjoiYTY2NGFiZTQtZWM4Yy00OTQ3LWE3NTMtM2U5ZWU2ZTI4MDc0IiwidCI6ImZlZTNiOTE2LTAxYzEtNDk4Ny1hNjQ2LWUxOTM0MzJiOWVhYSIsImMiOjl9&pageName=ReportSection" 
              frameBorder="0" 
              allowFullScreen="true"
            ></iframe>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
