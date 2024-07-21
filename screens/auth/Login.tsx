import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Keyboard, TouchableWithoutFeedback, Alert, Image } from 'react-native';
import { CommonActions, ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, Button, Text } from 'react-native-paper';
// Tailwind
import tw from 'twrnc';
// React Native Paper
import { TextInput } from 'react-native-paper';
import { endpoint, storage } from '../../App';

//@ts-ignore
import logo from '../assets/tapsihan_logo.png';

export default function Login() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${endpoint}/user/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) {
                Alert.alert('Invalid email or password')

                console.error("Failed to login");
                return;
            }

            const data = await response.json();

            storage.set('userId', data._id);

            // Reset the navigation stack and navigate to the Main screen
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                })
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1`}>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsFocused(false); }}>
                <View style={tw`flex-1 p-4 justify-center bg-white`}>
                    <View style={tw`flex-1 justify-center items-center`}>
                        <Image source={logo} style={tw`w-[60] h-[60]`} />
                    </View>
                    <TextInput
                        mode='outlined'
                        label='Email'
                        value={email}
                        onChangeText={text => setEmail(text)}
                        textColor='black'
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
                        label='Password'
                        value={password}
                        onChangeText={text => setPassword(text)}
                        textColor='black'
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        outlineColor='black'
                        activeOutlineColor='black'
                        secureTextEntry={!showPassword}
                        style={tw`bg-white mt-2`}
                        right={
                            isFocused && (
                                <TextInput.Icon icon={showPassword ? 'eye-outline' : 'eye-off-outline'} onPress={() => setShowPassword(!showPassword)} color={'black'} />
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
                        style={tw`rounded-[4px] mt-3`}
                        onPress={handleLogin}
                    >
                        Sign In
                    </Button>
                    <View style={tw`flex-row justify-center mt-4`}>
                        <Text style={tw`mr-2`}>Don't have an account yet?</Text>
                        <Text onPress={() => navigation.navigate('Register')} style={tw`font-bold underline`}>Sign Up</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>

        </SafeAreaView>
    );
}
