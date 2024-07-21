import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { CommonActions, ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Button, Text } from 'react-native-paper';
// Tailwind
import tw from 'twrnc';
// React Native Paper
import { TextInput } from 'react-native-paper';
import { endpoint, storage } from '../../App';

export default function Register() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleRegister = async () => {
        try {
            const response = await fetch(`${endpoint}/user/register`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            })

            if (!response.ok) {
                Alert.alert('Error occurred: Please try again')

                console.error("Failed to create new account");
                return;
            }

            // const data = await response.json();

            Alert.alert('New account created successfully')

            // Reset the navigation stack and navigate to the Main screen
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1`}>
            <Appbar.Header style={tw`bg-white`} >
                <Appbar.Action icon="chevron-left" size={30} onPress={() => navigation.goBack()} color='black' />
            </Appbar.Header>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsFocused(false); }}>
                <View style={tw`flex-1 p-10 justify-center bg-white`}>
                    <Text style={tw`text-center text-2xl tracking-widest text-black mb-4`}>Register</Text>
                    <TextInput
                        mode='outlined'
                        label="Username"
                        value={username}
                        textColor='black'
                        onChangeText={text => setUsername(text)}
                        outlineColor='black'
                        activeOutlineColor='black'
                        style={tw`bg-white`}
                        theme={{
                            colors: {
                                onSurfaceVariant: 'black'
                            }
                        }}
                    />
                    <TextInput
                        mode='outlined'
                        label="Email"
                        value={email}
                        textColor='black'
                        onChangeText={text => setEmail(text)}
                        outlineColor='black'
                        activeOutlineColor='black'
                        style={tw`bg-white my-2`}
                        theme={{
                            colors: {
                                onSurfaceVariant: 'black'
                            }
                        }}
                    />
                    <TextInput
                        mode='outlined'
                        label="Password"
                        value={password}
                        textColor='black'
                        onChangeText={text => setPassword(text)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        outlineColor='black'
                        activeOutlineColor='black'
                        secureTextEntry={!showPassword}
                        style={tw`bg-white`}
                        right={
                            isFocused && (
                                <TextInput.Icon icon={showPassword ? 'eye-outline' : 'eye-off-outline'} onPress={() => setShowPassword(!showPassword)} color={'white'} />
                            )
                        }
                        theme={{
                            colors: {
                                onSurfaceVariant: 'black'
                            }
                        }}
                    />
                    <Button
                        buttonColor='black'
                        textColor='white'
                        style={tw`rounded-[4px] mt-3 `}
                        onPress={handleRegister}
                    >
                        Sign Up
                    </Button>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
