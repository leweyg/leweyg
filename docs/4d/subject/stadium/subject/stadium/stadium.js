

var partnerImageSrcBase = "subject/stadium/ref_images/";
var partnerRemoteServerBase = "https://www.capscilabs.com/";
var partnerRemoteBackend = "https://www.capscilabs.com/";
var partnerInfoLink = "<a href='" + partnerRemoteServerBase + "'>CAP Science Labs</a>";


function partnerGeneralInfo() {
	return {
		bgImagePath : "subject/stadium/olympic_360.jpg", //"images/sunset_360.jpg",
		scrollImagePath : "subject/stadium/Stadium_Cleaned.png",
	};
}

var partnerRandomData_UserName = [
	'Jack Gibson',
	'Leo Graham',
	'Ewan Francis',
	'Jamie Reynolds',
	'Jude Richards',
	'Adan Phillips',
	'Cooper Webb',
	'Cody Contreras',
	'Joel Berg',
	'Mathew Lawson',
	'Mell Russell',
	'Harley Scott',
	'Jude Watson',
	'Lane Chapman',
	'Ash Atkinson',
	'Haiden Tucker',
	'Charlie Perez',
	'Cameron Hardy',
	'Jess Molina',
	'Bennie Whitfield',	
	];
	
	var partnerRandomData_UserImagePaths = [
		'images.jpeg',
		'images (1).jpeg',
		'images (2).jpeg',
		'images (3).jpeg',
		'images (4).jpeg',
		'images (5).jpeg',
	];
	
	var partnerRandomData_MissionName = [
		"Repair Task '",
		"Customer Request '",
	];
	
	var partnerRandomData_MissionImagePaths = [
		'download (1).jpeg',
		'download.jpeg',
		'images (1).jpeg',
		'images (2).jpeg',
		'images (3).jpeg',
		'images (6).jpeg',
		'images.jpeg',
	];
	
	
	var partnerEcosystemCycle = [
		{"step":"request", forCreator:false, eventTypes:["CreatedMission","CreatedTask"]},
		{"step":"safe", forCreator:true,  eventTypes:["CompletedMission"]},
		{"step":"start", forCreator:false, eventTypes:["StartedMission","StartedTask","QuitTask"]},
		{"step":"complete", forCreator:false, eventTypes:["CompletedTask"]},
		{"step":"give", forCreator:false, eventTypes:["DonatedTask"]},
		{"step":"grow", forCreator:false, eventTypes:["VouchForMission"]},
	];
	
	
	var partnerSlideInfo = {
		'ecoSlide0':{
			title : "Stadium Team",
			desc : "Spatial model with live tracked team and inventory.",
			commands : "&bull; Tap to zoom in/out.<br/>&bull; Drag to move around.",
			source : "Based on CAP Science Labs data model.",
			filter : "Filtered to current time.",
			graph : "Graphed on physical space."
		},
		'ecoSlide1':{
			title : "Ecological Process Model",
			desc : "Here is a zoom-able ecological model, with the related state relationships shown on the side.",
			commands : "Scroll to adjust zoom level.",
			source : "Data from relational model behind protocols.",
			filter : "Filtered to current zoom level (scroll to change).",
			graph : "Graphed to show how properties relate."
		},
		0:{
			title : "Person travelling over time",
			desc : "This graph maps out how a person has moved over time, based on recorded social network events.",
			commands : "Click on points to view corresponding mission/person.",
			source : "Data from social collaberation tool.",
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

