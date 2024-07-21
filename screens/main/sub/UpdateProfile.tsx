import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { ParamListBase, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Button, Card, TextInput } from 'react-native-paper';
import tw from 'twrnc';
import { endpoint, storage } from '../../../App';

interface User {
    username: string;
    email: string;
    address: string;
    contact: string;
}

export default function UpdateProfile() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const [user, setUser] = useState<User>();
    const userId = storage.getString('userId');
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");

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

    const ProfileUpdate = async () => {
        const response = await fetch(`${endpoint}/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact, address })
        });

        if (!response.ok) {
            Alert.alert(`Please try again`);
            return;
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <Appbar.Header style={tw`bg-black`} elevated>
                <Appbar.Action icon="chevron-left" size={30} onPress={() => navigation.goBack()} color='white' />
                <Appbar.Content titleStyle={tw`font-bold text-white`} title="Complete your profile" />
            </Appbar.Header>
            <View style={tw`flex-1 p-4`}>
                <Text style={tw`font-bold text-xl text-center text-[#36454F]`}>Profile Information</Text>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Username:</Text>
                    <Text style={tw`text-gray-700`}>{user?.username}</Text>
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Email:</Text>
                    <Text style={tw`text-gray-700`}>{user?.email}</Text>
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Contact:</Text>
                    <TextInput
                        mode='outlined'
                        // label="Email"
                        value={contact}
                        onChangeText={text => setContact(text)}
                        activeOutlineColor='black'
                        style={tw`font-semibold text-sm h-10 mt-2`}
                    />
                </View>
                <View style={tw`mt-4`}>
                    <Text style={tw`font-semibold text-base text-[#36454F]`}>Address:</Text>
                    <TextInput
                        mode='outlined'
                        // label="Email"
                        value={address}
                        onChangeText={text => setAddress(text)}
                        activeOutlineColor='black'
                        style={tw`font-semibold text-sm h-10 mt-2`}
                    />
                </View>
            </View>
            <Button
                onPress={ProfileUpdate}
                mode="outlined"
                theme={{ colors: { outline: 'black' } }}
                textColor="black"
                buttonColor='#0000001A'
                style={tw`m-4 rounded-md`}>
                Save Profile
            </Button>
        </SafeAreaView>
    );
}
