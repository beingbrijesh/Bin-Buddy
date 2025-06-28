import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const ZoneForm = ({ zone, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    area: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name || '',
        code: zone.code || '',
        description: zone.description || '',
        area: zone.area || '',
        status: zone.status || 'active'
      });
    }
  }, [zone]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Remove coordinates from form data, let backend handle default coordinates
      const submitData = {
        ...formData
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zone Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zone Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={Boolean(errors.code)}
              helperText={errors.code}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              error={Boolean(errors.area)}
              helperText={errors.area}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
          >
            {zone ? 'Update Zone' : 'Create Zone'}
          </LoadingButton>
        </Box>
      </Box>
    </form>
  );
};

export default ZoneForm; 