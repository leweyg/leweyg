
var partnerImageSrcBase = "lion/ref_images/";
var partnerRemoteServerBase = "https://lion-frontend-uat.herokuapp.com/";
var partnerRemoteBackend = "https://lion-uat.herokuapp.com/";
var partnerInfoLink = "<a href='" + partnerRemoteServerBase + "'>LION app</a> (<a href='https://leweyg.github.io/wive/storyboard/root_ads.html'>storyboard</a>) ";

function partnerGeneralInfo() {
	return {
		bgImagePath : "images/forest_360.jpg", //"images/sunset_360.jpg",
		scrollImagePath : "images/middle_east_map.png",
	};
}

var partnerRandomData_UserName = [
	"Patricia Lawson",
	"Bertha Morse",
	"Emma Hardy",
	"Janice Nolan",
	"Amy Harris",
	"Kelly Simpson",
	"Tina Cain",
	"Anita McClain",
	"Camila York",
	"Chelsea Stokes",
	"Stephen Garrett",
	"Max Walter",
	"Alton Carpenter",
	"Eugene Bush",
	"Benjamin Arnold",
	"Dwayne Galloway",
	"Erik Sweeney",
	"George Gates",
	"Erik Cole",
	"Miguel Simon",
	];
	
	var partnerRandomData_UserImagePaths = [
		"download (1).jpg",
		"download (2).jpg",
		"download (3).jpg",
		"download (4).jpg",
		"download (5).jpg",
		"download (6).jpg",
		"download.jpg",
		"images (1).jpg",
		"images (10).jpg",
		"images (11).jpg",
		"images (12).jpg",
		"images (13).jpg",
		"images (2).jpg",
		"images (3).jpg",
		"images (4).jpg",
		"images (5).jpg",
		"images (6).jpg",
		"images (7).jpg",
		"images (8).jpg",
		"images (9).jpg",
		"images.jpg",
	];
	
	var partnerRandomData_MissionName = [
		"I need help",
		"I need education",
		"I need shelter",
		"I need food",
		"I need something",
		"I need friends",
		"I need to find my parents",
		"I need work",
		//"We have housing",
		"I need housing materials",
		"I need warmth",
		"I need water",
	];
	
	var partnerRandomData_MissionImagePaths = [
		"children-studying-in-refugee-camp-data.jpg",
		"download (1).jpg",
		"download (2).jpg",
		"download.jpg",
		"images (1).jpg",
		"images (10).jpg",
		"images (11).jpg",
		"images (12).jpg",
		"images (2).jpg",
		"images (3).jpg",
		"images (4).jpg",
		"images (5).jpg",
		"images (6).jpg",
		"images (7).jpg",
		"images (8).jpg",
		"images (9).jpg",
		"images.jpg",
		"mission_generic.jpg",
		"Syrian Refugees.jpg",
		"tikkho-maciel-113477-e1507323183993.jpg",
	];
	
	
	var partnerEcosystemCycle = [
		{"step":"need", forCreator:false, eventTypes:["CreatedMission","CreatedTask"]},
		{"step":"safe", forCreator:true,  eventTypes:["CompletedMission"]},
		{"step":"work", forCreator:false, eventTypes:["StartedMission","StartedTask","QuitTask"]},
		{"step":"earn", forCreator:false, eventTypes:["CompletedTask"]},
		{"step":"give", forCreator:false, eventTypes:["DonatedTask"]},
		{"step":"grow", forCreator:false, eventTypes:["VouchForMission"]},
	];
	
	
	var partnerSlideInfo = {
		0:{
			title : "Person doing work",
			desc : "This graph maps out how a person has moved over time, based on recorded social network events.",
			commands : "Click on points to view corresponding mission/person.",
			filter : "Filted to one focus from <a href='#' onclick='evn_GotoSlide(1);'>all events</a>.",
			graph : "Graphed onto local map and scaled time coordinates.",
		},
		1:{
			title : "Hurricane / Mission Flocking",
			desc : "Here we see how social network events move as the eye of the hurricane passes over the area.",
		},
		2:{
			title : "Mission events",
			desc : "Each mission is composed of multiple events provided by different people.",
		},
		3:{
			title : "Multiple Missions",
			desc : "As our network grows, we optimize for multiple people doing and requesting over time.",
		},
		4:{
			title : "Progression Overwatch",
			desc : "Here we track how all of our mission are progressing, and can spot the leaders and those needing extra assistance.",
			graph : "Graphed by mission progression and start time.",
		},
		5:{
			title : "Mission Types",
			desc : "This let's us seperate our data by different mission type, and see how each are progression, for example which need additional donations, etc.",
			graph : "Graphed by mission type and progression over time.",
		},
		6:{
			title : "Social Network",
			desc : "In addition to traditional analysis, we also use temporal social network analysis to see at which times we grow best and understand our strong retention rate.",
			graph : "Graphed by weighted social network distance.",
		},
		7:{
			title : "Blockchain",
			desc : "As each user interacts with the system, seperate blockchains are stored and coordinates (atomic-swapped) across blockchains to ensure we maintain a reliable and distributed social trust framework.",
		},
		8:{
			title : "Gantt Chart",
			desc : "Our next generation Gantt chart maps which users are working on which missions over time.",
			graph : "Graphed by user and mission over time.",
		},
		9:{
			title : "Process Model",
			desc : "We continually map our event data to the high level process model to ensure that the intended goals are being met.",
			graph : "Graphed by process step over time.",
		},
	};
