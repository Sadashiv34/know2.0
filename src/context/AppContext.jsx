import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { format } from 'date-fns';

// Helper function to format time in hours
const formatTime = (hours) => {
  if (!hours || isNaN(hours) || hours === 0) return '0h';

  // Ensure hours is treated as a number
  const numericHours = parseFloat(hours);
  return `${numericHours}h`;
};

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Rental state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [useCalendar, setUseCalendar] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [uniqueDates, setUniqueDates] = useState([]);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Function to save daily data to history
  const saveDailyDataToHistory = async () => {
    if (!currentUser) return;

    try {
      // Get today's date
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Query to get today's rentals
      const rentalsQuery = query(
        collection(db, 'rental_info'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(rentalsQuery);

      // If there are rentals for today, save them to history
      if (!querySnapshot.empty) {
        // Create a history document for today
        const historyRef = await addDoc(collection(db, 'history'), {
          date: Timestamp.fromDate(startOfDay),
          userId: currentUser.uid,
          totalRevenue: totalRevenue,
          createdAt: serverTimestamp()
        });

        // Add each rental to the history subcollection
        const batch = [];
        querySnapshot.forEach((doc) => {
          const rentalData = doc.data();
          batch.push(
            addDoc(collection(db, 'history', historyRef.id, 'rentals'), rentalData)
          );
        });

        await Promise.all(batch);
        console.log('Daily data saved to history successfully');
      }
    } catch (error) {
      console.error('Error saving daily data to history:', error);
    }
  };

  // Set up midnight timer to save daily data
  useEffect(() => {
    if (!currentUser) return;

    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    // Set a timeout to save data at midnight
    const timer = setTimeout(() => {
      saveDailyDataToHistory();
    }, timeUntilMidnight);

    // Clean up the timeout when component unmounts
    return () => clearTimeout(timer);
  }, [currentUser, totalRevenue]);

  // Fetch customers for the selected date with real-time updates
  useEffect(() => {
    if (!currentUser) {
      setCustomers([]);
      setTotalRevenue(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Format the date to get start and end of day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Create a query that filters by date and current user ID
    const q = query(
      collection(db, 'rental_info'),
      where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
      where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
      where('userId', '==', currentUser.uid) // Filter by current user ID
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData = [];

      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });

      setCustomers(customersData);

      // Calculate total revenue for the day
      const revenue = customersData.reduce((total, customer) => {
        return customer.status === 'paid' ? total + parseFloat(customer.amount) : total;
      }, 0);

      setTotalRevenue(revenue);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching customers:', error);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts or selectedDate changes
    return () => unsubscribe();
  }, [selectedDate, currentUser]);

  // Fetch all unique dates with customers using real-time updates
  useEffect(() => {
    if (!currentUser) {
      setUniqueDates([]);
      return;
    }

    // Create a query that filters by the current user ID
    const q = query(
      collection(db, 'rental_info'),
      where('userId', '==', currentUser.uid)
    );

    // Set up real-time listener for the current user's rentals
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dates = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const date = format(data.createdAt.toDate(), 'yyyy-MM-dd');
          dates.add(date);
        }
      });

      setUniqueDates(Array.from(dates).sort());
    }, (error) => {
      console.error('Error fetching unique dates:', error);
    });

    // Clean up the listener when the component unmounts or user changes
    return () => unsubscribe();
  }, [currentUser]);

  // Add a new customer
  const addCustomer = async (customerData) => {
    console.log('addCustomer called with data:', customerData);
    try {
      // Format time in hours
      const hours = customerData.hours;
      const formattedTime = formatTime(hours);
      console.log('Formatted time:', formattedTime);

      // Get current timestamp
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      // Format dates for display
      const formattedDate = format(now, 'MMM dd, yyyy');
      const formattedTime24h = format(now, 'HH:mm:ss');

      // Check if user is logged in
      if (!currentUser) {
        throw new Error('You must be logged in to add a rental');
      }

      // Prepare rental info data
      const rentalInfo = {
        name: customerData.name,
        amount: parseFloat(customerData.amount),
        status: customerData.status,
        dates: timestamp,
        time: timestamp,
        hours: hours, // Store the actual hours value
        timeFormatted: formattedTime,
        createdAt: timestamp,
        userId: currentUser.uid, // Add the current user's ID
        // Add a random warning flag for some entries (just for demo)
        hasWarning: Math.random() > 0.7
      };

      console.log('Rental info to save:', rentalInfo);

      // If using calendar, add date range
      if (customerData.dateRange) {
        rentalInfo.dateRange = {
          startDate: Timestamp.fromDate(customerData.dateRange.startDate),
          endDate: Timestamp.fromDate(customerData.dateRange.endDate)
        };
      }

      // Save rental info to rental_info collection
      console.log('Saving to rental_info collection...');
      try {
        const rentalDocRef = await addDoc(collection(db, 'rental_info'), rentalInfo);
        console.log('Saved with ID:', rentalDocRef.id);

        // Update the customers list in local state
        setCustomers(prevCustomers => [...prevCustomers, { id: rentalDocRef.id, ...rentalInfo }]);

        // Update total revenue if the customer has paid
        if (rentalInfo.status === 'paid') {
          setTotalRevenue(prev => prev + parseFloat(rentalInfo.amount));
        }

        console.log('Customer added successfully');
        return { success: true, id: rentalDocRef.id };
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        throw new Error(`Firestore error: ${firestoreError.message}`);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  // Calculate days between two dates
  const calculateDaysBetween = () => {
    if (!dateRange.startDate || !dateRange.endDate) return 0;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // Include both start and end days
  };

  // Update a customer
  const updateCustomer = async (id, data) => {
    try {
      const customerRef = doc(db, 'rental_info', id);

      // Get the current customer data
      const customer = customers.find(c => c.id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Prepare update data
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Update rental_info collection
      await updateDoc(customerRef, updateData);

      // If name or phone changed, update user_info collection
      if (data.name || data.phone) {
        // Query to find the user info document
        const userQuery = query(
          collection(db, 'user_info'),
          where('name', '==', customer.name)
        );

        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userUpdateData = {};

          if (data.name) userUpdateData.name = data.name;
          if (data.phone) userUpdateData.phone_number = data.phone;

          await updateDoc(doc(db, 'user_info', userDoc.id), userUpdateData);
        }
      }

      // Update the local state
      setCustomers(customers.map(c =>
        c.id === id ? { ...c, ...data } : c
      ));

      // Update total revenue if status changed
      if (data.status === 'paid' || data.status === 'pending') {
        if (customer) {
          const oldAmount = customer.status === 'paid' ? parseFloat(customer.amount) : 0;
          const newAmount = data.status === 'paid' ? parseFloat(data.amount || customer.amount) : 0;
          setTotalRevenue(prev => prev - oldAmount + newAmount);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error };
    }
  };

  // Delete a customer
  const deleteCustomer = async (id) => {
    try {
      // Get the customer data before deleting
      const customer = customers.find(c => c.id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Delete from rental_info collection
      const rentalRef = doc(db, 'rental_info', id);
      await deleteDoc(rentalRef);

      // Try to find and delete the corresponding user_info document
      try {
        const userQuery = query(
          collection(db, 'user_info'),
          where('name', '==', customer.name)
        );

        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          // Delete the first matching user document
          // Note: In a production app, you might want to be more careful about which user document to delete
          const userDoc = userSnapshot.docs[0];
          await deleteDoc(doc(db, 'user_info', userDoc.id));
        }
      } catch (userError) {
        console.error('Error deleting user info:', userError);
        // Continue with the function even if user deletion fails
      }

      // Update the local state
      setCustomers(customers.filter(c => c.id !== id));

      // Update total revenue if the deleted customer was paid
      if (customer && customer.status === 'paid') {
        setTotalRevenue(prev => prev - parseFloat(customer.amount));
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error };
    }
  };

  // Auth functions
  // Register a new user
  const registerUser = async (username, password, phone) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      // Create email from username for Firebase Auth (which requires email format)
      const email = `${username}@knowapp.com`;

      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to user_info collection
      await addDoc(collection(db, 'user_info'), {
        username: username,
        phone_number: phone,
        createdAt: serverTimestamp(),
        uid: user.uid
      });

      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in a user
  const signInUser = async (username, password) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      // Create email from username for Firebase Auth
      const email = `${username}@knowapp.com`;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out a user
  const signOutUser = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signOut(auth);
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    // Rental state and functions
    customers,
    loading,
    totalRevenue,
    selectedDate,
    setSelectedDate,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    useCalendar,
    setUseCalendar,
    dateRange,
    setDateRange,
    calculateDaysBetween,
    uniqueDates,
    saveDailyDataToHistory,

    // Auth state and functions
    currentUser,
    authLoading,
    authError,
    registerUser,
    signInUser,
    signOutUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
