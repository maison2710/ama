$(document).ready(function() {
	getUserProfile(initiateTablePage);    
});

//generate data plotting view
$(document).on("click", "#table .data-plotting", function() {
    //dialog options
    var id = $(this).attr("value");
    var dataPointId = $(this).attr("point");
    var dataPointName = $(this).attr("point-name");
    genrateDataView(id, dataPointId, dataPointName);
});

function initiateTablePage(){
    var query;
    if(getHashValue('q')){
        query = Base64.decode(getHashValue('q'));
    } else {
        query = formQuery(userProfile.current_searchkey[0].projectid,null);
    }
    loadStation(query, loadTable);
}

function loadTable(){
	var stationList = new Array();
    for(var i=0; i<entries.length;i++){
    	var entry = entries[i];
    	var element = {};
    	for(var j=0; j<entry.length;j++){
    		element[entry[j].display_name.toLowerCase()] = entry[j].value ? entry[j].value:"N.A.";
            if(entry[j].link){
                element.link = entry[j].link;
            }
    	}
    	stationList.push(element);
    }

    var table = $('#ama-table').DataTable({
        "iDisplayLength": 25,
        "order": [[ 0, "desc" ]],
        "bDestroy": true,
        "aaData": stationList,
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { "data": "name" },
            { "data": "location" },
            { "data": "zone" },
            { "data": "subzone" },
            { "data": "sector" },
            { "data": "subsector" },
            { "data": "assettag" },
            { "data": "simsn" },
            { "data": "simnumber" },
            { "data": "meters" },
            { "data": "address" }
           
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });

    // Add event listener for opening and closing details
    $('#ama-table tbody').off().on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
}

function format (d) {
    console.log(d);

    var link = d.link;
    var station = stationsObject[link];


    //general tab content
    var generalDiv = '<table class="table display table-bordered data-table" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    $.each(station, function(k, v) {
        if(typeof v === 'string'){
            generalDiv +='<tr>'+ '<td>'+k+'</td>'+ '<td>'+v+'</td>'+ '</tr>';
        }
    });
    var datapointTmp = null;
    $.each(station.datapoint, function(k, v) {
        if(datapointTmp){
            datapointTmp+=","+v;
        } else {
            datapointTmp = v;
        }
    });
    generalDiv +='<tr><td>data point</td>'+ '<td>'+datapointTmp+'</td>'+ '</tr>';
    generalDiv += '</table>';

    // geo tab content
    var geoDiv = '<table class="table display table-bordered data-table" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    $.each(station.geo, function(k, v) {
        geoDiv +='<tr>'+ '<td>'+k+'</td>'+ '<td>'+v+'</td>'+ '</tr>';
    });
    geoDiv += '</table>';

    // tag tab content
    var tagDiv = '<table class="table display table-bordered data-table" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    $.each(station.tag, function(k, v) {
        tagDiv +='<tr>'+ '<td>'+k+'</td>'+ '<td>'+v+'</td>'+ '</tr>';
    });
    tagDiv += '</table>';

    // optional tab content
    var optionalDiv = '<table class="table display table-bordered data-table" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    $.each(station.optional, function(k, v) {
        optionalDiv +='<tr>'+ '<td>'+k+'</td>'+ '<td>'+v+'</td>'+ '</tr>';
    });
    optionalDiv += '</table>';

    //general tab content
    var sensorsDiv = '<table class="table display table-bordered data-table" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    $.each(station.datapoint_real, function(k, v) {
        if(typeof v === 'string'){
            sensorsDiv +='<tr>'+ '<td>data point</td>'+ '<td>'+'<a class="data-plotting" value="'+station.id+'" point="'+k+'" point-name="'+v+'">'+v+'</a>'+'</td>'+ '</tr>';
        }
    });
    $.each(station.datapoint_real.meters, function(k, v) {
        sensorsDiv +='<tr>'+ '<td>meter</td>'+ '<td>'+'<a class="data-plotting" value="'+station.id+'" point="'+k+'" point-name="'+v+'">'+v+'</a>'+'</td>'+ '</tr>';
    });
    sensorsDiv += '</table>';

    // `d` is the original data object for the row
    return '<ul class="nav nav-tabs" role="tablist"><li role="presentation" class="active"><a href="#general-'+link+'" aria-controls="general-'+link+'" role="tab" data-toggle="tab">'+
    'General</a></li><li role="presentation"><a href="#geo-'+link+'" aria-controls="geo-'+link+'" role="tab" data-toggle="tab">Geo</a></li><li role="presentation">'+
    '<a href="#tag-'+link+'" aria-controls="#tag-'+link+'" role="tag-'+link+'" data-toggle="tab">Tag</a></li><li role="presentation"><a href="#optional-'+link+'" aria-controls="optional-'+link+'" role="tab" data-toggle="tab">'+
    'Optional</a></li><li role="presentation"><a href="#sensors-'+link+'" aria-controls="sensors-'+link+'" role="tab" data-toggle="tab">Sensors</a></li>'+
    '</ul><div class="tab-content"><div role="tabpanel" class="tab-pane active" id="general-'+link+'">'+ generalDiv +
    '</div><div role="tabpanel" class="tab-pane" id="geo-'+link+'">'+ geoDiv + '</div><div role="tabpanel" class="tab-pane" id="tag-'+link+'">'+ tagDiv + '</div><div role="tabpanel" class="tab-pane" id="optional-'+link+'">'+ optionalDiv +
    '</div><div role="tabpanel" class="tab-pane" id="sensors-'+link+'">'+ sensorsDiv + '</div></div>';
}

function searchStation(){
    var keyword = $("#keyword").val();
    if(keyword.trim().length==0){
        keyword = null;
    }
    var searchKey = $(".current-key").attr("value");

    var query = formQuery(searchKey, keyword)
    loadStation(query, loadTable);
}