//var domain = "http://52.76.123.219/";
var domain = window.location.origin + "/";
var userProfile;
var token="812138;c:pubama";
var stationList;
var stationsObject;
var keySearchShowMax = 2;
var entries;
var timezone = "Asia/Singapore";

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "100",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

$(document).ready(function() {
	// authenticate();
	initiatePage();
    

    $('[data-toggle="tooltip"]').tooltip();
  
    $('body').on('click', function (e) {
        $('[data-toggle="popover"]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    Highcharts.setOptions({
        global: {
            getTimezoneOffset: function (timestamp) {
                var timezoneOffset = moment.tz.zone(timezone).parse(timestamp);
                return timezoneOffset;
            }
        }
    });

});

$(document).on("click", ".go-app", function(e) {
    var value = $(this).attr("value");
    window.open(value, '_blank');
});

function openPage(dom){
    var value = $(dom).attr("value");
    if(getHashValue('q')){
        value += window.location.hash;
    }
    var link = window.location.pathname.toLowerCase();
    if(link.indexOf("ama/"+$(dom).attr("value")) < 0){
        location.href = value;
    } 
}

function initiatePage(){
    $("#nav-bar").load("nav-bar.html");
    $("#header").load("header.html");
    $("#app-header").load("app-header.html");

    // window.location.href = window.location.href + "?token=" + token;

    setTimeout( function(){
        adjustPage();
    }  , 200 );
}

function adjustPage(){
    var link = window.location.pathname.toLowerCase();
    if (link.indexOf("ama/map") > 0){
        $( "#nav-bar #nav-map" ).addClass( "nav-link-chosen" );
    } else if(link.indexOf("ama/table") > 0) {
        $( "#nav-bar #nav-table" ).addClass( "nav-link-chosen" );
    } else if(link.indexOf("ama/app") > 0) {
        $( "#nav-bar #nav-app" ).addClass( "nav-link-chosen" );
    }
}

function postRequest(url, object, callback){
    var request = $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(object),
        contentType: 'application/json', 
        dataType: "JSON",
    });

    request.done(function( msg ) {
        if(callback && typeof(callback)==="function"){
            callback(msg);
        }
    }).fail(function() {
        if(callback && typeof(callback)==="function"){
            callback(msg);
        }
    });
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function getHashValue(hash) {
    var sHashURL = window.location.hash.substr(1),
        sURLVariables = sHashURL.split('&'),
        sHashName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sHashName = sURLVariables[i].split('=');

        if (sHashName[0] === hash) {
            return sHashName[1] === undefined ? true : sHashName[1];
        }
    }
};
var decodedQ;

