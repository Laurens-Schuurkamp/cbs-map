var WAAG = WAAG || {};
var fontBlue="#80BFFF";

WAAG.GeoMap = function GeoMap(container) {
	
	var wMap = 1024;
	var hMap = 768;
	var mapScale=200000;
	var projection, path, svg, map, regionMap, lineMap, dotMap, customLabelMap;
	var centered, zoom;
	var nodeTextCloud;
	var defs, filter, feMerge;
	
	var mapOffset=0.75;
	
	console.log("map constructor innited");

	function init(){
		wMap=window.innerWidth;
		hMap=window.innerHeight;
		
		if(wMap<1200){
		  wMap=1200;
		  //mapScale=mapScale*(window.innerWidth/1200);
	  }
	  
	  mapScale=mapScale/2;
	
		$(container).css({
				'position':"absolute",
				'left':0+"px",
			  'top':0+"px",
				'width':wMap+"px",
			  'height':hMap+"px",
			  'z-index':0
			});
	
		projection = d3.geo.mercator()
			     .translate([ (wMap/2) , (hMap/2) ])
			     .scale([mapScale]);
		
		projection.center([4.9000,52.3725])

		path = d3.geo.path()
		      .projection(projection)
		      .pointRadius(10);
		      
		zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([0.05, 18])
        .on("zoom", zoomed);

		//create svg element            
		svg = d3.select(container).append("svg")
		    .attr("width", wMap)
		    .attr("height", hMap)
		    .style("fill", "white")
		    .call(zoom);

		svg.append("rect")
		    .attr("class", "background")
		    .attr("width", wMap)
		    .attr("height", hMap)
		    
		map = svg.append("g")
		   .attr("id", "map");
	
	// set dropshadow filters	   
   defs = map.append("defs");
   
   filter = defs.append("filter")
         .attr("id", "dropshadow")
   
     filter.append("feGaussianBlur")
         .attr("in", "SourceAlpha")
         .attr("stdDeviation", 1)
         .attr("result", "blur");
     filter.append("feOffset")
         .attr("in", "blur")
         .attr("dx", 0.5)
         .attr("dy", 0.5)
         .attr("result", "offsetBlur");
   
     feMerge = filter.append("feMerge");
   
     feMerge.append("feMergeNode")
         .attr("in", "offsetBlur")
     feMerge.append("feMergeNode")
         .attr("in", "SourceGraphic");		   

    // layerd geo maps
		regionMap=map.append("g")
		   .attr("id", "regionMap");
   		   
   	lineMap=map.append("g")
		   .attr("id", "lineMap");   
		   
		dotMap=map.append("g")
		   .attr("id", "dotMap");
		   
		customLabelMap=map.append("g")
   		  .attr("id", "customLabelMap");  

     //Import the plane
     d3.xml("svg/text_cloud.svg", "image/svg+xml", function(xml) {  
       nodeTextCloud = document.importNode(xml.documentElement, true);
        
     });
     


		repository.initRepository();

	}

	preProcesData = function(dataLayer){
    
    console.log("dataLayer ="+dataLayer.layer);
    // rewrite results to geojson
      dataLayer.data.forEach(function(d){
         // redefine data structure for d3.geom
        if(dataLayer.geom){
         
        	d.type="Feature";
    			d.geometry=d.geom;
    			delete d.geom;
    			d.centroid = path.centroid(d);
    			d.bounds= path.bounds(d);
    			
        }
        // set data values for visualisation
        if(dataLayer.layer=="cbs"){
          d.subData=d.layers.cbs.data;          
        }else if(dataLayer.layer=="service_requests"){
        	d.subData=d.layers["311.amsterdam"].data;
        	d.subData.default=1;
      	}else if(dataLayer.layer=="divv_traffic"){
         	d.subData=d.layers["divv.traffic"].data;
        }else if(dataLayer.layer=="divv_taxi"){
          d.subData=d.layers["divv.taxi"].data;
        }else if(dataLayer.layer=="divv_parking_tarieven"){
          d.subData=d.layers["divv.parking.tarieven"].data.tarief1;
        }else if(dataLayer.layer=="divv_parking_tarieven_uitz"){
          d.subData=d.layers["divv.parking.tarieven_uitz"].data.tarief1;
        }else if(dataLayer.layer=="divv_parking_ticketmachines"){
          d.subData=d.layers["divv.parking.ticketmachines"].data;
          d.subData.default=0.1;
        }

    	});
    	
    dataLayer.dataCached=dataLayer.data;	
	  
    createVisualisation(dataLayer);

  }

  createVisualisation = function (dataLayer){
    // set d3 visualisations
    if(dataLayer.layer=="main_geo_map"){
      console.log("adding main map");
      regionMap.append("g")
    		  .attr("id", dataLayer.layer)
    			.selectAll('path')
    			.data(dataLayer.data)
    			.enter().append("path")
    			  .attr("id", function(d, i){ return d.cdk_id;})
    			  .attr("d", path)
    			  .style("fill", "none")
    			  .style("stroke-width", 0.075+"px")
    			  
    		console.log("main map innited");
    		return;
      
      }else	if(dataLayer.layer==="cbs"){
  		  console.log("setting menu");
        var initted =menu.createMenuItems(dataLayer);
        

      	regionMap.append("g")
    		  .attr("id", dataLayer.layer)
    		  .attr("class", "Oranges"); //colorBrewer
        
        dataLayer.activeLayer="aant_inw";
        menu.updateListView(dataLayer);         
  		  
  		}  else	if(dataLayer.layer=="service_requests"){
        	customLabelMap.append("g")
      		  .attr("id", dataLayer.layer)
      		  .attr("class", "Oranges"); //colorBrewer

          dataLayer.activeLayer="default";         

    	} else if(dataLayer.layer=="divv_traffic"){
  		  
  		  lineMap.append("g")
    		  .attr("id", dataLayer.layer)
    		  .attr("transform", "translate("+ (mapOffset*2)*wMap +",0)")
    		  .attr("class", "Oranges"); //colorBrewer
    		
    		dataLayer.activeLayer="trafeltime"; 

  		} else if(dataLayer.layer=="divv_taxi"){
    		  
    		  dotMap.append("g")
      		  .attr("id", dataLayer.layer)
      		  .attr("transform", "translate("+ mapOffset*wMap +",0)")
      		  .attr("class", "Oranges"); //colorBrewer
          dataLayer.activeLayer="aantal";  
      		
    	}else if(dataLayer.layer=="divv_parking_tarieven"){
        
        //remove corrupted last entry
        dataLayer.data.splice( dataLayer.data.length-1, 1 );
        
         regionMap.append("g")
        	.attr("id", dataLayer.layer)
             .attr("transform", "translate("+ mapOffset*wMap +",0)")
             .attr("class", "Oranges"); //colorBrewer
 
           dataLayer.activeLayer="cost";   

      }else if(dataLayer.layer=="divv_parking_tarieven_uitz"){
        regionMap.append("g")
       	.attr("id", dataLayer.layer)
            .attr("transform", "translate("+ mapOffset*wMap +",0)")
            .attr("class", "Oranges"); //colorBrewer

          dataLayer.activeLayer="cost";   
          
     }else if(dataLayer.layer=="divv_parking_ticketmachines"){

        dotMap.append("g")
       	.attr("id", dataLayer.layer)
            .attr("transform", "translate("+ mapOffset*wMap +",0)")
            .attr("class", "Oranges"); //colorBrewer
          
        dataLayer.activeLayer="default";   
     }
  
    if(dataLayer.properties.active){
      if(dataLayer.geom=="regions"){
        updateRegionsMap(dataLayer);
      }else if(dataLayer.geom=="lines"){
        updateLinesMap(dataLayer);
      }else if(dataLayer.geom=="points"){
        updatePointsMap(dataLayer);
      }else if(dataLayer.geom=="custom_label"){
        updateCustomLabelsMap(dataLayer);
      };
      
    }


  };

	updateRegionsMap = function (dataLayer){
	 var activeLayer=dataLayer.activeLayer;
	 var data=dataLayer.data;
	   
	  data.forEach(function(d){
	    d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
      };
    });

	  var max =  d3.max(data, function(d) { return d.subData[activeLayer]; });
	  var colorScale = d3.scale.linear().domain([0,max]).range(['white', 'orange']);
	  var quantizeBrewer = d3.scale.quantile().domain([0, max]).range(d3.range(9));
    var scalingGeo = d3.scale.linear().domain([0, max]).range(d3.range(max));

    menu.updateListIcons(dataLayer, activeLayer);
  	  	
  	var vis=d3.select("#"+dataLayer.layer);
  	
  	// update selections
  	vis.selectAll("path")
  			.data(data)
  			//.style("fill", function(d){return colorScale(d.subData[activeLayer]);}) 
  			.attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
          .transition(500)
            .attr("transform", function(d) {
                    var x = d.centroid[0];
                    var y = d.centroid[1];
                    //d.bounds = path.bounds(d);
                    var s;         
                    if(dataLayer.properties.geoscaling==false){
                      s=1;
                    }else{
                      s=scalingGeo([d.subData[activeLayer]]);
                    }    
                    return "translate(" + x + "," + y + ")"
                        + "scale(" + s + ")"
                        + "translate(" + -x + "," + -y + ")";
              })
     
     
	  
  	
		vis.selectAll("path")
  			.data(data)
        .enter()
        .append("path")
  			  .attr("id", function(d, i){return d.cdk_id})
  			  .attr("d", path)
  			 .attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
  			 //.style("fill", function(d) { return colorScale(d.subData[activeLayer])}) //linear Scale
  			  .style("fill-opacity", 0.9000)
  			  .style("stroke-width", 0.1+"px")
          .attr("transform", function(d) {
                var x = d.centroid[0];
                var y = d.centroid[1];
                //d.bounds = path.bounds(d);         
                var s;         
                if(dataLayer.properties.geoscaling==false){
                  s=1;
                }else{
                  s=scalingGeo([d.subData[activeLayer]]);
                  console.log("s ="+s)
                }
                return "translate(" + x + "," + y + ")"
                    + "scale(" + s + ")"
                    + "translate(" + -x + "," + -y + ")";
            })
          .on("mouseover", function(d){ 
    				d.className=$(this).attr("class");
    				//d3.select(this).classed("active", true );
    				//$(this).attr("class", "active");
    				d3.select(this).style("stroke-width", 1+"px" );
    				var tipsy = $(this).tipsy({ 
    						gravity: 'w', 
    						html: true,
    						trigger: 'hover', 
    				        title: function() {
    				          var string=d.name+"<br> value: "+d.subData[activeLayer];
    				          return string; 
    				        }
    					});
    					$(this).trigger("mouseover");

    			})
    			.on("mouseout", function(d){
    			  //$(this).attr("class", d.className);
    			  d3.select(this).style("stroke-width", 0.1+"px" );
    				//d3.select(this).classed("active", false );
    			})

	};
	
	function updateLinesMap(dataLayer){
  	var activeLayer=dataLayer.activeLayer;
  	var data=dataLayer.data;
  	
  	data.forEach(function(d){
	    d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
          //dummy data
          d.subData[activeLayer]=Math.random()*5;
      };
    });
    
    var max =  d3.max(data, function(d) { return d.subData[activeLayer]; });
    var colorScale = d3.scale.linear().domain([0,max]).range(['orange', 'brown']);
  	
  	
  	var vis=d3.select("#"+dataLayer.layer);

  	// update selections
  	vis.selectAll("path")
  			.data(data)
  			//.attr("class", function(d) { return "q" + quantizeBrewer([d.visData]) + "-9"; }) //colorBrewer
	      .style("fill-opacity", 1)
			  .style("stroke-width", 1+"px")
			  
		vis.selectAll("path")
  			.data(data)
          .enter()
        .append("path")
  			  .attr("id", function(d, i){return d.cdk_id})
  			  .attr("d", path)
  			  .style("fill", "none")
  			  .style("stroke-width", function(d){return d.subData[activeLayer]})
  			  .style("stroke", function(d){return colorScale(d.subData[activeLayer]);}) 
  			.on("mouseover", function(d){ 
  				var tipsy = $(this).tipsy({ 
  						gravity: 'w', 
  						html: true,
  						trigger: 'hover', 
  				        title: function() {
  				          var string=d.name+"<br> value: "+d.subData[activeLayer];
  				          return string; 
  				        }
  					});
  					$(this).trigger("mouseover");

  			})
  			.on("mouseout", function(d){ 
  				
  			})

	}
	
	function updatePointsMap(dataLayer){
	  console.log("updating point map");
	  
	  var activeLayer=dataLayer.activeLayer;
	  var data=dataLayer.data;
    
    data.forEach(function(d){        
      d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
      };
    });

    var max =  d3.max(data, function(d) { return d.subData[activeLayer]; });
    
    console.log("max ="+max);
    var colorScale = d3.scale.linear().domain([0,max]).range(['green', 'red']);
    var quantizeBrewer = d3.scale.quantile().domain([0, max]).range(d3.range(9));
    var scalingGeo = d3.scale.linear().domain([0, max]).range(d3.range(100));

  	var vis=d3.select("#"+dataLayer.layer);
    
  	// update selections
  	vis.selectAll("path")
  			.data(data)
  			//.attr("class", function(d) { return "q" + quantizeBrewer([d.visData]) + "-9"; }) //colorBrewer
	      .style("fill-opacity", 1)
	      //.attr("class", function(d) { console.log("q" + quantizeBrewer([d.subData[activeLayer]]) + "-9");   return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
			  .transition(500)
			  .attr("d", function(d){                
                      path.pointRadius(d.subData[activeLayer]);
                      return path(d);
                    })
        
			  
  	
		vis.selectAll("path")
  			.data(data)
        .enter()
        .append("path")
  			  .attr("id", function(d, i){return d.cdk_id})
  			  .attr("d", function(d){                
                        path.pointRadius(d.subData[activeLayer]);
                        return path(d);
                      })
          .style("fill-opacity", 1)
  			  .style("stroke-width", 0.1+"px")
  			  .attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
  			.on("mouseover", function(d){ 
  				var tipsy = $(this).tipsy({ 
  						gravity: 'w', 
  						html: true,
  						trigger: 'hover', 
  				        title: function() {
  				          var string=d.name+"<br> value: "+d.subData[activeLayer];
  				          return string; 
  				        }
  					});
  					$(this).trigger("mouseover");

  			})
  			.on("mouseout", function(d){ 
  				
  			}); 
  			
  	vis.moveToFront();		 

	};
	
	function updateCustomLabelsMap(dataLayer){
	  console.log("updating custom label map");
	  
	  var activeLayer=dataLayer.activeLayer;
	  var data=dataLayer.data;
    
    data.forEach(function(d){        
      d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
      };
    });

    var max =  d3.max(data, function(d) { return d.subData[activeLayer]; });

    var colorScale = d3.scale.linear().domain([0,max]).range(['white', 'blue']);
    var quantizeBrewer = d3.scale.quantile().domain([0, max]).range(d3.range(9));
    var scalingGeo = d3.scale.linear().domain([0, max]).range(d3.range(100));

  	var vis=d3.select("#"+dataLayer.layer);
  	
  	//update points
  	vis.selectAll("path")
  			.data(data)
  			.exit().remove()
  			  
  	//update text clouds
  	vis.selectAll("g")
       .data(data)
       .exit().remove()
	
  	
  	//set points
  	vis.selectAll("path")
  			.data(data)
        .enter()
        .append("path")
  			  .attr("id", function(d, i){return d.cdk_id})
  			  .attr("d", function(d){                
                  path.pointRadius(1);
                  return path(d);
                })
  			  .style("fill-opacity", 1)
  			  .style("stroke-width", 0.1+"px")
  			  .attr("class", function(d) { return "q" + quantizeBrewer([1]) + "-9"; }) //colorBrewer
          
    //set clouds      
  	vis.selectAll("g")
       .data(data)
       .enter()
       .append("g")
         .attr("transform", function(d) {
               var s=0.25;
               var x = d.centroid[0]-(7*s);
               var y = d.centroid[1]-(35*s);
                        
               return "translate(" + x + "," + y + ")"
                   + "scale(" + s + ")";
           })
         .each(function(d, i){ 
             var plane = this.appendChild(nodeTextCloud.cloneNode(true)); 
             d3.select(plane).select("path")
              .style("fill", "white")
              .style("stroke", "black")
              .style("opacity", 0.75)
              .attr("filter", "url(#dropshadow)")
              
         })
         
         .on("mouseover", function(d){
   				var tipsy = $(this).tipsy({
   				   	gravity: 'w', 
   						html: true,
   						trigger: 'hover', 
   				        title: function() {
   				          var string=d.subData.description;
   				          return string; 
   				        }
   					});
   					$(this).trigger("mouseover");

   			})
   			.on("mouseout", function(d){ 

   			})
   			
    
     
  	vis.moveToFront();		 

	};

	function setCirclePack(data){
	  
	  var max =  d3.max(data, function(d) {return d.layers.cbs.data.aant_inw; });
	  
	  var color = d3.scale.linear()
            .domain([0,max])
            .range(['white', 'blue']);
    
    var radius =d3.scale.linear()
	         .domain([0, max])
           .range([0, 50]);
           
    var quantize = d3.scale.quantile().domain([0, max]).range(d3.range(9));       

    //console.log(d);
    var w=wMap;
    var h=hMap;
    
    var dataPack={children:data};
    
    var pack = d3.layout.pack()
      .size([w, h])
      .value(function(d) { return d.layers.cbs.data.aant_inw; })


    var node = circlePack.datum(dataPack).selectAll(".node")
        .data(pack.nodes)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })  
        .attr("id", "circle_pack");
        node.append("circle")
              .attr("r", function(d) { return d.r; })
              .style("fill-opacity", 0.1);
              
        node.append("title")
             .text(function(d) { return d.name+"/n"+d.value});
    
        node.append("circle")
            .attr("r", function(d) { return d.r; }) 
            .style("fill-opacity", 0.5)
            .style("fill", function(d) { return color(d.value)})
            //.attr("class", function(d) { return "q" + quantize([d.value]) + "-9"; })           

	};
	
	
	
  function setCirclePacks(data){
      
      var max =  d3.max(data, function(d) {return d.layers.cbs.data.aant_inw; });
      
      var color = d3.scale.linear()
              .domain([0,max])
              .range(['blue', 'steelblue']);
      
      var radius =d3.scale.linear()
             .domain([0, max])
                 .range([0, 50]);
                 
      var quantize = d3.scale.quantile().domain([0, max]).range(d3.range(9));           
      
      //centroids
      circlePacks.append("g")
        .attr("id", "circles")
        .selectAll("circle")
            .data(data.sort(function(a, b) { return b.param_a - a.param_a; }))
            .enter()
            .append("svg:circle")
            .attr("cx", function(d){return d.centroid[0];})
            .attr("cy", function(d){return  d.centroid[1];})              
          .attr("r", 0.01)
          
          .call(visPack);
          
          
        function visPack(selection) {
          selection.each(function(ds) {
              //console.log(d);
              

              var w=ds.bounds[1][0]-ds.bounds[0][0];
              var h=ds.bounds[1][1]-ds.bounds[0][1];
              
              var r = radius([ds.layers.cbs.data.aant_inw]);
            
              var x=ds.centroid[0]-(0.5*w)+1.5*wMap;
              var y=ds.centroid[1]-(0.5*h);
            
              var pack = d3.layout.pack()
                .sort(d3.descending)
                .size([r, r]);
            
              map.append("g")
               .attr("id", "circle_packs") 
               .attr("transform", "translate(" + x + "," + y + ")") 
                  .data([ds.dummyData]).selectAll(".node")
                  .data(pack.nodes)
                  .enter().append("circle")
                  .style("fill-opacity", 0.5)
                  
                  .attr("transform", function(dcp) { return "translate(" + dcp.x + "," + dcp.y + ")"; })
                  .attr("r", function(dcp) { return dcp.r; })
                  .style("fill-opacity", Math.random()*0.5);  
  
          });
          
    };
      
    };
	
	  d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
      this.parentNode.appendChild(this);
      });
    };

	function zoomed() {
      map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };

  init();
  this.preProcesData=preProcesData;
  this.updateRegionsMap=updateRegionsMap;
  this.updatePointsMap=updatePointsMap;
  this.updateCustomLabelsMap=updateCustomLabelsMap;
  
  return this;   

};