$(document).ready(function() {
	getUserProfile(initiateDemandVariation);    
	loadReportSubscription();

    $("#open-subscribe").click(function(){
        $("#subscribe-modal").modal("show");
    });

    $("#subscribe").click(function(){
        subscribeNewReport();
    });

    $('#subscribe-modal').on('shown.bs.modal', function () {
        $("#upper-thres").val("");
        $("#lower-thres").val("");
    })
});

$(document).on("change", ".data-option", function(e) {
    var value = $(this).val();
    if(value=="latest"){
        $(".resolution").prop('disabled', true);
        $(".date-range").prop('disabled', true);
        $(".query-data").prop('disabled', true);
        var dataUrl = domain + "/amaapi/datamodelapi/tsdata/get/customer_sgdemand_potable/any?token="+token;
        loadDataGraph(dataUrl, $(".data-graph"), "Latest data from Singapore Demand");
    } else {
       	$(".resolution").prop('disabled', false);
        $(".date-range").prop('disabled', false);
       	$(".query-data").prop('disabled', false);
    }
});

$(document).on("click", ".query-data", function(e) {
    var timeRange = getTimeRange($("#data-range"));
    var start = timeRange.start;
    var end = timeRange.end;
    var resolution = $(".resolution").val();
    if (!resolution || isNaN(resolution)) {
        toastr["error"]("Please input valid resolution!");
        return;
    }

    if(!start || !end){
        toastr["error"]("Please input valid time range!");
        return;
    }

    var dataUrl = domain + '/amaapi/datamodelapi/tsdata/get/customer_sgdemand_potable/'+resolution+'h/'+start+'/'+end+'?token='+token;
    loadDataGraph(dataUrl, $(".data-graph"), "Historical data from Singapore Demand");

});

function loadReportSubscription(){
	var reportList = new Array();

    var url = domain + '/amaapi/datamodelapi/reportsubscription/all/demand_variation?token=' + token;
    $.getJSON( url, { }).done(function(data) {
        for(var i=0; i< data.response.length; i++){
            var element = data.response[i];
            var sub = {};
            sub.created = element.created;
            sub.startMili = element.param.startTime;
            sub.start = moment.tz(Number(sub.startMili), timezone).format('DD/MM/YYYY HH:mm');
            sub.endMili = element.param.endTime;
            sub.end = moment.tz(Number(sub.endMili), timezone).format('DD/MM/YYYY HH:mm');
            sub.status = element.status;
            sub.parameters = "Cutoff Upper: " + element.param.upperThreshold + " | " + "Cutoff Lower: " + element.param.lowerThresold;
            sub._id = element._id;

            if(element.status=="closed"){
                sub.reportDiv ='<a href="'+element.report_file+'">Report</a>'
            } else if(element.status=="error"){
                sub.reportDiv = '<div style="color:red">' + element.message + '</div>';
            } else {
                sub.reportDiv = "-";
            }

            reportList.push(sub);
        }

        generateReportSubscriptionTable(reportList);
    });

    
}

function generateReportSubscriptionTable(data){
    var table = $('#demand-table').DataTable({
        "iDisplayLength": 10,
        "order": [[ 0, "desc" ]],
        "bDestroy": true,
        "aaData": data,
        "info":     false,
        "bLengthChange": false,
        "searching": false,
        "columns": [
            { "data": "created" },
            { "data": "start" },
            { "data": "end" },
            { "data": "parameters" },
            { "data": "status" },
            { "data": "reportDiv" }
        ],
        "drawCallback": function( settings ) {
            $("#open-unsubscribe").prop("disabled",true);
            $(window).resize();
        }
    });

    var chosenRow;

    $('#demand-table tbody').off().on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            chosenRow = null;
            $("#open-unsubscribe").prop("disabled",true);
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            chosenRow = table.row( this ).data();
            $("#open-unsubscribe").prop("disabled",false);
        }
    } );

    $('#open-unsubscribe').off().click( function () {
        if(chosenRow==null){
            toastr["error"]("Please select a row first!");
        } else {
            $("#unsubscribe-modal").modal('show');
        }
        
    });

    $("#confirm-unsubscribe").off().click(function(){
        var url = domain+"/amaapi/datamodelapi/reportsubscription/delete/" + chosenRow._id + "?token="+token;

        $.getJSON( url, {
        }).done(function(data) {
            if(data && data.message=="success"){
                table.row('.selected').remove().draw( false );
                toastr["success"]("Unsubscribe successful");
                chosenRow = null;
                $("#unsubscribe-modal").modal("hide");
                $("#open-unsubscribe").prop("disabled",true);
            } else {
                toastr["error"]("Fail to unsubscribe");
            }
        }).fail(function(data){
            toastr["error"]("Fail to unsubscribe");
        });
    });
}

