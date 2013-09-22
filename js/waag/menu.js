WAAG.Menu = function Menu(container) {
  
  console.log("menu constructor innited");
  
  init = function() {
    console.log("menu constructor initted");
  }
  
  createMenuItems =function(dataLayer, subLayer){
    console.log("setting menu items");
    // var menu = d3.select("#menu_container"); 
    // menu.append("div")
    //       .attr("id", "collapsible_"+dataLayer.layer)
    //       .attr("data-role", "collapsible")
    //       .attr("data-mini", "false")
    //       .attr("data-theme", "a")
    //       .attr("data-content", "a")
    //       .append("h4")
    //         .text("test collaps")
    //         
    //         
    // d3.select("#collapsible_"+dataLayer.layer)
    //     .append("ul")
    //      .attr("id", "listview_"+dataLayer.layer)
    //      .attr("data-role", "listview");

    
    
  }
  
  updateListView = function(dataLayer, subLayer){

    var id="#listview_"+dataLayer.layer;
    var list = d3.select(id);
       
      

      // (re) createlist     
        list.selectAll("ul")
          .data(dataLayer.subs)
          .enter()
          .append("li")
          .attr("id", function(d, i){ return i})
          .attr("data-mini", "true")
          .attr("data-icon", function(d){ 
                  if(d.value==subLayer){
                    d.checked=true;
                    return "check";
                  }else{
                    d.checked=false;
                    return "plus";
                  }  
              }) 
   
            .each(function(d) {
                    d3.select(this).append("a")
                      .attr("href", function(d){ return "#";})
                      .text(d.value)
                  
                })
          .on("click", function(d){
              for(var i=0; i<dataLayers.length; i++){
                  if(dataLayers[i].label=="cbs"){
                    dataLayers[i].layers[0].activeLayer=d.value;
                    geoMap.updateRegionsMap(dataLayers[i].layers[0]);
                  }
              }

    		});

      $(id).listview("refresh");
     
    }
    
    updateListIcons = function(dataLayer, subLayer){
      var id="#listview_"+dataLayer.layer;
      var list = d3.select(id);
      
      //update list       
       list.selectAll("li")
         .data(dataLayer.subs)
         .attr("data-icon", function(d){ 
                if(d.value==subLayer){
                   d.checked=true;
                   $(this).buttonMarkup({ icon: "check" });
                 }else{
                   d.checked=false;
                   $(this).buttonMarkup({ icon: "plus" });
                   return "star";
                 }  
             })
    }

  	d3.selectAll("#selector").on("change", function() {
  	  console.log("on change selector name ="+this.name);
  	  if(this.name=="colorBrewer"){
  	    for(var i=0; i<dataLayers.length; i++){
    	      for(var j=0; j<dataLayers[i].layers.length; j++){
    	        var id=dataLayers[i].layers[j].layer;
    	        d3.selectAll("#"+id).attr("class", this.value);
    	      }
    	  }
  	    
  	  }

    }); 
    

    $(":checkbox").bind ("change", function (event)
    {
      if ($(this).attr('checked')) {
        //console.log("checked --" );
      }else{
        //console.log("unchecked");
      }
      //console.log("on change input check ="+this.checked);
      
      if(this.name=="scaling_cbs"){
        for(var i=0; i<dataLayers.length; i++){
    	      for(var j=0; j<dataLayers[i].layers.length; j++){
    	        if(dataLayers[i].layers[j].layer=="cbs"){
    	          dataLayers[i].layers[j].properties.geoscaling=this.checked;
    	          geoMap.updateRegionsMap( dataLayers[i].layers[j]);
    	        }
    	      }
    	  }
        
      } else if(this.name=="divv_taxi"){
          
          for(var i=0; i<dataLayers.length; i++){
      	      for(var j=0; j<dataLayers[i].layers.length; j++){
      	        if(dataLayers[i].layers[j].layer=="divv_taxi"){
      	          var activeLayer=dataLayers[i].layers[j].activeLayer;
              	  var data=dataLayers[i].layers[j].data;

                  data.forEach(function(d){
                    d.subData[activeLayer]=Math.round(Math.random()*15);     
                    
                  });
      	          geoMap.updatePointsMap( dataLayers[i].layers[j]);
    	          
      	        }
      	      }
      	  }
  
        }

        console.log("checkbox "+this.name);
    });
    
    $("#flip").change(function(){
            var slider_value = $(this).val();
            console.log(this.title);
            for(var i=0; i<dataLayers.length; i++){
        	      for(var j=0; j<dataLayers[i].layers.length; j++){
        	        if(dataLayers[i].layers[j].layer==this.name){
        	          dataLayers[i].layers[j].properties.active=$(this).val();
                    
        	          if(slider_value=="on"){
        	            dataLayers[i].layers[j].data=dataLayers[i].layers[j].dataCached;
        	          }else{
        	            dataLayers[i].layers[j].data=[];
        	          }
        	          
        	          if(this.title=="customMap"){
        	            geoMap.updateCustomLabelsMap( dataLayers[i].layers[j]);
        	          }else if(this.title=="pointMap"){
        	            geoMap.updatePointsMap( dataLayers[i].layers[j]);
      	            }
                    
        	        }
        	      }
        	  }

        })

  this.init=init;
  this.createMenuItems=createMenuItems;
  this.updateListView=updateListView;
  this.updateListIcons=updateListIcons;
  
}

