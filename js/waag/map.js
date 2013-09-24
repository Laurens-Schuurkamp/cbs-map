var WAAG = WAAG || {};
var fontBlue="#80BFFF";

WAAG.GeoMap = function GeoMap(container) {
	
	var wMap = 1024;
	var hMap = 768;
	var mapScale=200000;
	var projection, path, svg, map, regionMap, lineMap, dotMap, customLabelMap, barChart;
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
   		  
   	barChart=svg.append("g")
   		  .attr("id", "barChartMain");

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
    			  .style("stroke-width", 0.25+"px")
    			  
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
        
        barChart.append("g")
    		  .attr("id", "barChart")
    		  .attr("class", "Oranges"); //colorBrewer      
  		  updateBarChart(dataLayer);
  		}
  
    if(dataLayer.properties.active){
      if(dataLayer.geom=="regions"){
        updateRegionsMap(dataLayer);
      }
      
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
        .enter().append("path")
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
    				d3.select(this).style("stroke-width", 0.5+"px" );
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
    			  d3.select(this).style("stroke-width", 0.1+"px" );
    			})

	};
	
	function updateBarChart(dataLayer){
	  var activeLayer=dataLayer.activeLayer;
  	var data=dataLayer.data;
  	
  	data.forEach(function(d){
	    d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
      };
    });
    
    data.sort(function(a, b) { return d3.ascending(a.subData[activeLayer], b.subData[activeLayer])});
    
    var max =  d3.max(data, function(d) { return d.subData[activeLayer]; });
    var colorScale = d3.scale.linear().domain([0,max]).range(['white', 'orange']);
  	var scaling = d3.scale.linear().domain([0, max]).range(d3.range(max));
    var quantizeBrewer = d3.scale.quantile().domain([0, max]).range(d3.range(9));
  	
  	var vis=d3.select("#barChart");
  	var maxWith=240;
  	var barHeight=window.innerHeight/data.length;
  
     vis.selectAll("rect")
        .data(data)
        .transition(100)
        .attr("width", 0)

     vis.selectAll("rect")
        .data(data)
        .attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
        .transition(500)
        .attr("width", function(d){var s=scaling([d.subData[activeLayer]]); return s*maxWith})
        
        
        //.style("fill", function(d) { return colorScale(d.subData[activeLayer])}) //linear Scale   

    vis.selectAll("rect")
       .data(data)
       .enter().append("rect")
       .attr("id", function(d, i){return d.cdk_id})
       .attr("x", 0)
       .attr("y", function(d, i){return (i*barHeight)})
       .attr("width", function(d){var s=scaling([d.subData[activeLayer]]); return s*maxWith})
       .attr("height", 0.5)
       .attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
       //.style("fill", function(d) { return colorScale(d.subData[activeLayer])}) //linear Scale
       .on("mouseover", function(d){ 

 				d3.select(this).style("stroke-width", 0.5+"px" );
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
 			  
 			  d3.select(this).style("stroke-width", 0.1+"px" );
 				
 			})
       
	}
	
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
  this.updateBarChart=updateBarChart;
  return this;   

};