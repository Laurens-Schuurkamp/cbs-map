//
// 	Code designed and written by Laurens Schuurkamp @ Waag Society 1013 --> suggestions laurens@waag.org
//	The code is not perfect at all, so please feel free to compliment for improvements.
//	I learn from you, you learn from me, we learn......
//

WAAG.Repository = function Repository() {

var apiUrl="http://api.citysdk.waag.org/";
var maxEntrys=1000;
var load_queue=[];

var dummyMax=1000;
var dataLayers=[];

  
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

     var dataLayer={
    			label:"main_geo_map",
    			layers:[
    				{cdk_id:"admr.nl.nederland", subs:[], apiCall:"/regions?admr::admn_level=3&geom", geom:"regions", layer:"main_map"}, 
    			]
    		};
    //getApiData(dataLayer.layers[0]); 
    getLocalData(dataLayer.layers[0]);   
		
				
  	dataLayer={
  			label:"cbs",
  			layers:[
  				{cdk_id:"admr.nl.amsterdam", subs:[], apiCall:"/regions?admr::admn_level=5&layer=cbs&geom", geom:"regions", layer:"cbs"}, 
  			]
  		};
      //getApiData(dataLayer.layers[0]);
      

	
	  // topomap
  	// d3.json("data/nl_topo_props.json", function(error, results) {
  	//     console.log(results);
  	//     map.setTopoMap(results)
  	//   });

  }
  
  function getLocalData(dataLayer){
  		addloadDataQueue("data/cdk_cities_nl.json", 1, dataLayer);	
  }


  function getApiData(dataLayer){
  		addloadDataQueue(apiUrl+dataLayer.cdk_id+dataLayer.apiCall+"&per_page="+maxEntrys+"&page=1", 1, dataLayer);	
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
        if(dataLayer.layer=="cbs"){
          geoMap.preProcesData(dataLayer);
        }else{
          geoMap.preProcesData(dataLayer);
        }
        
        
      }

  	});

  }
  
  getCbsData = function(cdk_id){
    for(var i=0; i<dataLayers.length; i++){
      if(dataLayers[i].cdk_id==cdk_id){
        //geoMap.renewMap(dataLayers[i]);
        geoMap.preProcesData(dataLayers[i]);
        return;
      }  
    }    
    var url=apiUrl+cdk_id+"/regions?admr::admn_level=5&layer=cbs&geom&per_page="+maxEntrys+"&page=1";
    var layer={cdk_id:cdk_id, apiCall:"/regions?admr::admn_level=5&layer=cbs&geom", geom:"regions", layer:"cbs"}
    dataLayers.push(layer);
    getApiData(layer);

  }

  this.initRepository=initRepository;
  this.getCbsData=getCbsData;
  //this.loa=initRepository;
  
  return this;

}
