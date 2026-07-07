import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your machine's IP when testing on a physical device
const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// const BASE_URL = 'http://localhost:5000/api'; // iOS simulator

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
