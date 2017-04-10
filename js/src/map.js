var map,view;

$(document).ready(function() {
    getUserProfile(initiateMapPage);
});

//generate data plotting view
$(document).on("click", "#map .data-plotting", function() {
    //dialog options
    var id = $(this).attr("value");
    var dataPointId = $(this).attr("point");
    var dataPointName = $(this).attr("point-name");
    genrateDataView(id, dataPointId, dataPointName);
});

function searchStation(){

    var keyword = $("#keyword").val();
    if(keyword.trim().length==0){
        keyword = null;
    }
    var searchKey = $(".current-key").attr("value");

    var query = formQuery(searchKey, keyword)
    loadStation(query, loadMap);
}

function initiateMapPage(){
    var query;
    if(getHashValue('q')){
        query = Base64.decode(getHashValue('q'));
    } else {
        query = formQuery(userProfile.current_searchkey[0].projectid,null);
    }
    loadStation(query, loadMap);
}

function loadMap(){
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/PopupTemplate",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/symbols/PictureMarkerSymbol",
      "esri/geometry/Point",
      "dojo/domReady!"
    ], function(Map, MapView, PopupTemplate, Graphic, GraphicsLayer, PictureMarkerSymbol, Point){
        var definedMap = getDefinedMapCenter();

        if(view){
            view.graphics.removeAll();
        } else {
            map = new Map({
                basemap: "streets"
            });
            view = new MapView({
                container: "map",
                map: map, 
                zoom: definedMap.zoom,
                center: definedMap.center // Sets the center point of view in lon/lat ([103.812138, 1.372228])
            });
        }

        var markerList = new Array();

        
        for(var i=0; i < stationList.length; i++){
            var station = stationList[i];
            var lat = station.geo.lat;
            var lng = station.geo.lng;
            if(lat == undefined || lng == undefined){
                console.log(lat + " | " + lng);
                continue;
            }

            //generate ama point coordinate
            var point = new Point(lng, lat);

            //generate ama icon
            var icon = station.geo.icon;
            if(icon.indexOf("https://") >= 0){
                icon = icon.replace("https://","");
            } else if(icon.indexOf("http://") >= 0){
                icon = icon.replace("http://","");
            }

            icon = icon.replace("waterwise.pub.gov.sg",window.location.origin);
            
            var marker = new PictureMarkerSymbol({
                url: icon,
                height: 15,
                width: 15
            });

            //generate ama panel info
            var popupInfo = generatePanelContent(station);

            //generate popup template
            popupTemplate = generatePopupTemplate(PopupTemplate);

            //generate graphic for an ama station point
            var pointGraphic = new Graphic({
                geometry: point,
                symbol: marker,
                attributes: popupInfo,
                popupTemplate: popupTemplate
            });

            markerList.push(pointGraphic);
        }
        view.graphics.addMany(markerList);

        view.popup.on("trigger-action", function(evt){
            // If the zoom-out action is clicked, fire the zoomOut() function
            if(evt.action.id === "zoom-out"){
                zoomOut(view);
            }
        });
       
    });

    $(window).resize();
}

function zoomOut(view) {
  view.goTo({
    center: view.center,
    zoom: view.zoom - 2
  });
}

function getDefinedMapCenter(){
    var definedMap = {};
    var center = new Array();
    var lat = userProfile.current_customer.map.map_center.loc.lat;
    var lng = userProfile.current_customer.map.map_center.loc.lng;
    center.push(lng);
    center.push(lat);

    definedMap.center = center;
    definedMap.zoom = userProfile.current_customer.map.map_zoom;
    return definedMap;
}

function generatePanelContent(station){
    var metersDiv ="<ul>";
    $.each(station.meters, function(key, value) {
        metersDiv+="<li>"+value+"</li>";
    })
    metersDiv +="</ul>";

    var dataPointsDiv = "<ul>";
    $.each(station.datapoint_real, function(key, value) {
        if(key!="meters"){
            dataPointsDiv+="<li><a class='data-plotting' value='"+station.id+"' point='"+key+"' point-name='"+value+"'>"+value+"</a></li>";
        }
    })
    dataPointsDiv +="<li>Meters<ul>";
    $.each(station.datapoint_real.meters, function(key, value) {
        dataPointsDiv+="<li><a class='data-plotting' value='"+station.id+"' point='"+key+"' point-name='"+value+"'>"+value+"</a></li>";
    })
    dataPointsDiv +="</ul></li>";
    dataPointsDiv +="</ul>";

    var popupInfo = {
        Name: station.name,
        Project: station.vdip_id,
        Reference: station.node_reference,
        Zone: station.tag.zone,
        Sector: station.tag.sector,
        Address: station.geo.address,
        Meters: metersDiv,
        Datapoints: dataPointsDiv
    };

    return popupInfo;
}

function generatePopupTemplate(PopupTemplate){
    var popupTemplate = new PopupTemplate({
        title: "{Name}",
        content: "{*}"
    })
    var zoomOutAction = {
        title: "Zoom out",
        id: "zoom-out",
        className: "esri-icon-zoom-out-magnifying-glass"
    };

    // Adds the custom action to the PopupTemplate.
    popupTemplate.actions.push(zoomOutAction);

    return popupTemplate;
}
