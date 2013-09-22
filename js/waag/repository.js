//
// 	Code designed and written by Laurens Schuurkamp @ Waag Society 1013 --> suggestions laurens@waag.org
//	The code is not perfect at all, so please feel free to compliment for improvements.
//	I learn from you, you learn from me, we learn......
//
var dataLayers=[];
WAAG.Repository = function Repository() {

var apiUrl="http://api.citysdk.waag.org/";
var maxEntrys=500;
var load_queue=[];

var llAmsterdam={city:"amsterdam", admr:"admr.nl.amsterdam", lat:52.3734, lng:4.8921};
//var llAmsterdam={city:"amsterdam", admr:"admr.nl.nederland", lat:52.3734, lng:4.8921};
var dummyMax=1000;
  
  console.log("repository constructor innited");

  initRepository = function() {
    
    //     for(var i=0; i<1000; i++){
    //       var url="http://api.smartcitizen.me/v0.0.1/9778c68929309f0244c78730e2a64dd5/"+i+"/posts.json"
    //       d3.json(url, function(data){
    //             if(data.length>0){
    //               console.log("results id="+i);
    //               
    //             }
    // 
    //        });
    //       
    //     }
    //     http://api.smartcitizen.me/v0.0.1/9778c68929309f0244c78730e2a64dd5/220/posts.json
    // return;  
    
  	
  	var cbsLayers=[
                {value:"opp_tot", description:"Oppervlaktes"},
                {value:"aant_inw", description:"Aantal inwoners"},
                {value:"aant_man", description:"Aantal mannen"},
                {value:"opp_land", description:"Oppervlakte land"},
                {value:"p_gehuwd", description:"Percentage gehuwd"},
                {value:"p_hh_m_k", description:""},
                {value:"p_hh_z_k", description:""},
                {value:"p_n_w_al", description:""},
                {value:"aantal_hh", description:""},
                {value:"gem_hh_gr", description:""},
                {value:"opp_water", description:""},
                {value:"p_ant_aru", description:""},
                {value:"p_eenp_hh", description:""},
                {value:"p_marokko", description:""},
                {value:"p_over_nw", description:""},
                {value:"p_surinam", description:""},
                {value:"p_turkije", description:""},
                {value:"p_west_al", description:""},
                {value:"aant_vrouw", description:""},
                {value:"bev_dichth", description:""},
                {value:"p_00_14_jr", description:""},
                {value:"p_15_24_jr", description:""},
                {value:"p_25_44_jr", description:""},
                {value:"p_45_64_jr", description:""},
                {value:"p_65_eo_jr", description:""},
                {value:"p_gescheid", description:""},
                {value:"p_ongehuwd", description:""},
                {value:"p_verweduw", description:""}
                ];
		
     var dataLayer={
    			label:"main_geo_map",
    			layers:[
    				{label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:llAmsterdam.admr+"/regions?admr::admn_level=5&geom", geom:"regions", layer:"main_geo_map", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
    			]
    		};

  	//dataLayers.push(dataLayer);
		
				
  	dataLayer={
  			label:"cbs",
  			layers:[
  				{label:"Amsterdam", subs:cbsLayers, ll:llAmsterdam, apiCall:llAmsterdam.admr+"/regions?admr::admn_level=5&layer=cbs&geom", geom:"regions", layer:"cbs", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
  			  {label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:llAmsterdam.admr+"/nodes?layer=311.amsterdam&geom", geom:"custom_label", layer:"service_requests", properties:{active:false, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
  			]
  		};

    dataLayers.push(dataLayer);
	
    dataLayer={
       label:"divv",
       layers:[
         {label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:"routes?layer=divv.traffic&geom", geom:"lines", layer:"divv_traffic", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
         {label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:"nodes?layer=divv.taxi&geom", geom:"points", layer:"divv_taxi", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
         {label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:"nodes?layer=divv.parking.tarieven&geom", geom:"regions", layer:"divv_parking_tarieven", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
         {label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:"nodes?layer=divv.parking.tarieven_uitz&geom", geom:"regions", layer:"divv_parking_tarieven_uitz", properties:{active:true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},
         //{label:"Amsterdam", subs:[], ll:llAmsterdam, apiCall:"nodes?layer=divv.parking.ticketmachines&geom", geom:"points", layer:"divv_parking_ticketmachines", properties:{active=true, geoscaling:false, static:false, dotSize:0, stroke_width:0.25}},

       ]
     };

   	dataLayers.push(dataLayer);
   	
   	for(var i=0; i<dataLayers.length; i++){
        for(var j=0; j<dataLayers[i].layers.length; j++){
          getApiData(dataLayers[i].layers[j]);
        }
          
    }
	
	  // topomap
  	// d3.json("data/nl_topo_props.json", function(error, results) {
  	//     console.log(results);
  	//     map.setTopoMap(results)
  	//   });

  }


  function getApiData(dataLayer){
  		addloadDataQueue(apiUrl+dataLayer.apiCall+"&per_page="+maxEntrys+"&page=1", 1, dataLayer);	
  }

  function getRegions(url, page, dataLayer){
	
  	d3.json(url, function(data){
  				console.log("results ="+data.results.length);
  				for(var i=0; i<data.results.length; i++){
  					var name=data.results[i].name.toLowerCase();
  					var id=data.results[i].cdk_id.toLowerCase();
					
					
  					if(dataLayer.layer=="cbs_nl"){
  						//admr.nl.zwolle?layer=cbs&per_page=50
  						var url=apiUrl+id+"?layer=cbs&geom&per_page="+maxEntrys+"&page=1";
  					}else if(dataLayer.layer="cbs_gemeentes"){
  						var url=apiUrl+id+"/regions?admr::admn_level=4&layer=cbs&geom&per_page="+maxEntrys+"&page=1";
  					}

  					var loadObject={
  						url:url,
  						page:1,
  						dataLayer:dataLayer
						
  					}
  					load_queue.push(loadObject);

  					$("#feedback").text("api call : "+url);
  					loadDataQueue();	
  				}

  		});

  }


  function loadDataQueue(){
  	while(load_queue.length)
  	{
  		var loadObject = load_queue[0]; 
  		load_queue.shift();
  		getData(loadObject.url, 1, loadObject.dataLayer);
		
  	}

  }

  function addloadDataQueue(url, page, dataLayer){
  	var loadObject={
  		url:url,
  		page:1,
  		dataLayer:dataLayer,

  	}
	
  	if(load_queue.length>0){
  		load_queue.unshift(loadObject);
  	}else{
  		load_queue.push(loadObject);
  		loadDataQueue();
  	}
	
	
  }

  function getData(url, page, dataLayer){
    console.log("api cal "+url);

    d3.json(url, function(json){
      
      if(page==1){
        dataLayer.data=json.results;
      }else{
        var dataConcat=dataLayer.data.concat(json.results);
        dataLayer.data=dataConcat;
        
      }
            
      if(json.results.length>=(maxEntrys/2)){
        var oldUrl = url;
  			var n = url.search("&page=");
  			var slicedUrl = oldUrl.slice(0, n);
  			var nextPage = page + 1;
  			var newUrl = slicedUrl + "&page=" + nextPage;                
        getData(newUrl, nextPage, dataLayer);
      }else{
        console.log("adding "+dataLayer.layer+" -->"+json.results.length)
        geoMap.preProcesData(dataLayer);
      }

  	});

  }

  this.initRepository=initRepository;
  
  return this;

}
