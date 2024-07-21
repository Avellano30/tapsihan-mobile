import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, Image, TouchableWithoutFeedback } from 'react-native';
import { ParamListBase, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Button, Card, Divider, HelperText, Icon, IconButton, List, Modal, Portal, TextInput } from 'react-native-paper';
import tw from 'twrnc';
import { endpoint, storage } from '../../../App';

//@ts-ignore
import Gcash from '../../assets/qr.png';

interface ICartItem {
    _id: string;
    product: IProduct;
    quantity: number;
    status: string;
    paymentRef: string;
}

interface ICart {
    _id: string;
    user: string;
    items: ICartItem[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

interface IProduct {
    _id: string;
    productName: string;
    description: string;
    price: number;
    stocks: number;
    image: string;
}

interface User {
    username: string;
    email: string;
    address: string;
    contact: string;
}

export default function CartItems() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [cart, setCart] = useState<ICart | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [referenceNumber, setReferenceNumber] = useState<string>('');
    const [user, setUser] = useState<User>();
    const userId = storage.getString('userId');

    const getUserDetails = async () => {
        try {
            const response = await fetch(`${endpoint}/user/${userId}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch user's cart on component mount and update total
    useFocusEffect(
        React.useCallback(() => {
            const fetchUserCart = async () => {
                try {
                    const response = await fetch(`${endpoint}/cart/${userId}`);

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    setCart(data);
                    updateTotal(data); // Update total when cart data changes

                } catch (error) {
                    console.error('Failed to fetch user cart:', error);
                }
            };

            fetchUserCart();
            getUserDetails();
        }, [])
    );

    // Update total whenever cart items change
    useEffect(() => {
        updateTotal(cart);
    }, [cart]);

    const updateTotal = (cart: ICart | null) => {
        if (cart) {
            let totalPrice = 0;
            cart.items.forEach(item => {
                if (item.status === 'cart') {
                    totalPrice += item.product.price * item.quantity;
                }
            });
            setTotal(totalPrice);
        } else {
            setTotal(0);
        }
    };

    const updateQuantity = async (itemId: string, change: number) => {
        if (cart) {
            const item = cart.items.find(item => item._id === itemId);
            if (!item) return;

            const newQuantity = item.quantity + change;

            if (newQuantity > item.product.stocks) {
                Alert.alert(`Remaining Stocks: ${item.product.stocks}`);
                return;
            }

            const updatedCart = {
                ...cart,
                items: cart.items.map(item =>
                    item._id === itemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            };

            try {
                const response = await fetch(`${endpoint}/cart/item/quantity`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: updatedCart.user,
                        itemId,
                        quantity: newQuantity,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setCart(data);

            } catch (error) {
                console.error('Failed to update product quantity in cart:', error);
            }
        }
    };


    const checkout = async () => {
        const cartItems = cart?.items.filter(item => item.status === 'cart');
        const itemIds = cartItems?.map(item => ({ itemId: item._id }));

        if (selectedPaymentMethod === "Choose payment method") {
            Alert.alert('Please select payment method');
            return;
        }

        if (!user?.contact && !user?.address) {
            Alert.alert("Profile Information Needed", "To ensure smooth shipping, please complete your address and contact details.");
            navigation.navigate("UpdateProfile");
            return;
        }

        if (itemIds?.length === 0) {
            Alert.alert("No items in your cart", "Please add items to your cart before you checkout.");
            return;
        }

        try {
            if (selectedPaymentMethod === "Cash on Delivery") {
                Alert.alert(
                    "Confirm Checkout",
                    "Are you sure you want to proceed with the checkout?",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "OK",
                            onPress: async () => {
                                try {
                                    const response = await fetch(`${endpoint}/cart/status`, {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            userId: userId,
                                            items: itemIds,
                                            paymentRef: "N/A",
                                            mop: selectedPaymentMethod
                                        }),
                                    });

                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }

                                    const data = await response.json();
                                    setCart(data);

                                    Alert.alert("Order placed", "Payment successful");
                                    navigation.replace("Orders");
                                } catch (error) {
                                    console.error('Failed to checkout:', error);
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }


            if (selectedPaymentMethod === "GCash") {
                if (!visible) {
                    showModal();
                    return;
                }


                if (visible) {
                    if (hasErrors()) {
                        return;
                    }

                    try {
                        const response = await fetch(`${endpoint}/cart/status`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                userId: userId,
                                items: itemIds,
                                paymentRef: referenceNumber,
                                mop: selectedPaymentMethod
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const data = await response.json();
                        setCart(data);

                        Alert.alert("Order placed", "Payment successful");
                        navigation.replace("Orders");
                        return;
                    } catch (error) {
                        console.error('Failed to checkout:', error);
                    }
                }

            }
        } catch (error) {
            console.log(error);
        }
    };

    const [expanded, setExpanded] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Choose payment method");

    const handlePress = () => setExpanded(!expanded);

    const handleItemPress = (paymentMethod: string) => {
        setSelectedPaymentMethod(paymentMethod);
        setExpanded(false);
    };

    const [visible, setVisible] = React.useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    const hasErrors = () => {
        const containsLetters = /[a-zA-Z]/.test(referenceNumber);
        const containsWhitespace = /\s/.test(referenceNumber);
        const validPattern = /^\d01\d{10}$/.test(referenceNumber);
        return !validPattern || containsLetters || containsWhitespace || referenceNumber.length !== 13;
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <Appbar.Header style={tw`bg-black`} elevated>
                <Appbar.Action icon="chevron-left" size={30} onPress={() => navigation.goBack()} color='white' />
                <Appbar.Content titleStyle={tw`font-bold text-white`} title="Cart" />
            </Appbar.Header>
            <ScrollView>
                <View style={tw`flex-1 p-4`}>
                    {cart && cart.items.length > 0 ? (
                        cart.items.filter(item => item.status === "cart").length > 0 ? (
                            cart.items.filter(item => item.status === "cart").map(item => (
                                <TouchableWithoutFeedback key={item._id} onPress={() => navigation.push('ProductDetails', { product: item.product })}>
                                    <Card style={tw`my-2 p-4 bg-white rounded-md`}>
                                        <View style={tw`flex-row justify-between items-center`}>
                                            <View style={tw`flex-row items-center w-1/2`}>
                                                <Image src={item.product.image} style={tw`h-[40px] w-[40px] mr-4`} />
                                                <View style={tw`flex`}>
                                                    <Text style={tw`font-bold text-base text-black`}>{item.product.productName}</Text>
                                                    <Text style={tw`text-base text-black`}>₱{item.product.price.toFixed(2)}</Text>
                                                </View>
                                            </View>

                                            <View style={tw`flex-row items-center`}>
                                                <IconButton
                                                    icon="minus"
                                                    size={20}
                                                    onPress={() => updateQuantity(item._id, -1)}
                                                    style={tw``}
                                                />
                                                <Text style={tw`mx-2`}>{item.quantity}</Text>
                                                <IconButton
                                                    icon="plus"
                                                    size={20}
                                                    onPress={() => updateQuantity(item._id, 1)}
                                                    style={tw``}
                                                />
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableWithoutFeedback>
                            ))
                        ) : (
                            <Text>No items in the cart</Text>
                        )
                    ) : (
                        <Text>No items in the cart</Text>
                    )}
                </View>
            </ScrollView>

            <List.Section style={tw`bg-white border-b border-black`}>
                <List.Accordion
                    title={<Text style={tw`text-black`}>Payment Method</Text>}
                    left={() => (
                        <View style={tw`justify-center ml-2`}>
                            <Icon source="currency-php" size={15} />
                        </View>
                    )}
                    right={() => (
                        <View style={tw`flex-row items-center`}>
                            {selectedPaymentMethod && <Text style={tw`mr-2`}>{selectedPaymentMethod}</Text>}
                            <Icon source="chevron-right" size={20} />
                        </View>
                    )}
                    expanded={expanded}
                    onPress={handlePress}
                    style={tw`bg-white text-white border-t border-black bg-[#0000001A] p-0`}
                    rippleColor={"#0000001A"}
                >
                    <List.Item title="Cash on Delivery" onPress={() => handleItemPress("Cash on Delivery")} right={() => selectedPaymentMethod === "Cash on Delivery" && <Icon source="check" size={20} />} />
                    <Divider />
                    <List.Item title="GCash" onPress={() => handleItemPress("GCash")} right={() => selectedPaymentMethod === "GCash" && <Icon source="check" size={20} />} />
                </List.Accordion>
            </List.Section>

            <View style={tw`flex-row justify-between items-center bg-white mx-4`}>
                <Text style={tw`font-bold text-lg text-black`}>Total:</Text>
                <Text style={tw`font-bold text-lg text-black`}>₱{total.toFixed(2)}</Text>
            </View>
            <Button onPress={checkout} mode="contained" buttonColor="black" textColor="white" style={tw`py-2 m-3 rounded-lg`}>
                Place Order
            </Button>

            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={tw`bg-white p-5 mx-12 rounded-lg items-center`}>
                    {hasErrors() && <HelperText type="error" style={tw`text-red-600`}>
                        Enter a valid Reference Number
                    </HelperText>}
                    <Image source={Gcash} style={tw`h-[250px] w-[250px]`} />
                    <TextInput
                        mode='outlined'
                        label='Reference Number'
                        value={referenceNumber}
                        onChangeText={text => setReferenceNumber(text)}
                        textColor='black'
                        outlineColor='black'
                        activeOutlineColor='black'
                        style={tw`bg-white w-[230px]`}
                        theme={{
                            colors: {
                                onSurfaceVariant: 'black'
                            }
                        }}
                    />
                    <Button onPress={checkout} mode="contained" buttonColor="black" textColor="white" style={tw`mt-3 w-[230px] rounded-lg`}>
                        Confirm
                    </Button>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}
