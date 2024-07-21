import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Badge, Card, Chip, Divider, Icon } from 'react-native-paper';
import { formatInTimeZone } from 'date-fns-tz';
import { endpoint, storage } from '../../App';

interface ICartItem {
    _id: string;
    product: IProduct;
    quantity: number;
    status: string;
    paymentRef: string;
    updatedAt: string;
    mop: string;
}

interface ICart {
    _id: string;
    user: string;
    items: ICartItem[];
    status: string;
}

interface IProduct {
    _id: string;
    productName: string;
    description: string;
    price: number;
    stocks: number;
}

const Orders = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [cart, setCart] = useState<ICart | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const fetchUserCart = async () => {
        try {
            const userId = storage.getString('userId');
            const response = await fetch(`${endpoint}/cart/${userId}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error('Failed to fetch user cart:', error);
        }
    };

    fetchUserCart();

    useEffect(() => {
        fetchUserCart();
        const intervalId = setInterval(fetchUserCart, 3000); // fetch every 3 seconds

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'toship':
                return "To Pack";
            case 'delivery':
                return "Shipped";
            case 'completed':
                return "Completed";
            default:
                return '';
        }
    };

    const renderItem = (item: ICartItem) => (
        <Card key={item._id} style={tw`mb-3 bg-white rounded-md overflow-hidden`}>
            <View style={tw`flex flex-row-reverse px-4 bg-[#0000003A]`}>
                <Badge style={tw`bg-black top-2.5 left-4 absolute`} size={10}/>
                <Text style={tw`flex flex-row-reverse text-base text-black pt-1`}>{getStatusText(item.status)}</Text>
            </View>
            <View style={tw`flex px-4 pb-2`}>
                <Text style={tw`font-bold text-lg text-[#36454F]`}>{item.product.productName} x {item.quantity}</Text>
                <Text style={tw`font-bold text-lg text-[#36454F]`}>₱{(item.product.price * item.quantity).toFixed(2)}</Text>
                <Text style={tw`mt-2 text-[10px]`}>Date: {formatInTimeZone(new Date(item.updatedAt), 'Asia/Manila', "MMMM d, yyyy, hh:mm:ss a")}</Text>
                <Text style={tw`text-[10px]`}>Ref: {item.paymentRef}</Text>
                <Text style={tw`text-[10px]`}>Mode of Payment: {item.mop}</Text>
            </View>
        </Card>
    );

    const renderItems = (status: string) => (
        cart?.items
            .filter(item => item.status === status)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map(item => renderItem(item))
    );

    const renderAllItems = () => (
        cart?.items
            .filter(item => item.status !== "cart")
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map(item => renderItem(item))
    );

    const handleChipPress = (status: string) => {
        setFilter(status);
    };
    const getChipStyle = (status: string) => {
        return filter === status ? 'bg-[#0000002A] border-black border text-orange-500' : 'bg-white border';
    };
    return (
        <SafeAreaView style={tw`flex-1`}>
            <Appbar.Header style={tw`bg-black`} elevated>
                <Appbar.Action icon="chevron-left" size={30} onPress={() => navigation.goBack()} color='white' />
                <Appbar.Content titleStyle={tw`font-bold text-white`} title="Orders" />
            </Appbar.Header>
            <ScrollView>
                <View style={tw`flex-1 p-4`}>
                    <View style={tw`flex-row justify-around mb-4 gap-4`}>
                        <Chip mode="flat" style={tw`${getChipStyle('all')}`} onPress={() => handleChipPress('all')}>
                            All
                        </Chip>
                        <Chip mode="flat" style={tw`${getChipStyle('toship')}`} onPress={() => handleChipPress('toship')}>
                            To Ship
                        </Chip>
                        <Chip mode="flat" style={tw`${getChipStyle('delivery')}`} onPress={() => handleChipPress('delivery')}>
                            To Receive
                        </Chip>
                        <Chip mode="flat" style={tw`${getChipStyle('completed')}`} onPress={() => handleChipPress('completed')}>
                            Completed
                        </Chip>
                    </View>
                    {cart && cart.items.length > 0 ? (
                        filter === 'all' ? renderAllItems() : renderItems(filter)
                    ) : (
                        <Text>No orders</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Orders;
