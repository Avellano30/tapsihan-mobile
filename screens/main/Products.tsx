import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button, ScrollView, TouchableWithoutFeedback, Image, RefreshControl } from 'react-native';
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { Appbar, Badge, Card, Divider, IconButton, Searchbar } from 'react-native-paper';
import { endpoint, storage } from '../../App';

interface Products {
    _id: string;
    productName: string;
    description: string;
    price: number;
    stocks: number;
    image: string;
}

export default function Products() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [products, setProducts] = useState<Products[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getProduct = async () => {
        try {
            const response = await fetch(`${endpoint}/products`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getProduct();
    }, [navigation]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        getProduct();

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const filteredProducts = products.filter(product => product.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const productsList = filteredProducts.map((product) => (
        <View key={product._id} style={tw`w-full py-1`}>
            <TouchableWithoutFeedback onPress={() => navigation.push('ProductDetails', { product })}>
                <Card style={tw`bg-white rounded-none`}>
                    {/* <Card.Cover source={{ uri: `${product.image}` }} /> */}
                    <Divider />
                    <Card.Content style={tw`flex flex-row justify-between p-2`}>
                        <View style={tw`w-2/3`}>
                            <Text style={tw`text-[16px] text-black font-bold mt-1`}>{product.productName}</Text>
                            <Text style={tw`text-sm text-black`}>from ₱{product.price.toFixed(2)}</Text>
                            <Text style={tw`text-sm text-[#0000006A] mt-3`} numberOfLines={2}>{product.description}</Text>
                        </View>
                        <Image source={{ uri: `${product.image}` }} style={tw`h-[100px] w-[100px] rounded`} />
                    </Card.Content>
                </Card>
            </TouchableWithoutFeedback>
        </View>
    ));

    useFocusEffect(
        React.useCallback(() => {
            getProduct();
        }, [])
    );

    return (
        <SafeAreaView style={tw`flex-1`}>
            <Appbar.Header style={tw`bg-black`} elevated>
                <Appbar.Action icon="chevron-left" size={30} onPress={() => navigation.goBack()} color='white' />
                <Appbar.Content title={
                    <Searchbar
                        placeholder="Search"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={tw`bg-white rounded-xl mr-1 h-10 justify-center`}
                        inputStyle={{ textAlignVertical: 'top' }}
                    />
                }
                />
            </Appbar.Header>
            <ScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <View style={tw`flex-1 flex-col mb-2`}>
                    {productsList}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
