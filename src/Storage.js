import { AsyncStorage } from 'react-native';
const itemName = 'nmaUserToken';

export const getUserToken = async () => {
    return await AsyncStorage.getItem(itemName);
};

export const saveUserToken = async (userToken) => {
    return await AsyncStorage.setItem(itemName, userToken);
};

export const removeUserToken = async () => {
    return await AsyncStorage.removeItem(itemName);
};
