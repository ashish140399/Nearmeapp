// import { registerRootComponent } from 'expo';

// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in the Expo client or in a native build,
// // the environment is set up appropriately
// registerRootComponent(App);

// add below link in index.html
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">


  // add this code in homne page
<div class="mainLaunchOuter">
  	<div class="mytext"><span>2,400 / 5,000</span>NFTS MINTED ALREADY</div>
  	<div class="w3-light-grey w3-round-xlarge launchprogressbar">
      <div class="w3-container colourbg w3-round-xlarge" style="width:25%">&nbsp;</div>
    </div>
  </div>


// add this in css file 
.mainLaunchOuter .mytext{
	margin-bottom:10px;
    text-align:center;
}
.mainLaunchOuter .mytext span{
background:yellow;
color:black;
margin-right:6px;
padding:2px 5px
}
.launchprogressbar{
	background:gray !important;
    height:14px !important
}
.launchprogressbar .colourbg{
	background:yellow !important;
    height:14px !important
}
