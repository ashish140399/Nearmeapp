import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  Dimensions,
  Alert,
  ScrollView,
  Picker
} from 'react-native';
import { getUserToken } from './Storage';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import * as ImagePicker from 'expo-image-picker';
import { StackActions } from '@react-navigation/native';
import NetworkProvider from './NetworkProvider';
// const API_END_POINT = 'http://localhost:8081/';
const API_END_POINT = 'http://54.164.251.83:8081/';

const Profile = ({ navigation }) => {
   
    let [fontsLoaded] = useFonts({
        'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-Light': require('../assets/fonts/Montserrat-Light.ttf'),
    });
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profession, setProfession] = useState('java');
    const [photo, setPhoto] = useState('');
    const [professions, setProfessions] = useState([]);

    const screenWidth = Math.round(Dimensions.get('window').width);
    const getProfessions = () => {
        fetch(API_END_POINT + "profession/list")
            .then(response => response.json())
            .then((responseJson) => {
                setTimeout(() => {
                    setProfessions(responseJson.data);
                }, 500);
            })
            .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
    }

    const getProfile = (userToken) => {
        fetch(API_END_POINT + "user/profile", {
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': userToken
                }
            })
            .then(response => response.json())
            .then((responseJson) => {
                setTimeout(() => {
                    const userDetail = responseJson.data;
                    setFirstName(userDetail.firstName);
                    setLastName(userDetail.lastName);
                    setEmail(userDetail.email);
                    setProfession(userDetail.profession);
                    if (userDetail.image && userDetail.image != '') {
                        setPhoto(userDetail.image);
                    }
                }, 500);
            })
            .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
    }

    const getUserAuthToken = () => {
        getUserToken().then((res) => {
            getProfile(res);            
        })
        .catch((err) => {
            Alert.alert("Alert", 'Error occurred. Please try again.');
            navigation.navigate('Login');
        });
    }

    const saveProfile = () => {
        const postData = {
            firstName,
            lastName,
            email,
            profession
        };
        getUserToken().then((token) => {
            fetch(API_END_POINT + 'user/profile', {
                method: 'put',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(postData)
            })
            .then(response => response.json())
            .then((responseJson) => {
                if (responseJson.success) {
                    const result = responseJson.data;
                    navigation.dispatch({ ...StackActions.replace('HomeScreen') }); 
                } else {
                    Alert.alert("Alert", responseJson.message);
                }
            })
            .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
        });
    }

    const saveProfileImage = (image) => {
        const postData = {
            image
        };
        getUserToken().then((token) => {
            fetch(API_END_POINT + 'user/profileimageupload', {
                method: 'put',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': token
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
            .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
        });
    }

    useEffect(() => {
        if (professions.length === 0) {
            getProfessions();
        }
    }, [professions]);

    useEffect(() => {
        if(professions.length > 0) {
            getUserAuthToken();
        }
    }, [professions]);

    const handleChange = (field, value) => {
        switch(field) {
            case 'firstName':
                setFirstName(value);
                return true;
            case 'lastName':
                setLastName(value);
                return true;
            case 'email':
                setEmail(value);
                return true;
            case 'profession':
                setProfession(value);
                return true;
            default:
                return true;
        }
    };

    _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
                base64: true,
                exif: true
            });
            if (!result.cancelled) {
                setPhoto(result.base64);  
                saveProfileImage(result.base64);       
            }
        } catch (e) {
          console.log(e);
        }
    };
     
    if (!fontsLoaded) {
        return <AppLoading />;
    } else {  
        return (
            <View  style={styles.container}>
                <NetworkProvider />
                <View style={styles.logoContainer}>
                    <Text style={styles.profileText}>Profile Setup</Text>
                </View>
                
                <View style={styles.profileContainer}>
                
                    <View style={{ top:-60, paddingLeft: ((screenWidth/2) - 77) }}>
                        {
                            photo === '' && (
                                <Image
                                    style={styles.profileImg} 
                                    source={require('../assets/Android/drawable-ldpi/unknownUser.jpg')}
                                />
                            )
                        }
                        {
                            photo !== '' && (
                                <Image
                                    style={styles.profileImg}
                                    source={{ uri: `data:image/png;base64,${photo}` }}                                   
                                />
                            )
                        }
                        <TouchableHighlight style={styles.profileEditImg}
                            style={[styles.profileEditImg, { left: ((screenWidth/2) + 45) } ]}
                            onPress={_pickImage}
                            underlayColor='none'
                            >
                             <Image source={require('../assets/Android/drawable-ldpi/edit-icon.png')}/>
                        </TouchableHighlight>
                    </View>
                    <ScrollView style={{top:-40}}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>First Name</Text>
                        <TextInput style={styles.inputs}
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            value={firstName}
                            onChangeText={(text) => handleChange('firstName', text)}/>
                    </View>

                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Last Name</Text>
                        <TextInput style={styles.inputs}
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            value={lastName}
                            onChangeText={(text) => handleChange('lastName', text)}/>
                    </View>

                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Email</Text>
                        <TextInput style={styles.inputs}
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            value={email}
                            onChangeText={(text) => handleChange('email', text)}/>
                    </View>

                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Profession</Text>
                        <Picker
                            selectedValue={profession}
                            style={styles.selectInputs}
                            onValueChange={(itemValue, itemIndex) => handleChange('profession', itemValue)}
                        >
                            <Picker.Item key="0" label="Select Profession" value="" />
                            {
                                professions.length > 0 && (
                                    professions.map((item) => {
                                        return <Picker.Item key={item._id} label={item.name} value={item._id} />
                                    })
                                )
                            }
                        </Picker>
                    </View>

                    <TouchableHighlight 
                        style={[styles.buttonContainer, { marginLeft: ((screenWidth/2) -111) } ]}
                        onPress={(e) => saveProfile()}>
                        <Text style={styles.updateProfileText}>Update Profile</Text>
                    </TouchableHighlight>
                    </ScrollView>
                </View>
                
            </View>
        );
    }
};
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C509C78',
        width: '100%'
    },
    logoContainer: {
        height: '25%',
        paddingTop:20
    },
    profileText: {
        fontSize: 22,
        paddingLeft: 15,
        color: '#FFFFFF',
        paddingTop: 15,
        fontFamily:'Montserrat-Medium'
    },
    profileContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '75%',
    },
    profileImg: {
        width: 144,
        height: 144,
        borderRadius:144
       
    },
    profileEditImg: {
        top: 75,
        width:35,
        height: 35,
        position: 'absolute'
    },
    labelContainer: {
        top: 0,
        margin: 15,
        padding: 10,
        marginBottom: 0,
        borderRadius: 3,
        height: 75,

        shadowColor: '#00000014',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 11,

        elevation: 2
    },
    labelText: {
        fontSize: 14,
        fontFamily:'Montserrat-Light',
        
    },
    inputs:{
        height: 50,        
        borderBottomWidth: 0,
        flex:1,
        fontSize: 18,
        fontFamily:'Montserrat-Medium',
        color:'#404040'
    },
    selectInputs: {
        height: 45,
        borderWidth: 0,
        flex: 1,
        // fontSize: 24,
        backgroundColor: '#FFFFFF',
        fontFamily:'Montserrat-Medium',
        fontSize: 18,
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',        
        width: 222,
        marginTop: 20,
        borderRadius: 30,        
        backgroundColor: "#0C509C"
    },
    updateProfileText: {
        color: 'white',
        fontSize: 16,
        fontFamily:'Montserrat-Medium'
    }
});

export default Profile;