import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Check if we're on web
export const isWeb = Platform.OS === 'web';

// Safe clipboard operations
export const safeCopyToClipboard = async (text: string) => {
  if (isWeb) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      return false;
    }
  } else if (!isExpoGo) {
    try {
      const { setStringAsync } = await import('expo-clipboard');
      await setStringAsync(text);
      return true;
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      return false;
    }
  }
  return false;
};

// Safe notification operations
export const safeScheduleNotification = async (options: any) => {
  if (isExpoGo) {
    console.warn('Notifications not supported in Expo Go');
    return null;
  }
  
  try {
    const Notifications = await import('expo-notifications');
    return await Notifications.scheduleNotificationAsync(options);
  } catch (error) {
    console.warn('Notification scheduling failed:', error);
    return null;
  }
};

// Safe barcode scanner operations
export const safeScanBarcode = async () => {
  if (isExpoGo) {
    console.warn('Barcode scanner not fully supported in Expo Go');
    return null;
  }
  
  try {
    const { BarCodeScanner } = await import('expo-barcode-scanner');
    return BarCodeScanner;
  } catch (error) {
    console.warn('Barcode scanner not available:', error);
    return null;
  }
};

// Safe clipboard import for components
export const safeGetClipboard = async () => {
  if (isWeb) {
    return navigator.clipboard;
  } else if (!isExpoGo) {
    try {
      return await import('expo-clipboard');
    } catch (error) {
      console.warn('Clipboard not available:', error);
      return null;
    }
  }
  return null;
}; 