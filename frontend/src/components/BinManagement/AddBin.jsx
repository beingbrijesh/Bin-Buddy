import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import { TextField, Grid, Box, Paper, Typography, Button } from '@mui/material';

const AddBin = () => {
  const [formData, setFormData] = useState({
    binId: '',
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    latitude: '',
    longitude: '',
    capacity: '',
    type: '',
    status: 'active'
  });

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form Data Updated:', formData);
  }, [formData]);

  const handleLocationSelect = (addressData) => {
    console.log('Received Address Data:', addressData);

    if (!addressData || !addressData.components) {
      console.error('Invalid address data received');
      return;
    }

    try {
      // Extract address components
      const components = addressData.components;
      
      // Helper function to find address component by type
      const getAddressComponent = (types) => {
        if (!Array.isArray(types)) types = [types];
        for (const type of types) {
          if (components[type]) {
            return components[type];
          }
        }
        return '';
      };

      // Build complete street address
      const streetNumber = getAddressComponent('street_number');
      const route = getAddressComponent('route');
      const sublocality = getAddressComponent(['sublocality_level_1', 'sublocality']);
      const area = getAddressComponent(['neighborhood', 'sublocality_level_2']);

      const fullAddress = [streetNumber, route, sublocality]
        .filter(Boolean)
        .join(', ');

      console.log('Building new form data with:', {
        fullAddress,
        area,
        coordinates: addressData.coordinates
      });

      // Update form data with all available information
      setFormData(prevData => {
        const newData = {
          ...prevData,
          address: fullAddress || addressData.fullAddress || '',
          area: area || sublocality || '',
          city: getAddressComponent(['locality', 'administrative_area_level_2']) || '',
          state: getAddressComponent('administrative_area_level_1') || '',
          pincode: getAddressComponent('postal_code') || '',
          landmark: getAddressComponent(['point_of_interest', 'establishment']) || '',
          latitude: addressData.coordinates ? addressData.coordinates[0].toString() : '',
          longitude: addressData.coordinates ? addressData.coordinates[1].toString() : ''
        };
        console.log('New Form Data:', newData);
        return newData;
      });

    } catch (error) {
      console.error('Error processing address data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    // Add your form submission logic here
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add New Bin
      </Typography>
      
      <MapComponent
        position={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : null}
        setPosition={(pos) => {
          if (pos) {
            console.log('Map position updated:', pos);
            setFormData(prev => ({
              ...prev,
              latitude: pos[0].toString(),
              longitude: pos[1].toString()
            }));
          }
        }}
        onLocationSelect={handleLocationSelect}
      />

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Bin ID"
                name="binId"
                value={formData.binId}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Capacity (in liters)"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Bin Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Type</option>
                <option value="general">General Waste</option>
                <option value="recyclable">Recyclable</option>
                <option value="organic">Organic</option>
                <option value="hazardous">Hazardous</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Add Bin
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddBin; 