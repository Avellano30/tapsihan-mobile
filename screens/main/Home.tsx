import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { ParamListBase, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Button, Card, Chip } from 'react-native-paper';
import tw from 'twrnc';
import { endpoint, storage } from '../../App';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface User {
    username: string;
    email: string;
    address: string;
    contact: string;
}

export default function Home() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

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

    useFocusEffect(
        React.useCallback(() => {
            getUserDetails();
        }, [])
    );

    const logout = () => {
        storage.delete('userId');
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <Appbar.Header style={tw`bg-black`} elevated>
                <Appbar.Content titleStyle={tw`font-bold text-white`} title="Home" />
                <Appbar.Action icon="logout" color='white' onPress={logout} />
            </Appbar.Header>
            <Text style={tw`mx-4 mt-4 font-bold text-sm tracking-wider`}>USER INFO</Text>
            {(!user?.contact && !user?.address) && (
                <Chip
                    icon={() => (
                        <MaterialCommunityIcons name="information" size={20} color="#000000" />
                    )}
                    onPress={() => navigation.navigate("UpdateProfile")}
                    style={tw`bg-[#0000002A] mx-4 mt-4`}
                >
                    <Text style={tw`text-black`}>Please complete your profile. Click me!</Text>
                </Chip>
            )}
            <View style={tw`p-4 m-4 bg-white border-2 rounded`}>
                <View style={tw``}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Username:</Text>
                    <Text style={tw`text-gray-700`}>{user?.username}</Text>
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Email:</Text>
                    <Text style={tw`text-gray-700`}>{user?.email}</Text>
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Contact:</Text>
                    <Text style={tw`text-gray-700`}>{user?.contact}</Text>
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Address:</Text>
                    <Text style={tw`text-gray-700`}>{user?.address}</Text>
                </View>
            </View>

            <Text style={tw`m-4 font-bold text-sm tracking-wider`}>NAVIGATION</Text>
            
            <View style={tw`flex-1 flex-row flex-wrap mb-2 mx-4 gap-1`}>
                <View style={tw`flex-1`}>
                    <TouchableWithoutFeedback onPress={() => navigation.navigate('Products')}>
                        <Card style={tw`bg-white border-4 border-black`}>
                            <Card.Content style={tw`py-10 items-center`}>
                                <Text style={tw`text-[16px] text-black`}>Menu</Text>
                            </Card.Content>
                        </Card>
                    </TouchableWithoutFeedback>
                </View>

                <View style={tw`flex-1`}>
                    <TouchableWithoutFeedback onPress={() => navigation.navigate('Orders')}>
                        <Card style={tw`bg-white border-4 border-black`}>
                            <Card.Content style={tw`py-10 items-center`}>
                                <Text style={tw`text-[16px] text-black`}>Orders</Text>
                            </Card.Content>
                        </Card>
                    </TouchableWithoutFeedback>
                </View>

                <View style={tw`flex-1`}>
                    <TouchableWithoutFeedback onPress={() => navigation.navigate('CartItems')}>
                        <Card style={tw`bg-white border-4 border-black`}>
                            <Card.Content style={tw`py-10 items-center`}>
                                <Text style={tw`text-[16px] text-black`}>Cart</Text>
                            </Card.Content>
                        </Card>
                    </TouchableWithoutFeedback>
                </View>


            </View>
        </SafeAreaView>
    );
}
