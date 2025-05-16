import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../../context/AppContext';

const CustomerModal = ({ open, onClose }) => {
  const { addCustomer, useCalendar, dateRange, setDateRange, calculateDaysBetween } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    hours: '',
    status: 'pending'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (type, newDate) => {
    setDateRange({
      ...dateRange,
      [type]: newDate
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }



    if (useCalendar) {
      if (!dateRange.startDate || !dateRange.endDate) {
        newErrors.dates = 'Both start and end dates are required';
      } else if (dateRange.endDate < dateRange.startDate) {
        newErrors.dates = 'End date cannot be before start date';
      }
    } else {
      if (!formData.hours) {
        newErrors.hours = 'Hours are required';
      } else if (isNaN(formData.hours) || parseFloat(formData.hours) <= 0) {
        newErrors.hours = 'Hours must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const customerData = {
        ...formData,
        amount: parseFloat(formData.amount),
        hours: useCalendar ? calculateDaysBetween() : parseFloat(formData.hours),
        dateRange: useCalendar ? {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        } : null
      };

      console.log('Submitting customer data:', customerData);
      const result = await addCustomer(customerData);
      console.log('Result from addCustomer:', result);

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          amount: '',
          hours: '',
          status: 'pending'
        });
        onClose();
      } else {
        console.error('Failed to add customer:', result.error);
        alert('Failed to add rental. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #eee', p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Add New Rental
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box>
          <TextField
            fullWidth
            label="Customer Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            margin="normal"
            error={!!errors.amount}
            helperText={errors.amount}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
          />

          {useCalendar ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(newDate) => handleDateChange('startDate', newDate)}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(newDate) => handleDateChange('endDate', newDate)}
                />
              </Box>
              {errors.dates && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.dates}
                </Typography>
              )}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Total Days: {calculateDaysBetween()}
                </Typography>
              </Box>
            </LocalizationProvider>
          ) : (
            <TextField
              fullWidth
              label="Time (hours)"
              name="hours"
              type="number"
              value={formData.hours}
              onChange={handleChange}
              margin="normal"
              error={!!errors.hours}
              helperText={errors.hours}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          )}



          <FormControl fullWidth margin="normal" size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#666',
            textTransform: 'none',
            fontWeight: 'normal'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#4285F4',
            textTransform: 'none',
            fontWeight: 'normal',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#3367d6',
              boxShadow: 'none'
            }
          }}
        >
          Add Rental
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerModal;
