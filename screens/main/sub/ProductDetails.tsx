import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Appbar, Button, HelperText, Modal, Portal, TextInput } from 'react-native-paper';
import { ParamListBase, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { endpoint, storage } from '../../../App';

//@ts-ignore
import Gcash from '../../assets/qr.png';

interface ProductDetailsRouteParams {
    product: {
        _id: string;
        productName: string;
        description: string;
        price: number;
        stocks: number;
        image: string;
    };
}

interface ICart {
    items: ICartItem[];
    status: string;
}

interface ICartItem {
    _id: string;
    product: IProduct;
    quantity: number;
    status: string;
}

interface IProduct {
    _id: string;
}

interface User {
    username: string;
    email: string;
    address: string;
    contact: string;
}

export default function ProductDetails() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const route = useRoute<RouteProp<{ params: ProductDetailsRouteParams }, 'params'>>();
    const { product } = route.params;
    const [message, setMessage] = useState<string | null>(null);
    const [userCart, setUserCart] = useState<number>(0);
    const userId = storage.getString('userId');

    useFocusEffect(
        React.useCallback(() => {
            getActiveCart();
        }, [])
    );

    const getActiveCart = async () => {
        const response = await fetch(`${endpoint}/cart/${userId}`)
        const data = await response.json();
        const cartQuantity = data.items.find((item: ICartItem) => item.product._id === product._id && item.status === 'cart');
        if (!cartQuantity) {
            setUserCart(0);
        }
        setUserCart(cartQuantity?.quantity);
    };

    const addToCart = async () => {
        if (product.stocks <= 0) {
            setMessage('Out of stock!');
            setTimeout(() => setMessage(null), 2000);
            return;
        }

        if (product.stocks < userCart! + 1) {
            setMessage('Remaining Stocks: ' + product.stocks + '\nPlease check your cart.');
            setTimeout(() => setMessage(null), 2000);
            return;
        }

        try {
            const response = await fetch(`${endpoint}/cart/add`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({
                    userId,
                    productId: product._id,
                    quantity: 1,
                }),
            })

            if (!response.ok) {
                Alert.alert("Something went wrong");
                return;
            }
            getActiveCart();
            setMessage('Added to cart successfully!');
            setTimeout(() => setMessage(null), 2000);
            return;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    return (
        <SafeAreaView style={tw`flex-1`}>
            <Appbar.Header style={tw`bg-transparent absolute`} elevated>
                <Appbar.Action icon="chevron-left" color='white' style={tw`rounded-full bg-[#1e1e1e]`} size={30} onPress={() => navigation.goBack()} />
            </Appbar.Header>
            <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`pb-20`}>
                <Image source={{ uri: `${product.image}` }} style={{ width: 'auto', height: 400 }} />
                <View style={tw`flex-1 border-t-2 border-[#ececec] p-3`}>
                    <View style={tw`flex-row justify-between mt-2`}>
                        <Text style={tw`text-xl font-bold text-black`}>{product.productName}</Text>
                        <Text style={tw`text-base font-semibold text-black`}>from ₱{product.price.toFixed(2)}</Text>
                    </View>
                    <Text style={tw`text-base mt-2`}>{product.description}</Text>
                </View>
            </ScrollView>
            <View style={tw`absolute bottom-0 left-0 right-0 flex-row`}>
                <Button onPress={addToCart} buttonColor={"white"} textColor='black' style={tw`rounded-xl grow py-1 border-black border m-3`} icon={"cart-plus"} >
                    Add to Cart
                </Button>
            </View>
            {message && (
                <View style={tw`absolute inset-0 flex-1 justify-center items-center`}>
                    <Text style={tw`bg-slate-800 text-white p-4 rounded-md`}>{message}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
