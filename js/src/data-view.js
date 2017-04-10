var startObj = {};
var endObj = {};

$(document).on("resize", ".ui-dialog", function(e) {
    $(this).find(".ui-dialog-content").width($(this).find(".ui-dialog-titlebar").width());
    var graphDiv = $(this).find(".data-graph");
    graphDiv.highcharts().setSize(graphDiv.width(), graphDiv.height(), doAnimation = true);
});

$(document).on("change", ".data-option", function(e) {
    var value = $(this).val();
    var currentDialog = $(this).closest('.ui-dialog');
    var dataGraph = currentDialog.find(".data-graph");
    var dataPointId = dataGraph.attr("point");
    var dataPointName = dataGraph.attr("point-name");
    if(value=="latest"){
        currentDialog.find(".resolution").prop('disabled', true);
        currentDialog.find(".date-range").prop('disabled', true);
        currentDialog.find(".query-data").prop('disabled', true);
        var dataUrl = domain + "/amaapi/datamodelapi/tsdata/get/"+dataPointId+"/any?token="+token;
        loadDataGraph(dataUrl, currentDialog.find(".data-graph"), "Latest data from " + dataPointName);
    } else {
        currentDialog.find(".resolution").prop('disabled', false);
        currentDialog.find(".date-range").prop('disabled', false);
        currentDialog.find(".query-data").prop('disabled', false);
    }
});

$(document).on("click", ".query-data", function(e) {
    var currentDialog = $(this).closest('.ui-dialog');
    var dataGraph = currentDialog.find(".data-graph");
    var id = dataGraph.attr("value");
    var dataPointId = dataGraph.attr("point");
    var dataPointName = dataGraph.attr("point-name");

    var resolution = currentDialog.find(".resolution").val();
    if (!resolution || isNaN(resolution)) {
        toastr["error"]("Please input valid resolution!");
        return;
    }

    var start = startObj[dataPointId];
    var end = endObj[dataPointId];

    if(!start || !end){
        toastr["error"]("Please input valid time range!");
        return;
    }

    var dataUrl = domain + '/amaapi/datamodelapi/tsdata/get/'+dataPointId+'/'+resolution+'h/'+start+'/'+end+'?token='+token;
    loadDataGraph(dataUrl, currentDialog.find(".data-graph"), "Historical data from " + dataPointName);

});

function genrateDataView(id, dataPointId, dataPointName){
    var width = screen.width*0.75;
    var height = screen.height*0.6;
    var dialogOptions = {
        "title" :  stationsObject[id].name,
        "width" : width,
        "height" : height,
        "modal" : false,
        "resizable" : true,
        "draggable" : true,
    };
   
    // dialog-extend options
    var dialogExtendOptions = {
        "closable" : true,
        "maximizable" : true,
        "minimizable" : true,
        "minimizeLocation" : "left",
        "collapsable" : false,
        // "dblclick" : "collapse",
        "restore" : function(evt) {
            console.log("restore");
        },
       "beforeCollapse" : function(evt) {  console.log("beforeCollapse"); }
    };
    var setteingBarDiv = '<div class="row data-setting-bar" >'+
        '<div class="col-xs-2"><select class="data-option form-control">'+
        '<option value="latest" class="lastest-data">Latest Data</option>'+
        '<option value="history" class="historical-data">Historical Data</option></select></div>'+
        '<div class="col-xs-2" style="padding-right:0px"><input type="text" class="form-control resolution" placeholder="Resolution (hour)" disabled></input></div>'+
        '<div class="col-xs-3" style="padding-right:0px"><input type="text" class="form-control date date-range" placeholder="Select time range" disabled></input></div>'+
        '<div class="col-xs-1" style="padding-right:0px"><button type="button" class="btn btn-primary query-data" disabled>Query</button></div><div class="col-xs-4"></div></div>';
    $('<div>'+setteingBarDiv+'<div class="data-graph" value="'+id+'" point="'+dataPointId+'" point-name="'+dataPointName+'"></div></div>').bind("dialogextendload", function(evt) {
        initiateDateRangePicker($(this).find(".date-range"));
        var dataUrl = domain + "/amaapi/datamodelapi/tsdata/get/"+dataPointId+"/any?token="+token;
        loadDataGraph(dataUrl, $(this).find(".data-graph"), "Latest data from " + dataPointName);
    }).dialog(dialogOptions).dialogExtend(dialogExtendOptions);
}

function initiateDateRangePicker(div){
    var currentDialog = div.closest('.ui-dialog');
    var dataGraph = currentDialog.find(".data-graph");
    var dataPointId = dataGraph.attr("point");

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

        startObj[dataPointId] = start;
        endObj[dataPointId] = end;

    }).bind('datepicker-close',function(obj){});

    div.data('dateRangePicker').setDateRange(moment.tz(startObj[dataPointId], timezone).format('DD/MM/YYYY HH:mm'),moment.tz(endObj[dataPointId], timezone).format('DD/MM/YYYY HH:mm'));


}