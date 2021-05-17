import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  Image
} from 'react-native';
import { StackActions } from '@react-navigation/native';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import NetworkProvider from './NetworkProvider';
// const API_END_POINT = 'http://localhost:8081/';
const API_END_POINT = 'http://54.164.251.83:8081/';

const Login = ({navigation}) => {
    let [fontsLoaded] = useFonts({
        'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    });

    const [mobile, setMobile] = useState('');
    const otpMessage = 'A 4 digits OTP will send you via SMS to verify your mobile number !';
        
    const handleLogin = () => {
        const postData = {
            mobile
        };
        fetch(API_END_POINT + 'user/login', {
            method: 'post',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then((responseJson) => {
            if (responseJson.success) {
                const result = responseJson.data;
                navigation.dispatch({ ...StackActions.replace('OtpScreen', { mobile: mobile }) });
                //navigation.navigate('OtpScreen', { mobile: mobile });
            } else {
                Alert.alert("Alert", responseJson.message);
            }
        })
        .catch(error => Alert.alert("Alert", error));
    }

    const handleMobileChange = (value) => {
        if (/^\d+$/.test(value)  || (value =="")) {
            setMobile(value);
        }
    };
    if (!fontsLoaded) {
        return <AppLoading />;
    } else {
        return (
            <View style={styles.container}>
                <NetworkProvider />
                <View style={styles.logoContainer}>
                    <Image style={styles.logoContainerImg}  source = {require('../assets/login-logo.png')} />
                </View>
                <View style={styles.loginContainer}>
                    <View style={styles.loginLabelContainer}>
                        <Text style={styles.loginTextdir}>Proceed with your login</Text>
                        <Text style={styles.loginText}>Login</Text>
                    </View>
                    <View style={styles.mobileLabelContainerOuter}>
                        <View style={styles.mobileLabelContainer}>
                            <Image style={styles.enterMobile}  source = {require('../assets/enter-mobile-no-icon-box.png')} />
                            <View style={styles.MobileipOuter} >
                                <Text style={styles.mobileText}>Enter Mobile Number</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputContainerText}>+91</Text>
                                    <TextInput style={styles.inputs}
                                        keyboardType="numeric"
                                        maxLength={10}
                                        underlineColorAndroid='transparent'
                                        onChangeText={(text) => handleMobileChange(text)}
                                        value={mobile}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                
        
                    <View style={styles.otpMessageContainer}>
                        <Text style={styles.otpText}>{otpMessage}</Text>
                    </View>

                    <TouchableHighlight style={styles.buttonContainer} onPress={(e) => {handleLogin();}}>
                        <Text style={styles.sendOtpText}> Send OTP</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
};
    
const styles = StyleSheet.create({
    MobileipOuter:{
        display:'flex',
        flex:1,
        paddingLeft:20,
        borderLeftColor:'#0000001F',
        borderLeftWidth:2,
        marginLeft:10,       
    },
    mobileLabelContainerOuter:{
        shadowColor: '#00000014',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 11,
        elevation: 2,
        marginLeft:20,
        marginRight:20,
        display:'flex',
        alignItems:'center',
        backgroundColor:'#fff'
      
    },
    mobileLabelContainer:{
        flexDirection:'row',
        paddingTop:15,
        paddingBottom:15,
        alignItems:'center',          
    },
    enterMobile:{
        width:60,
        height:60,
        marginLeft:10,
        marginRight:10,
        alignItems:'center',
        alignContent:'center',
        justifyContent:'center',     
    },
    container: {
        flex: 1,
        backgroundColor: '#0C509C78',
        width: '100%'
    },
    logoContainer: {
        height: '25%',
        alignItems:'center',
        justifyContent:'center',
        marginTop:40,
        marginBottom:20
    },
    logoContainerImg:{
       height:'80%',
       aspectRatio:1.1538
    },
    loginContainer: {
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 60,
        height: '75%'
    },
    loginLabelContainer: {
        marginBottom: 20,
        marginTop: 40,
        marginLeft: 20
    },
    loginText: {
        color: '#000000',
        fontSize: 25,
        fontFamily: 'Montserrat-SemiBold',
        textDecorationLine: 'underline'
    },

    mobileText: {
        fontSize: 14,
        color: '#ADADAD',
        fontFamily:'Montserrat-Regular'
    },
    otpMessageContainer: {
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 20,
        marginRight: 20
    },
    otpText: {
        fontSize: 14,
        color: '#707070',
        fontFamily:'Montserrat-Regular'
    },
    inputContainer: {
        width: '100%',
        height: 35,
        display:'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent:'center',           
    },
    inputContainerText:{
        textAlignVertical: 'center',
        fontSize:18,
        fontFamily:'Montserrat-Medium',
        marginRight:5,
        color:'#ADADAD'
    },
    inputs:{
        height: 35,
        marginRight: 15,
        fontSize:18,
        flex:1,
        fontFamily:'Montserrat-Medium'
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 150,
        borderRadius: 30,
        marginLeft: 20,
        backgroundColor: "#0C509C"
    },
    sendOtpText: {
        color: 'white',
        fontSize: 16,
        fontFamily:'Montserrat-Medium'
    },
    loginTextdir:{
        fontSize:16,
        color:'#404040',
        marginBottom:9,
        fontFamily:'Montserrat-Regular',
    }
});

export default Login;