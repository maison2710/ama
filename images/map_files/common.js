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
});

function initiatePage(){
    $("#header").load("header.html");
    userInfo = JSON.parse($.cookie("userInfo"));

}