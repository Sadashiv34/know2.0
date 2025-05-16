import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context/AppContext';
import CustomerList from '../components/customer/CustomerList';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyDates, setHistoryDates] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const { currentUser } = useAppContext();
  const navigate = useNavigate();

  // Fetch history dates when component mounts
  useEffect(() => {
    const fetchHistoryDates = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, 'history'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const dates = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          dates.push({
            id: doc.id,
            date: data.date.toDate(),
            formattedDate: format(data.date.toDate(), 'dd MMM yyyy')
          });
        });

        setHistoryDates(dates);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history dates:', err);
        setError('Failed to load history. Please try again later.');
        setLoading(false);
      }
    };

    fetchHistoryDates();
  }, [currentUser, navigate]);

  // Fetch history data for selected date
  const fetchHistoryData = async (dateId) => {
    try {
      setLoading(true);
      const historyRef = collection(db, 'history', dateId, 'rentals');
      const q = query(historyRef);
      const querySnapshot = await getDocs(q);
      
      const rentals = [];
      querySnapshot.forEach((doc) => {
        rentals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setHistoryData(rentals);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history data:', err);
      setError('Failed to load history data. Please try again later.');
      setLoading(false);
    }
  };

  const handleDateSelect = (date, id) => {
    setSelectedHistoryDate(date);
    fetchHistoryData(id);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Container maxWidth="md" className="py-4">
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
            Rental History
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" gap={3}>
          {/* Date list */}
          <Paper sx={{ width: 240, borderRadius: 2, overflow: 'hidden' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                p: 2, 
                fontWeight: 'bold', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
              Saved Dates
            </Typography>
            
            {loading && !selectedHistoryDate ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : historyDates.length === 0 ? (
              <Box p={2}>
                <Typography variant="body2" color="text.secondary">
                  No history found. Data is saved automatically at midnight.
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {historyDates.map((item, index) => (
                  <div key={item.id}>
                    <ListItemButton 
                      selected={selectedHistoryDate && selectedHistoryDate.getTime() === item.date.getTime()}
                      onClick={() => handleDateSelect(item.date, item.id)}
                    >
                      <ListItemText 
                        primary={item.formattedDate} 
                        primaryTypographyProps={{ 
                          fontWeight: selectedHistoryDate && selectedHistoryDate.getTime() === item.date.getTime() 
                            ? 'bold' 
                            : 'normal' 
                        }}
                      />
                    </ListItemButton>
                    {index < historyDates.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            )}
          </Paper>

          {/* History content */}
          <Box flex={1}>
            {selectedHistoryDate ? (
              <Box>
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {format(selectedHistoryDate, 'dd MMMM yyyy')}
                  </Typography>
                </Paper>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                  </Box>
                ) : historyData.length === 0 ? (
                  <Box p={3} textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      No rentals found for this date.
                    </Typography>
                  </Box>
                ) : (
                  <CustomerList customers={historyData} readOnly={true} />
                )}
              </Box>
            ) : (
              <Box p={5} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  Select a date from the list to view history.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default History;
