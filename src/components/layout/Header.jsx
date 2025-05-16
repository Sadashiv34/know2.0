import { useState } from 'react';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { Avatar, Menu, MenuItem, Switch, Typography, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Header = () => {
  const { 
    totalRevenue, 
    selectedDate, 
    setSelectedDate, 
    useCalendar, 
    setUseCalendar,
    uniqueDates 
  } = useAppContext();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDateClick = (dateStr) => {
    setSelectedDate(new Date(dateStr));
    handleClose();
  };
  
  const handleCalendarToggle = () => {
    setUseCalendar(!useCalendar);
  };
  
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Know</h1>
          <div className="text-sm">
            <p>Today: {format(new Date(), 'MMMM dd, yyyy')}</p>
            <p>Selected: {format(selectedDate, 'MMMM dd, yyyy')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow">
            <Typography variant="h6">
              Total Revenue: ${totalRevenue.toFixed(2)}
            </Typography>
          </div>
          
          <Avatar 
            className="cursor-pointer"
            onClick={handleProfileClick}
            sx={{ bgcolor: 'white', color: 'blue' }}
          >
            P
          </Avatar>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem>
              <Box display="flex" alignItems="center" width="100%">
                <CalendarMonthIcon sx={{ mr: 1 }} />
                <Typography>Enable Calendar</Typography>
                <Switch 
                  checked={useCalendar}
                  onChange={handleCalendarToggle}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Box>
            </MenuItem>
            
            <MenuItem disabled>
              <Typography variant="subtitle2" color="text.secondary">
                History by Date
              </Typography>
            </MenuItem>
            
            {uniqueDates.length > 0 ? (
              uniqueDates.map((date) => (
                <MenuItem 
                  key={date} 
                  onClick={() => handleDateClick(date)}
                  selected={format(selectedDate, 'yyyy-MM-dd') === date}
                >
                  {format(new Date(date), 'MMMM dd, yyyy')}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No history available</MenuItem>
            )}
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