function getUserProfile(callback){
    var url = domain + "/amaapi/dataintelapi/user/me?token=" + token;

    // $.ajax({
    //     url: url,
    //     async: false,
    //     success: function(data){
    //         userProfile = JSON.parse(data);
    //     },
    //     error: function(){
    //         toastr["error"]("Error loading user profile");
    //     }
    // })

    $.getJSON( url, {
    }).done(function(data) {
        userProfile = data;
        var currentKey;
        var currentKeyword;
        if(getHashValue('q')){
            decodedQ = Base64.decode(getHashValue('q')).replace(/'/g, '"');
            console.log(decodedQ);
            // var decodedJson = JSON.parse(decodedQ.replace(/[\uE000-\uF8FF]/g, '').trim());

            decodedJson = JSON.parse(decodedQ.substr(0,decodedQ.indexOf("}")+1));
            if(decodedJson.hasOwnProperty("projectid")){
                currentKey = decodedJson.projectid;
            } else {
                currentKey = userProfile.current_searchkey[0].projectid;
            }

            if(decodedJson.hasOwnProperty("keyword")){
                currentKeyword = decodedJson.keyword;
            } 
            
        } else {
            currentKey = userProfile.current_searchkey[0].projectid;
        }
        if(currentKeyword){
            $("#keyword").val(currentKeyword);
        }
        showSearchKey(userProfile,currentKey);
        if(callback && typeof(callback)==="function"){
            callback();
        }
    });
}

function showSearchKey(userProfile, currentKey){
    $("#key-list").empty();
    var keyList = userProfile.searchkey;
    $("#key-list").append('<button type="button" class="btn btn-info btn-sm search-key-display current-key" value="'+currentKey+'">'+currentKey+'</button>');
    var normalKeyList = new Array();
    for(var i =0; i < keyList.length; i++){
        var keyTmp = keyList[i].projectid;
        if(keyTmp.trim() != currentKey){
            normalKeyList.push(keyList[i]);
        }
    }

    var keySearchShow;
    var isListOfKey = true;

    if(normalKeyList.length <= keySearchShowMax){
        keySearchShow = normalKeyList.length;
        isListOfKey = false;
    } else {
        keySearchShow = keySearchShowMax;
    }

    for(var i=0; i < keySearchShow; i++){
        var key = normalKeyList[i].projectid;
        if(key != currentKey){
            $("#key-list").append('<button type="button" class="btn btn-default btn-sm search-key-display normal-key" value="'+key+'">'+key+'</button>');
        }
    }

    if(isListOfKey){
        var listDiv ="";
        listDiv += '<span class="dropdown"><button type="button" class="btn btn-default btn-circle dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="glyphicon glyphicon-option-horizontal"></i></button><ul class="dropdown-menu pull-right" style="margin-top:30%">';
        for(var i = keySearchShow; i < normalKeyList.length; i++){
            var key = normalKeyList[i].projectid;
            listDiv += '<li><button type="button" class="btn btn-default btn-sm search-key-display normal-key key-in-list" value="'+key+'">'+key+'</button></li>';
        }

        listDiv += '</ul></span>';
        $("#key-list").append(listDiv);
    }

    
}

function adjustKeyDisplay(chosenDiv){
    $( ".search-key-display" ).each(function() {
        if($(this).hasClass("current-key")){
            $(this).removeClass("btn-info");
            $(this).addClass("btn-default");
            $(this).removeClass("current-key");
            $(this).addClass("normal-key");
        }
    });
    $(chosenDiv).removeClass("btn-default");
    $(chosenDiv).addClass("btn-info");
    $(chosenDiv).removeClass("normal-key");
    $(chosenDiv).addClass("current-key");

}

function loadStation(query, callback){
    stationList = new Array();
    stationsObject = {};
    entries = new Array();
   
    console.log(query);

    window.location.hash = 'q='+Base64.encode(query);
    var searchUrl = domain+"/amaapi/datamodelapi/station/search?token="+token+"&query="+query;

    $.getJSON( searchUrl, {
    }).done(function(data) {
        stationsObject = data.response.stations;
        entries = data.response.entries;
        
        $.each(stationsObject, function(oid, station) {
            station.id = oid;
            stationList.push(station);
        })

        if(callback && typeof(callback)==="function"){
            callback();
            toastr["success"]("Search successful");
        }
    }).error(function(){
        toastr["error"]("Error searching data");
    });
}

function formQuery(searchKey,keyword){
    var query = {};

    query.source = "customer";
    query.projectid = searchKey;
    if(keyword!= null){
        query.keyword = keyword;
    }

    // var queryString = JSON.stringify(query).replace(/\"/g, "");
    var queryString = JSON.stringify(query).replace(/"/g, '\'');

    return queryString;

    
}

$(document).on("keypress", "#keyword", function(e) {
    if (e.which == 13) {
        searchStation();
        return false;
    }
});

$(document).on("click", ".normal-key", function() {
    adjustKeyDisplay(this);
    searchStation();
});

$(document).on("click", "#search", function(e) {
    searchStation();
});

function loadDataGraph(url, div, title){
    var dataList = new Array();
    $.getJSON(url , {
    }).done(function(data) {
        var series = [];
        var values = [];
        $.each(data.response.data,function(k, v){
            var value=[];
            value.push(parseFloat(k));
            value.push(parseFloat(v));
            values.push(value);
        }); 
        values.sort(sortArrayByTime);
        var seri = {};
        seri.name = "data";
        seri.data = values;
        series.push(seri);

        drawSeriesData(series, div, title, data.response.meta.unit);        
    });
}

function sortArrayByTime(a,b){
    var aTime = a[0];
    var bTime = b[0];
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function drawSeriesData(series, div, title, unit){
    div.empty();
    div.highcharts({
        chart: {
            type: 'line',
            zoomType: 'x'
        },
        global: {
            getTimezoneOffset: function (timestamp) {
              var timezoneOffset = moment.tz.zone(timezone).parse(timestamp);
              return timezoneOffset;
            }
        },
        legend: {
            enabled: false
        },
        title: {
            text: title
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'value ('+unit+')'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'value : <b>{point.y:.2f}</b>'
        },
        series: series
    });
}