function initiateDemandVariation(){
    var dataUrl = domain + "/amaapi/datamodelapi/tsdata/get/customer_sgdemand_potable/any?token="+token;
    loadDataGraph(dataUrl, $(".data-graph"), "Latest data from Singapore Demand");
    initiateDateRangePicker($("#data-range"));
    initiateDateRangePicker($("#subscribe-range"));
    $("#app-header #app-title").html($("#app-header").attr("title-value"));
}

function initiateDateRangePicker(div){
    var start, end;
    div.dateRangePicker({
        startOfWeek: 'monday',
        separator : ' - ',
        format: 'DD/MM/YYYY HH:mm',
        autoClose: false,
        time: {
            enabled: true
        },
        showShortcuts: true,
        shortcuts : 
        {
            'prev-days': [1,3,5,7],
            'prev': ['week','month','year'],
            'next-days':null,
            'next':null
        }
    }).bind('datepicker-apply',function(event,obj){
        var procdate=[];
        var tempDates=obj.value.split(' - ');
        if(tempDates.length < 2){
            toastr.error('Please choose both start and end time!!! ', '', {timeOut: 5000});
        }
        $.each(tempDates, function(key, value){
            var time = moment.tz(moment(value, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"),timezone);
            procdate.push(time);    
        })
        start=procdate[0];
        end=procdate[1];

    }).bind('datepicker-close',function(obj){});

    div.data('dateRangePicker').setDateRange(moment.tz(start, timezone).format('DD/MM/YYYY HH:mm'),moment.tz(end, timezone).format('DD/MM/YYYY HH:mm'));

}

function getTimeRange(div){
    var range = div.val();
    var rangeArray = range.split("-");
    var start = rangeArray[0].trim();
    var end = rangeArray[1].trim();

    var timeRange = {};
    timeRange.start = moment.tz(moment(start, "DD/MM/YYYY HH:mm"),timezone).valueOf();
    timeRange.end = moment.tz(moment(end, "DD/MM/YYYY HH:mm"),timezone).valueOf();
    
    return timeRange;
}

function subscribeNewReport(){
    var timeRange = getTimeRange($("#subscribe-range"));
    var startTime = timeRange.start;
    var endTime = timeRange.end;
    var upperThreshold = $("#upper-thres").val();
    var lowerThreshold = $("#lower-thres").val();
    var type = "demand_variation";

    var params =  {};
    params.startTime = startTime;
    params.endTime = endTime;
    params.upperThreshold = upperThreshold;
    params.lowerThreshold = lowerThreshold;
    params.type = type;

    var url = domain + '/amaapi/datamodelapi/reportsubscription/create?query=' + JSON.stringify(params) + "&token=" + token;

    $.getJSON( url, {
    }).done(function(data) {
        if(data && data.message=="success"){
            toastr["success"]("Subscribe successful");
            loadReportSubscription();
            $("#subscribe-modal").modal("hide");
        } else {
            toastr["error"]("Fail to subscribe");
        }
    }).fail(function(data){
            toastr["error"]("Fail to subscribe");
        });

}