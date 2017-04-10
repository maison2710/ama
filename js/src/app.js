$(document).ready(function() {
	$("#meter-report").click(function(){
		window.open("report.html?q=meter", '_blank');
	});

	$("#data-report").click(function(){
		window.open("report.html?q=data", '_blank');
	});

	$("#meta-report").click(function(){
		window.open("report.html?q=meta", '_blank');
	});

	$("#data-quality").click(function(){
		window.open("report.html?q=quality", '_blank');
	});

	$("#daily-report").click(function(){
		window.open("report.html?q=daily", '_blank');
	});

	$("#demand-report").click(function(){
		window.open("demand-variation.html", '_blank');
	});
});