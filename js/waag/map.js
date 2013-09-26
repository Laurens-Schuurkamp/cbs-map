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
	var rangeCB=9; //range colorbrewer
	var mapOffset=0.75;
	var tTime=500;
	var geoScaling=false;
	
	var activeLayer="bev_dichth";
	var activeDataLayer;
	
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
		   
		regionMap.append("g")
		  .attr("id", "main_map")
		  .attr("class", "Oranges"); //colorBrewer   
		
	  regionMap.append("g")
		  .attr("id", "cbs")
		  .attr("class", "Oranges"); //colorBrewer
				   
   		   
   	lineMap=map.append("g")
		   .attr("id", "lineMap");   
		   
		dotMap=map.append("g")
		   .attr("id", "dotMap");
		   
		customLabelMap=map.append("g")
   		  .attr("id", "customLabelMap");
   		  
   	barChart=svg.append("g")
   		  .attr("id", "barChartMain");
        
    barChart.append("g")
		  .attr("id", "barChart")
		  .attr("class", "Oranges"); //colorBrewer   
		 
		barChart.append("g")
		  .attr("id", "legenda")
		  .attr("class", "Oranges"); //colorBrewer	  

     //Import the plane
     d3.xml("svg/text_cloud.svg", "image/svg+xml", function(xml) {  
       nodeTextCloud = document.importNode(xml.documentElement, true);
        
     });

		repository.initRepository();

	}

	preProcesData = function(dataLayer){
    
    console.log("preproces dataLayer ="+dataLayer.layer);
    dataLayer.data.sort(function(a, b) { return d3.ascending(a.cdk_id, b.cdk_id)});
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

    	// set legenda object data
      dataLayer.legenda={};
    	for (var i=0; i<rangeCB; i++){ 	    
    	    dataLayer.legenda["q"+i]=0;   
    	}	
    
    
	  if(dataLayer.layer=="main_map"){
	    createMainMap(dataLayer);
	  }else{
	    updateDataSet(dataLayer, activeLayer);
	    console.log("updating data set "+dataLayer.cdk_id);  
	  }
    

  }

  createMainMap = function (dataLayer){
    // set d3 visualisations
    
      var colorFill="#f8ffff";
      
      var vis=d3.select("#"+dataLayer.layer);
      
      console.log("adding main map");
      vis.selectAll("path")
    			.data(dataLayer.data)
    			.enter().append("path")
    			  .attr("id", function(d, i){return d.cdk_id;})
    			  .attr("d", path)
    			  .style("fill", colorFill)
    			  .style("stroke", "#333333")
    			  .style("stroke-width", 0.01+"px")
    			  .on("mouseover", function(d){ 
      				d3.select(this).style("fill", "#cccccc" );
      				d3.select(this).style("stroke-width", 0.25+"px" );
      				var tipsy = $(this).tipsy({ 
      						gravity: 'w', 
      						html: true,
      						trigger: 'hover', 
      				        title: function() {
      				          var string=d.name;
      				          return string; 
      				        }
      					});
      					$(this).trigger("mouseover");

      			})
      			.on("mouseout", function(d){
      			  d3.select(this).style("fill", colorFill );
      			  d3.select(this).style("stroke-width", 0.1+"px" );
      			})
    			  .on("click", function(d){
    			    repository.getCbsData(d.cdk_id);
    			        			    
      			})
      	
        var initMenu = menu.createMenuItems(dataLayer);
        menu.updateListView(dataLayer);		
    		console.log("main map innited");
    		arrangeZindex();

      repository.getCbsData("admr.nl.amsterdam");
      

  };
  
  var max, colorScale, quantizeBrewer, scalingGeoGeo;
  updateDataSet = function (dataLayer, cbsLayer){
    
    activeLayer=cbsLayer;
  	var data=dataLayer.data;
    
    data.forEach(function(d){
	    d.subData[activeLayer]=parseFloat(d.subData[activeLayer]);     
      if(d.subData[activeLayer]<0 || isNaN(d.subData[activeLayer]) ){
          d.subData[activeLayer]=0;
      };
    });

    max =  d3.max(data, function(d) { return d.subData[activeLayer]; });
	  colorScale = d3.scale.linear().domain([0,max]).range(['white', 'orange']);
    quantizeBrewer = d3.scale.quantile().domain([0, max]).range(d3.range(rangeCB));
    scalingGeo = d3.scale.linear().domain([0, max]).range(d3.range(max));

    updateRegionsMap(dataLayer);
    updateBarChart(dataLayer);
    
  }

   updateRegionsMap = function (dataLayer){
      
   var data=dataLayer.data;
    
    menu.updateListIcons(activeLayer);
         
    var visCBS=d3.select("#"+dataLayer.layer);
    var vis=visCBS.selectAll("path").data(data, function(d, i){return d.cdk_id})
     
    vis.enter().append("path")
           .attr("id", function(d, i){return d.cdk_id})
           .attr("d", path)
           .attr("class", function(d) { return "q" + quantizeBrewer([d.subData[activeLayer]]) + "-9"; }) //colorBrewer
           .style("stroke-width", 0.1+"px")
           .style("opacity", 1)
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
           
      vis.transition()
          .duration(tTime)
          .style("opacity", 1 );
           
       vis.exit().transition()
           .duration(tTime)
          .style("opacity", 0 )
          .remove();   
        
  };
	
	
	var mTop=40, mBottom=20, mLeft=5, mRight=40, barWidth=240, legendaWidth=5;
	function updateBarChart(dataLayer){
	  
  	var data=dataLayer.data;
  	
  	//reset leganda values
    for(var i in dataLayer.legenda) {
       dataLayer.legenda[i]=0;
    };

  	
  	
  	var visHeigth = ( window.innerHeight - mTop - mBottom );
  	var yPadding= visHeigth /data.length;
  	var barHeight= visHeigth /data.length;
  	if(barHeight>1)barHeight=1;
  	
  	var barsX=mLeft+legendaWidth;
  
    var visBars=d3.select("#barChart");
    var vis=visBars.selectAll("rect").data(data, function(d, i){return d.cdk_id})
    
    vis.enter().append("rect")
       .attr("id", function(d, i){return d.cdk_id})
       .attr("x", barsX+10)
       .attr("y", function(d, i){return (mTop+(i*yPadding) )})
       .attr("width", 0)
       .attr("height", barHeight)
       .attr("class", function(d) { 
          var q=quantizeBrewer([d.subData[activeLayer]]);
          dataLayer.legenda["q"+q]++;
          return "q" + q + "-9"; 
        }) //colorBrewer
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
 			
 			vis.transition()
          .duration(tTime)
          .attr("width", function(d){return scalingGeo([d.subData[activeLayer]])*barWidth})
           
       vis.exit().transition()
          .duration(tTime)
          .attr("width", 0)
          .remove();


      // legenda
      var dataLegenda=d3.entries(dataLayer.legenda);
      var yPrev=0;
      var visLegenda=d3.select("#legenda");
      var legenda=visLegenda.selectAll("rect").data(dataLegenda);
      
      legenda.enter().append("rect")
         .attr("x", mLeft)
         .attr("width", legendaWidth)
         .attr("heigth", 0)
         .attr("class", function(d, i) {
              return "q" + i + "-9"; 
            }) //colorBrewer
      
      legenda.transition()
          .duration(tTime)
          .attr("y", function(d, i){
             var y=mTop+yPrev;
             yPrev+=d.value*yPadding;
             return y;
             })
           .attr("height", function(d){return d.value*yPadding});
     
            
	}
		
	function arrangeZindex(){
	  var vis;
	  var vis=d3.select("#cbs");
  	vis.moveToFront();
	  
	  var vis=d3.select("#barChart");
	  vis.moveToFront();
	}
	
	d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
      this.parentNode.appendChild(this);
      });
  };

	function zoomed() {
	    //console.log(d3.event);
      map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  init();
  this.updateRegionsMap=updateRegionsMap;
  this.preProcesData=preProcesData;
  this.updateDataSet=updateDataSet;
  //this.renewMap=renewMap;
  
  
  return this;   

};