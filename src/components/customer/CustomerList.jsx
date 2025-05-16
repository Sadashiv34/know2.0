import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const CustomerList = ({ customers: propCustomers, readOnly = false }) => {
  const { customers: contextCustomers, loading, updateCustomer } = useAppContext();

  // Use provided customers from props if available, otherwise use from context
  const customers = propCustomers || contextCustomers;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleToggleStatus = async (customer) => {
    try {
      // Toggle between 'paid' and 'pending'
      const newStatus = customer.status === 'paid' ? 'pending' : 'paid';

      // Update the customer status
      const result = await updateCustomer(customer.id, { status: newStatus });

      if (result.success) {
        setSnackbar({
          open: true,
          message: `Status updated to ${newStatus}`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (customers.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        border="1px solid #eee"
        borderRadius="4px"
        p={3}
        mt={3}
      >
        <Typography variant="body1" color="text.secondary">
          No rentals found. Add a new rental to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid #eee' }}>
              <TableCell sx={{ color: '#666', fontWeight: 'normal' }}>Name</TableCell>
              <TableCell sx={{ color: '#666', fontWeight: 'normal' }}>Time</TableCell>
              <TableCell sx={{ color: '#666', fontWeight: 'normal' }}>Amount</TableCell>
              <TableCell sx={{ color: '#666', fontWeight: 'normal' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
              <TableRow
                key={customer.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderBottom: '1px solid #eee'
                }}
              >
                <TableCell sx={{ py: 2 }}>{customer.name}</TableCell>
                <TableCell sx={{ py: 2, color: '#4285F4' }}>
                  {customer.hasWarning ? (
                    <Box display="flex" alignItems="center">
                      <WarningIcon sx={{ color: 'orange', fontSize: 16, mr: 0.5 }} />
                      {customer.timeFormatted || '0s'}
                    </Box>
                  ) : (
                    customer.timeFormatted || '0s'
                  )}
                </TableCell>
                <TableCell sx={{ py: 2 }}>₹ {customer.amount}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  {readOnly ? (
                    <Box
                      component="span"
                      sx={{
                        bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.1)' : 'rgba(245, 166, 35, 0.1)',
                        color: customer.status === 'paid' ? '#00a650' : '#f5a623',
                        px: 2,
                        py: 0.5,
                        borderRadius: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        minWidth: '80px',
                        justifyContent: 'center',
                        border: customer.status === 'paid' ? '1px solid rgba(0, 166, 80, 0.2)' : '1px solid rgba(245, 166, 35, 0.2)'
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: customer.status === 'paid' ? '#00a650' : '#f5a623',
                          mr: 0.5,
                          display: 'inline-block'
                        }}
                      />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {customer.status === 'paid' ? 'Paid' : 'Pending'}
                      </Typography>
                    </Box>
                  ) : (
                    <Tooltip title={`Click to change to ${customer.status === 'paid' ? 'pending' : 'paid'}`}>
                      <Box
                        component="span"
                        onClick={() => handleToggleStatus(customer)}
                        sx={{
                          bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.1)' : 'rgba(245, 166, 35, 0.1)',
                          color: customer.status === 'paid' ? '#00a650' : '#f5a623',
                          px: 2,
                          py: 0.5,
                          borderRadius: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          minWidth: '80px',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
                          border: customer.status === 'paid' ? '1px solid rgba(0, 166, 80, 0.2)' : '1px solid rgba(245, 166, 35, 0.2)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.15)' : 'rgba(245, 166, 35, 0.15)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: customer.status === 'paid' ? '#00a650' : '#f5a623',
                            mr: 0.5,
                            display: 'inline-block'
                          }}
                        />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {customer.status === 'paid' ? 'Paid' : 'Pending'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            // Fallback to sample data for demonstration when no real data exists
            [
              { id: 1, name: 'n m', timeFormatted: '0s', amount: 3, status: 'pending' },
              { id: 2, name: 'gg', timeFormatted: '0s', amount: 2, status: 'paid' },
              { id: 3, name: 'gg', timeFormatted: '13m 38s', amount: 2, status: 'paid', hasWarning: true },
              { id: 4, name: 'hbn', timeFormatted: '0s', amount: 5, status: 'paid' },
            ].map((customer) => (
              <TableRow
                key={customer.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderBottom: '1px solid #eee'
                }}
              >
                <TableCell sx={{ py: 2 }}>{customer.name}</TableCell>
                <TableCell sx={{ py: 2, color: '#4285F4' }}>
                  {customer.hasWarning ? (
                    <Box display="flex" alignItems="center">
                      <WarningIcon sx={{ color: 'orange', fontSize: 16, mr: 0.5 }} />
                      {customer.timeFormatted}
                    </Box>
                  ) : (
                    customer.timeFormatted
                  )}
                </TableCell>
                <TableCell sx={{ py: 2 }}>₹ {customer.amount}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  {readOnly ? (
                    <Box
                      component="span"
                      sx={{
                        bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.1)' : 'rgba(245, 166, 35, 0.1)',
                        color: customer.status === 'paid' ? '#00a650' : '#f5a623',
                        px: 2,
                        py: 0.5,
                        borderRadius: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        minWidth: '80px',
                        justifyContent: 'center',
                        border: customer.status === 'paid' ? '1px solid rgba(0, 166, 80, 0.2)' : '1px solid rgba(245, 166, 35, 0.2)'
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: customer.status === 'paid' ? '#00a650' : '#f5a623',
                          mr: 0.5,
                          display: 'inline-block'
                        }}
                      />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {customer.status === 'paid' ? 'Paid' : 'Pending'}
                      </Typography>
                    </Box>
                  ) : (
                    <Tooltip title={`Click to change to ${customer.status === 'paid' ? 'pending' : 'paid'}`}>
                      <Box
                        component="span"
                        onClick={() => handleToggleStatus(customer)}
                        sx={{
                          bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.1)' : 'rgba(245, 166, 35, 0.1)',
                          color: customer.status === 'paid' ? '#00a650' : '#f5a623',
                          px: 2,
                          py: 0.5,
                          borderRadius: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          minWidth: '80px',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
                          border: customer.status === 'paid' ? '1px solid rgba(0, 166, 80, 0.2)' : '1px solid rgba(245, 166, 35, 0.2)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: customer.status === 'paid' ? 'rgba(0, 166, 80, 0.15)' : 'rgba(245, 166, 35, 0.15)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: customer.status === 'paid' ? '#00a650' : '#f5a623',
                            mr: 0.5,
                            display: 'inline-block'
                          }}
                        />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {customer.status === 'paid' ? 'Paid' : 'Pending'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

      {/* Snackbar for status updates */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomerList;
