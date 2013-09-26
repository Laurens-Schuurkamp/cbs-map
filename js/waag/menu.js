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
  
  updateListView = function(activeLayer){

    var id="#listview_cbs";
    var list = d3.select(id);

      // (re) createlist     
        list.selectAll("ul")
          .data(cbsLayers)
          .enter()
          .append("li")
          .attr("id", function(d, i){ return i})
          .attr("data-mini", "true")
          .attr("data-icon", function(d){ 
                  if(d.value==activeLayer){
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
              geoMap.updateDataSet(dataLayers[0].layers[0], d.value);

    		});

      $(id).listview("refresh");
     
    }
    
    updateListIcons = function(activeLayer){
      var id="#listview_cbs";
      var list = d3.select(id);
      
      //update list       
       list.selectAll("li")
         .data(cbsLayers)
         .attr("data-icon", function(d){ 
                if(d.value==activeLayer){
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
  	    d3.selectAll("#cbs").attr("class", this.value);
        d3.selectAll("#barChart").attr("class", this.value);
        d3.selectAll("#legenda").attr("class", this.value);
  	    
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
      
      if(this.name=="geoScaling"){
        //dataLayers[i].layers[j].properties.geoscaling=this.checked;
        //geoMap.updateRegionsMap( dataLayers[i].layers[j]);
        
        
      }

        console.log("checkbox "+this.name);
    });
    

  this.init=init;
  this.createMenuItems=createMenuItems;
  this.updateListView=updateListView;
  this.updateListIcons=updateListIcons;
  
}

