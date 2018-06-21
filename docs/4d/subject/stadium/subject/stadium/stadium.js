

var partnerImageSrcBase = "subject/stadium/ref_images/";
var partnerRemoteServerBase = "https://www.capscilabs.com/";
var partnerRemoteBackend = "https://www.capscilabs.com/";
var partnerInfoLink = "<a href='" + partnerRemoteServerBase + "'>CAP Science Labs</a>";


function partnerGeneralInfo() {
	return {
		bgImagePath : "subject/stadium/bali_evening_village.jpg", //"images/sunset_360.jpg",
		scrollImagePath : "subject/stadium/Stadium_Cleaned.png",
	};
}

var partnerRandomData_UserName = [
	"Al Jones",
	"Benedita Vaz Ferreira",
	"Judite Hashimoto Nakata",
	"Carina Pedroso Moreira",
	"Kelly Miranda Tavares",
	"Sofia Ito Aguiar",
	"Iara Jardim Melo",
	"Sara Rosa Furtado",
	"Regina Aguiar Caetano",
	"Lucielle Vieira Hamamura",
	"Matilde Alves Cavalcanti",
	"Edna Menezes Fernandes",
	"Elisandra Assuncao Camargo",
	"Franciane Leitao Carmo",
	"Marlene Linhares Kanashiro",
	"Jaqueline Vieira Rocha",
	"Ester Siqueira Justino",
	"Valentina Castilho Hamamura",
	"Carolina Ventura Ambrosio",
	"Shirlei Couto Cabral",
	"Clarissa Santana de Jesus",
	];
	
	var partnerRandomData_UserImagePaths = [
		"download (10).jpg",
		"download (11).jpg",
		"download (5).jpg",
		"download (6).jpg",
		"download (7).jpg",
		"download (8).jpg",
		"download (9).jpg",
		"images (7).jpg",
		"images (8).jpg",
	];
	
	var partnerRandomData_MissionName = [
		"Repair Task #",
		"Customer Request #",
	];
	
	var partnerRandomData_MissionImagePaths = [
		"download (1).jpg",
		"download (2).jpg",
		"download (3).jpg",
		"download (4).jpg",
		"download.jpg",
		"images (1).jpg",
		"images (2).jpg",
		"images (3).jpg",
		"images (4).jpg",
		"images (5).jpg",
		"images (6).jpg",
		"images.jpg",
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
		'ecoSlide0':{
			title : "Stadium",
			desc : "Here is a zoom-able stadium model, with the related state relationships shown on the side.",
			commands : "Scroll to adjust zoom level.",
			source : "Data from relational model behind protocols.",
			filter : "Filtered to current zoom level (scroll to change).",
			graph : "Graphed to show how properties relate."
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

