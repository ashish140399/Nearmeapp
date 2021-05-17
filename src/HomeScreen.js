import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { getUserToken } from './Storage';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import MapView, { Marker } from 'react-native-maps';
import NetworkProvider from './NetworkProvider';
// const API_END_POINT = 'http://localhost:8081/';
const API_END_POINT = 'http://54.164.251.83:8081/';

const screenHeight = Math.round(Dimensions.get('window').height);

const HomeScreen = ({navigation}) => {
     let [fontsLoaded] = useFonts({
        'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-Light': require('../assets/fonts/Montserrat-Light.ttf'),
    });
    const [users, setUsers] = useState([]);
    const [location, setLocation] = useState({});
    const [isFetched, setIsFetched] = useState(false);
    const [btnActive, setbtnActive] = useState({ active: 0 });
    const [btnActivebtm, setbtnActivebtm] = useState({ active: 0 });
    const [professions, setProfessions] = useState([]);
    const [photo, setPhoto] = useState('');
    const [city, setCity] = useState('');
    const [userToken, setUserToken] = useState('');
    let nearMeUserInterval = () => {};

    const getUserLocation = (locationDetail) => { 
        const apiKey = 'AIzaSyCMNhHBlIGZXXD4EQ_zfmA5yAbZS2Yf0TI';
        const lat = locationDetail.coords.latitude;
        const long = locationDetail.coords.longitude;
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${lat},${long}&key=${apiKey}`)
            .then((response) => response.json())
            .then((json) => {
                //console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(json.results[0].address_components[4].long_name));
                const address = json.results[0].address_components[4].long_name; // json.results[0].address_components[1].long_name + ', ' + 
                setCity(address);
            });
    }

    const getNearByUsers = (userToken, locationDetail) => {
        fetch(API_END_POINT + "user/nearbyusers", {
            method: 'post',
            headers: {
                'Content-Type':'application/json',
                'Authorization': userToken
            },
            body: JSON.stringify({
                latitude: locationDetail.coords.latitude,
                longitude: locationDetail.coords.longitude
            })
        })
        .then(response => response.json())
        .then((responseJson) => {
            const nearByUsers = responseJson.data;
            setUsers(nearByUsers);
            setIsFetched(true);
        })
        .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
    }

    const setUserInterval = (userToken) => {
        nearMeUserInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                position => {                                
                    const locationDetail = position;   
                    setLocation(locationDetail);   
                    setTimeout(() => {                                
                        getNearByUsers(userToken, locationDetail);  
                        getUserLocation(locationDetail);                                 
                        setUserToken(userToken);                                
                    }, 500);
                
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }, 60000);
    }

    const clearUserInterval = () => {
        clearInterval(nearMeUserInterval);
    }

    const findCoordinates = (userToken) => {
		navigator.geolocation.getCurrentPosition(
			position => {
                const locationDetail = position;
                setLocation(locationDetail);
                setTimeout(() => {
                    getNearByUsers(userToken, locationDetail);  
                    getUserLocation(locationDetail);
                    setUserToken(userToken);
                }, 500);

                setTimeout(() => {
                    setUserInterval(userToken);
                }, 1500);
			},
			error => Alert.alert(error.message),
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);
    };

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
                    if (userDetail.image && userDetail.image != '') {
                        setPhoto(userDetail.image);
                    }
                }, 500);
            })
            .catch(error => Alert.alert("Alert", 'Error occurred. Please try again.'));
    }

    const getUserAuthToken = () => {
        getUserToken().then((res) => {
            findCoordinates(res);  
            setTimeout(() => {
                getProfile(res);    
            }, 700);       
        });
    }

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

    const timeSince = (date) => {

        var seconds = Math.floor((new Date() - date) / 1000);
      
        var interval = Math.floor(seconds / 31536000);
      
        if (interval > 1) {
          return interval + " years ago";
        }
        interval = Math.floor(seconds / 2592000);

        if (interval > 1) {
          return interval + " months ago";
        }
        interval = Math.floor(seconds / 86400);

        if (interval > 1) {
          return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);

        if (interval > 1) {
          return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);

        if (interval > 1) {
          return interval + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }

    const getProfessionById = (id) => {        
        const userProfession = professions.filter((profession) => profession._id === id);
        return userProfession ? userProfession[0].name : 'null';
    }

    const convertToKM = (distance) => {
        return distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance/1000).toFixed(2)} km`;
    }

    const onTabChanged = (tab) => {
        setbtnActive({ active: tab });
        if (tab === 0) {
            getNearByUsers(userToken, location);
        }
    }

    
    useEffect(() => {
        if (professions.length === 0) {
            getProfessions();
        }
    }, [professions]);

    useEffect(() => {
        if(professions.length > 0 && users.length === 0 && !isFetched) {
            getUserAuthToken();
        }
    }, [professions, users]);
  
    return (
        <View style={styles.container}>
            <NetworkProvider />
            <View style={styles.homeNav}>
                <View style={styles.navLeft}>
                    <View style={styles.profileNav}>
                        {
                            (photo !== '') && (
                                <Image
                                    style={styles.profileNavImg}
                                    source={{ uri: `data:image/png;base64,${photo}` }}
                                />
                            )
                        }
                        {
                            (photo === '') && (
                                <Image
                                    style={styles.profileNavImg}
                                    source={require('../assets/Android/drawable-ldpi/unknownUser.jpg')}
                                />
                            )
                        }
                        <Image
                            style={styles.navMenuIconBox}
                            source={require('../assets/Android/drawable-ldpi/menu-icon-box.png')}
                        />
                    </View>
                    <View style={styles.navLocation}>
                        <Image
                            style={styles.navLocationIcon}
                            source={require('../assets/Android/drawable-ldpi/location-icon.png')}
                        />
                        <Text  style={styles.navLocationName}>{city}</Text>
                    </View>
                </View>
                <View style={styles.navRight}>
                    <View style={styles.navNotificationsOuter}>
                        <Image
                            style={styles.navNotifications}
                            source={require('../assets/Android/drawable-ldpi/notification.png')}
                        />
                        <Text style={styles.navNotificationsNumber}>5</Text>
                    </View>
                    <Image
                        style={styles.navRightLocation}
                        source={require('../assets/Android/drawable-ldpi/right-location-icon.png')}
                    />
                    
                </View>
            </View>
            <View style={styles.homeNavBelow}>
                <TouchableOpacity
                    onPress={(e) => { onTabChanged(0) }}                    
                    style={btnActive.active === 0 ? styles.homeNavBelowBtn : styles.homeNavBelowBtnunpress }
                >
                    <Text style={btnActive.active === 0 ? styles.homeNavBelowBtnText : styles.homeNavBelowBtnTextPressed }>Nearby Users ({users.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={(e) => { onTabChanged(1) }}                    
                    style={btnActive.active === 1 ? styles.homeNavBelowBtn : styles.homeNavBelowBtnunpress }
                >
                    <Text style={btnActive.active === 1 ? styles.homeNavBelowBtnText : styles.homeNavBelowBtnTextPressed }>See On Map</Text>
                </TouchableOpacity>
                
            </View>
            <View style={styles.homeSectionBox}>
                <ScrollView>
                    {
                        btnActive.active === 0 && (
                            <View>
                                {
                                    users.length > 0 && (
                                        users.map((user, index) =>  {
                                            return (                      
                                                <View style={styles.nearbyUserBox} key={`box-${index}`}>
                                                    <View style={styles.nearbyUserImageBxOuter}>
                                                        {
                                                            (user.image && user.image !== '') && (
                                                                <Image
                                                                    key={`image-${index}`}
                                                                    style={styles.nearbyUserBoxImg}
                                                                    source={{ uri: `data:image/png;base64,${user.image}` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            (!user.image || user.image === '') && (
                                                                <Image
                                                                    key={`unknown-image-${index}`}
                                                                    style={styles.nearbyUserBoxImg}
                                                                    source={require('../assets/Android/drawable-ldpi/unknownUser.jpg')}
                                                                />
                                                            )
                                                        }
                                                        <View key={`user-info-${index}`}>
                                                            <Text style={styles.nearbyUserBoxName}>
                                                                {user.firstName} {user.lastName}
                                                            </Text>
                                                            {
                                                                user.profession && (
                                                                    <Text style={styles.nearbyUserBoxProfession}>
                                                                        {getProfessionById(user.profession)}
                                                                    </Text>
                                                                )
                                                            }
                                                            <Text style={styles.nearbyUserBoxDistance}>{convertToKM(user.distance)}</Text>
                                                            <Text style={styles.nearbyUserBoxUpdate}>
                                                                { `Last Update ${timeSince(new Date(user.lastActivityAt).getTime())}` }
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Image
                                                        style={styles.nearbyUserBoxNavigateRight}
                                                        source={require('../assets/Android/drawable-ldpi/message-box.png')}
                                                    />   
                                                </View>
                                            )
                                        }) 
                                    )
                                }   
                                {
                                    users.length === 0 && (
                                        <View style={styles.nearbyUserBox}>
                                            <View style={styles.nearbyUserImageBxOuter}>
                                                <Text style={styles.noUserText}>No user found.</Text>
                                            </View>
                                        </View>
                                    )   
                                }  
                            </View>
                        )
                    }
                    {
                        btnActive.active === 1 && location.coords && (
                            <View style={styles.mapContainer}>
                                {
                                    
                                    <MapView
                                        zoomEnabled={true}
                                        style={{ height: screenHeight }}
                                        initialRegion={{
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                    >                                       
                                        <Marker 
                                            key={`you-marker`}
                                            coordinate={{
                                                latitude: location.coords.latitude,
                                                longitude: location.coords.longitude
                                            }}
                                        >
                                            <View style={styles.mapMarkerContainer}>
                                                <View style={styles.mapMarker}>
                                                    {
                                                        photo !== '' && (
                                                            <Image
                                                                key={`user-map-image`}
                                                                style={styles.mapMarkerUserImg}
                                                                source={{ uri: `data:image/png;base64,${photo}` }}
                                                            />
                                                        )
                                                    }
                                                    {
                                                        (photo === '') && (
                                                            <Image
                                                                key={`user-unknown-map-image`}
                                                                style={styles.mapMarkerUserImg}
                                                                source={require('../assets/Android/drawable-ldpi/unknownUser.jpg')}
                                                            />
                                                        )
                                                    }
                                                    <View key={`user-info`}>
                                                        <Text style={styles.mapMarkerUserInfo}>
                                                            You
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </Marker>

                                        {
                                            users.length > 0 && (
                                                users.map((user, mIndex) => (                                                    
                                                    <Marker 
                                                        key={`marker-${mIndex}`}
                                                        coordinate={{
                                                            latitude: user.location.coordinates[1],
                                                            longitude: user.location.coordinates[0]
                                                        }}
                                                    >
                                                        <View
                                                            key={`user-marker-container-${mIndex}`} 
                                                            style={styles.mapMarkerContainer}
                                                        >
                                                            <View style={styles.mapMarker}>
                                                                {
                                                                    user.image && user.image !== '' && (
                                                                        <Image
                                                                            key={`user-image-${mIndex}`}
                                                                            style={styles.mapMarkerUserImg}
                                                                            source={{ uri: `data:image/png;base64,${user.image}` }}
                                                                        />
                                                                    )
                                                                }
                                                                {
                                                                    (!user.image || user.image === '') && (
                                                                        <Image
                                                                            key={`user-unknown-image-${mIndex}`}
                                                                            style={styles.mapMarkerUserImg}
                                                                            source={require('../assets/Android/drawable-ldpi/unknownUser.jpg')}
                                                                        />
                                                                    )
                                                                }
                                                                <View>
                                                                    <Text style={styles.mapMarkerUserInfo}>
                                                                        {user.firstName}
                                                                    </Text>
                                                                    <Text style={styles.mapMarkerUserInfo}>
                                                                        {user.lastName}
                                                                    </Text>
                                                                    <Text style={styles.mapMarkerUserDistance}>
                                                                        {convertToKM(user.distance)}
                                                                    </Text>
                                                                </View> 
                                                            </View>
                                                        </View>
                                                    </Marker>
                                                ))
                                            )
                                        }
                                    </MapView>
                                }
                            </View>
                        )
                    }
                </ScrollView>        
            </View>
            <View style={styles.homeScreenBottom}>
                <TouchableOpacity 
                    onPress={() => {setbtnActivebtm({ active: 0 })}}                    
                    style={btnActivebtm.active === 0 ? styles.homeScreenBottomBox : styles.homeScreenBottomBoxPressed }
                >
                    <Image
                        style={styles.homeScreenBottomBoxImg}
                        source={require('../assets/Android/drawable-ldpi/nearby-icon.png')}
                    /> 
                    <Text>Nearby</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {setbtnActivebtm({ active: 1 })}}                    
                    style={btnActivebtm.active === 1 ? styles.homeScreenBottomBox : styles.homeScreenBottomBoxPressed }
                >
                    <Image
                        style={styles.homeScreenBottomBoxImg}
                        source={require('../assets/Android/drawable-ldpi/family-icon.png')}
                    /> 
                    <Text>Family</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {setbtnActivebtm({ active: 2 })}}                    
                    style={btnActivebtm.active === 2 ? styles.homeScreenBottomBox : styles.homeScreenBottomBoxPressed }
                >
                    <Image
                        style={styles.homeScreenBottomBoxImg}
                        source={require('../assets/Android/drawable-ldpi/family-icon.png')}
                    /> 
                    <Text>Organization</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
    
const styles = StyleSheet.create({
    homeNavBelowBtnunpress:{
        backgroundColor:'#F7F7F7',
        borderRadius:30,
        paddingTop:8,
        paddingBottom:8,
        paddingLeft:18,
        paddingRight:18,
        display:'flex'
    },
    homeScreenBottomBoxImg:{
        marginRight:5,
    },
    homeScreenBottomBox:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#ebebeb',
        borderRadius:30,
        paddingTop:10,
        paddingBottom:10,
        paddingRight:15,
        paddingLeft:15        
    },
    homeScreenBottomBoxPressed:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'transparent',
        borderRadius:30,
        paddingTop:10,
        paddingBottom:10,
        paddingRight:15,
        paddingLeft:15  
    },
    homeScreenBottom:{
        backgroundColor:'#fff',
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        paddingTop:15,
        paddingBottom:15,
        paddingLeft:10,
        paddingRight:10
    },
    nearbyUserBoxNavigateRight:{
        width:50,
        height:50,
        marginLeft:15
    },
    nearbyUserBoxUpdate:{
        fontSize:10,
        fontFamily:'Montserrat-Medium'
    },
    nearbyUserBoxProfession:{
        fontSize:14,
        fontFamily:'Montserrat-Medium'
    },
    nearbyUserBoxName:{
        fontSize: 18,
        fontFamily:'Montserrat-SemiBold'
    },
    nearbyUserBoxDistance:{fontFamily:'Montserrat-Medium'},
    nearbyUserBoxImg:{
        width:70,
        height:70,
        marginRight:20,
        marginTop:5,
        borderRadius:5
    },
    nearbyUserImageBxOuter:{
        display:'flex',
        flexDirection:'row'
    },
    nearbyUserBox:{
        display:'flex',
        flexDirection:'row',
        backgroundColor:'#fff',
        padding:10,
        justifyContent:'space-between',
        alignItems:'center',
        borderRadius:10,
        marginBottom:10
    },
    noUserText: {
        textAlign: 'center',
        color: 'red'
    },
    homeSectionBox:{
        backgroundColor:'#0C509C78',
        flex:1,
        padding:10
    },
    container: {
        flex:1,
        marginTop:40
        
    },
    mapContainer: {
        flex:1
    },
    mapView: {
        height: 300
    },

    mapMarkerContainer: {
        display:'flex',
        flexDirection:'row',
        backgroundColor:'#fff',
        padding: 5,
        justifyContent:'space-between',
        alignItems:'center',
        borderRadius:10,
        marginBottom:10,
        width: 100
    },
    mapMarker: {
        display:'flex',
        flexDirection:'row'
    },
    mapMarkerUserImg:{
        width:35,
        height:35,
        marginRight:5,
        borderRadius:5
    },
    mapMarkerUserInfo: {
        fontSize: 12,
        fontFamily:'Montserrat-SemiBold',
        fontWeight: 'bold'
    },
    mapMarkerUserDistance: {
        fontSize: 10,
        fontFamily:'Montserrat-SemiBold'
    },
    
    homeNav:{
        display:'flex',
        justifyContent:'space-between',
        flexDirection:'row',
        alignItems:'center',
        borderBottomColor:'#ADADAD8A',
        borderBottomWidth:1,
        marginLeft:10,
        marginRight:10,
        paddingBottom:10
    },
    navRight:{
        display:'flex',
        flexDirection:'row'
    },
    navLeft:{
        display:'flex',
        flexDirection:'row'
    },
    profileNav:{
        position:'relative',
    },
    profileNavImg:{
        borderRadius:50,
        width:40,
        height:40
    },
    navLocation:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        marginLeft:20
    },
    navMenuIconBox:{
        position:'absolute',
        bottom:-10,
        right:-10,
        height:26,
        width:26
    },
    navLocationIcon:{
        aspectRatio:18/23,
       width:12,
       marginRight:5
    },
    navLocationName:{
        fontSize:18,
        fontFamily:'Montserrat-Medium'
    },
    navNotificationsOuter:{
        position:'relative'
    },
    navNotifications:{
        height:20
    },
    navNotificationsNumber:{
        backgroundColor:'#0C509C',
        borderRadius:50,
        width:12,
        height:12,
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        justifyContent:'center',
        color:'#fff',
        textAlign:'center',
        fontSize:6,
        position:'absolute',
        top:-5,
        left:-5
    },
    navRightLocation:{
        height:20,
        marginLeft:15
    },
    homeNavBelow:{
        display:'flex',
        marginTop:15,
        marginBottom:15,
        marginLeft:10,
        marginRight:10,
        flexDirection:'row',
        justifyContent:'space-around'
    
    },
    homeNavBelowBtn:{
        backgroundColor:'#0C509C',
        borderRadius:30,
        paddingTop:8,
        paddingBottom:8,
        paddingLeft:18,
        paddingRight:18,
        display:'flex'
    },
    homeNavBelowBtnText:{
        color:'#fff',
        display:'flex',
        fontSize:14,
        fontFamily:'Montserrat-Medium'
    },
    homeNavBelowBtnTextPressed:{
        color:'#000',
        display:'flex',
        fontSize:14,
        fontFamily:'Montserrat-Medium'
    },
    homeScreenBottomBoxText:{
        fontFamily:'Montserrat-Medium'
    }
    
});

export default HomeScreen;
