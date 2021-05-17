import React,{ useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert,
  Image,
  Platform
} from 'react-native';

import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
  } from 'react-native-confirmation-code-field';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo'
import { saveUserToken } from './Storage';
import { StackActions } from '@react-navigation/native';
import NetworkProvider from './NetworkProvider';
const CELL_COUNT = 4;
// const API_END_POINT = 'http://localhost:8081/';
const API_END_POINT = 'http://54.164.251.83:8081/';

const OtpScreen = ({ route, navigation }) => {
    let [fontsLoaded] = useFonts({
        'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    });
    const { mobile } = route.params;
    const [value, setValue] = useState('');
    const [otpSent, setOtpSent] = useState(true);
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const resendOtp = () => {
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
            }
            Alert.alert("Alert", responseJson.message);
        })
        .catch(error => Alert.alert("Alert", error));
    }

    const verifyOtp = async () => {
        const postData = {
            mobile: mobile,
            otp: value,
            deviceType: Platform.OS === 'android' ? 'A' : 'I',
            deviceToken: 'ACTUAL_DEVICETOKEN'
        };
        fetch(API_END_POINT + 'user/verifyotp', {
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
                                
                const { error, res } = saveUserToken(result.userToken).then(() => { 
                    if (result.isFirstTimeUser) {          
                        navigation.dispatch({ ...StackActions.replace('Profile') });                        
                    } else {
                        navigation.dispatch({ ...StackActions.replace('HomeScreen') });
                    }                     
                })
                .catch((err) => {
                    Alert.alert("Alert", 'Error occurred. Please try again.');
                    navigation.navigate('Login');
                });                
            } else {
                Alert.alert("Alert", responseJson.message);
            }
        })
        .catch(error => Alert.alert("Alert", error));
    }

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
                        <Text style={styles.loginText}>Verify with OTP</Text>
                    </View>
                    <View style={styles.otpContainer}>
                        <Text style={styles.otpText}>Enter OTP</Text>
                        <CodeField
                            ref={ref}
                            {...props}
                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({index, symbol, isFocused}) => (
                            <View
                                // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                                onLayout={getCellOnLayoutHandler(index)}
                                key={index}
                                style={[styles.cellRoot, isFocused && styles.focusCell]}>
                                
                                <Text style={styles.cellText} >
                                {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                            )}
                        />
                        {
                            otpSent && (
                                <Text style={styles.otpText} onPress={ () => resendOtp() }>Resend OTP</Text>
                            )
                        }
                    </View>                
        
                    <TouchableHighlight style={styles.buttonContainer} onPress={(e) => { verifyOtp(); }}>
                        <Text style={styles.sendOtpText}>Verify OTP</Text>
                    </TouchableHighlight>
                </View>
                <View style={styles.otpContainer}>
                    <Text style={styles.otpText}>Enter OTP</Text>
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({index, symbol, isFocused}) => (
                        <View
                            // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                            onLayout={getCellOnLayoutHandler(index)}
                            key={index}
                            style={[styles.cellRoot, isFocused && styles.focusCell]}>
                            <Text style={styles.cellText}>
                            {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        </View>
                        )}
                    />
                    {
                        otpSent && (
                            <Text style={styles.otpText} onPress={ () => resendOtp() }>Resend OTP</Text>
                        )
                    }
                </View>                
    
                <TouchableHighlight style={styles.buttonContainer} onPress={(e) => { verifyOtp(); }}>
                    <Text style={styles.sendOtpText}>Verify OTP</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

 
const styles = StyleSheet.create({
    modal:{
        backgroundColor:'#fff',
        marginLeft:'10%',
        marginRight:'10%',
        display:'flex',
        height:150,
        borderRadius:12,
        padding:20,
        justifyContent:'center',
        alignItems:'center'
    },
    modalText:{
        fontSize:18,
        fontFamily:'Montserrat-Bold'
    },
    root: {padding: 20, minHeight: 250},
    title: {textAlign: 'center', fontSize: 18},
    codeFieldRoot: {  
        width: 280,
        marginRight: 'auto',
        marginTop:15,
        marginBottom:25
    },
    cellRoot: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor:'#0C509C',
        borderRadius:20
    },
    cellText: {
        color: '#000',
        fontSize: 18,
        textAlign: 'center',
        fontFamily:'Montserrat-Medium',
        fontWeight:'400'
    },
    focusCell: {
        backgroundColor: '#0C509C',
        color:'#000'
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
        fontFamily:'Montserrat-SemiBold',
        textDecorationLine: 'underline'
    },

    otpContainer: {
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 20,
        marginRight: 20
    },
    otpText: {
        color: '#000000',
        textDecorationLine: 'underline',
        fontFamily:'Montserrat-Regular'  
    },

    inputs:{
        height: 35,
        marginRight: 15,
        fontSize:18,
        flex:1,
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

});

export default OtpScreen;

