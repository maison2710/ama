var reportsObj = {};

$(document).ready(function() {

	initiateReportPage();

	$(".go-folder-side").click(function(){
		var value = $(this).attr("value");
		var link = location.pathname + "?q=" + value;
		location.href = link;
	});

});

function initiateReportPage(){
	$(".go-folder-side").removeClass('active');
	if(getUrlParameter('q')){
		var directory = getUrlParameter('q');
		var type = directory.split(".")[0];
		getReports(type, directory);
		$(".go-folder-side[value='"+type+"']").addClass('active');
	} else {
	    getReports("data","data");
	    $(".go-folder-side[value='data']").addClass('active');
	}
}


function getReports(type, directory){

	if(reportsObj.hasOwnProperty(type)){
		generateReportView(reportsObj[type], type, directory);
	} else {
		var url = domain + '/amaapi/datamodelapi/reports/'+type+'?token=' + token;
	    $.getJSON( url, {}).done(function(data) {
	        reportsObj[type] = cleanData(type, data.response.reports);
	        generateReportView(reportsObj[type], type, directory);
	    });
	}
}

function cleanData(type, data, directory){

	$.each(data, function(year, reports) {
        for(var i=0; i < reports.length; i++){
			reports[i].lastModifiedTs = parseFloat(reports[i].last_modified);
			reports[i].lastModified = moment.tz(reports[i].lastModifiedTs, timezone).format('DD/MM/YYYY HH:mm');
			reports[i].link = domain + "/amareports/" + type + "/" + year + "/" + reports[i].name;
			reports[i].nameDiv = '<span class="glyphicon glyphicon-file" aria-hidden="true" style="margin-right:2%"></span>' + reports[i].name;
		}
    });
	

	return data;
}

function generateReportView(data, type, directory){
	var dataTable = new Array();
	var dList = directory.split(".");

	if(dList.length == 1){
		$.each(data, function(year, reports) {
			var tmp = {};
			var lastModifiedTs = 0;
			for(var i=0; i< reports.length; i++){
				if(lastModifiedTs < reports[i].lastModifiedTs){
					lastModifiedTs =reports[i].lastModifiedTs;
				}
			}
			tmp.lastModifiedTs = lastModifiedTs;
			tmp.lastModified = moment.tz(lastModifiedTs, timezone).format('DD/MM/YYYY HH:mm');
			tmp.name = year;
			tmp.size = "-";
			// window.location.hash = 'q=data';
			tmp.link = location.pathname + "?q=" + type + "." + year;

		    tmp.nameDiv = '<span class="glyphicon glyphicon-folder-open" aria-hidden="true" style="margin-right:5%;color:orange"></span>' + tmp.name;
			

			dataTable.push(tmp);


		});
		
	} else if(dList.length == 2){
		dataTable = data[dList[1]];
	}

	var newTiltle = $("#app-header").attr("title-value");
	for(var i =0; i<dList.length; i++){
		newTiltle += " / " + dList[i];
		
	}
	$("#app-title").html(newTiltle);

	showReportTable(dataTable);
}

function showReportTable(dataTable){
	var table = $('#file-table').DataTable({
        "iDisplayLength": 25,
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "iDataSort": 0, "aTargets": [ 2 ] }
        ],
        "order": [[ 0, "desc" ]],
        "bDestroy": true,
        "aaData": dataTable,
        "paging":   false,
        "info":     false,
        "searching": false,
        "columns": [
          	{ "data": "lastModifiedTs" },
            { "data": "nameDiv" },
            { "data": "lastModified" },
            { "data": "size" },
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });

    var DELAY = 300, clicks = 0, timer = null;

    $('#file-table tbody').off().on("click", 'tr' , function(e){

    	var row = $(this);
        clicks++; 

        if ( !$(this).hasClass('selected') ) {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            clicks = 1; //new row selected, set clicks to 1
        }

        if(clicks === 1) {
            timer = setTimeout(function() {
                clicks = 0;
            }.bind(this), DELAY);

        } else {
            clearTimeout(timer);
            var row = table.row( this ).data();
			location.href = row.link;
            clicks = 0;
        }

    })
    .on("dblclick", function(e){
        e.preventDefault();
    });
}

