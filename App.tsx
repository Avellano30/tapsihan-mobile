import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

//Screens
import Login from './screens/auth/Login'
import Register from './screens/auth/Register';
import ProductDetails from './screens/main/sub/ProductDetails';
import CartItems from './screens/main/sub/CartItems';
import Orders from './screens/main/Orders';
import UpdateProfile from './screens/main/sub/UpdateProfile';

//LocalStorage
import { MMKV } from 'react-native-mmkv'
import Products from './screens/main/Products';
import Home from './screens/main/Home';
export const storage = new MMKV();
const Stack = createNativeStackNavigator();

//Endpoint
export const endpoint = 'http://localhost:8080'

function App() {
  return (
    <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={storage.getString('userId') === undefined ? 'Login' : 'Home'}>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />

            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Products" component={Products} options={{ headerShown: false }} />
            <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }} />

            <Stack.Screen name="UpdateProfile" component={UpdateProfile} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
            <Stack.Screen name="CartItems" component={CartItems} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
    </PaperProvider>
  );
}

export default App;