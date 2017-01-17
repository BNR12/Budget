var cats = [];
var amts = [];
var bud = [];

function setup(){
	//on button click, post new purchase
	document.getElementById("submit").addEventListener("click", postPurchase, true);

	//on page load, perform AJAJ for categories list and save into variables
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	httpRequest.onreadystatechange = function() { handleCats(httpRequest) };
	httpRequest.open("GET", "/cats");
	httpRequest.send();
}

function postPurchase(){
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	//after posting, get purchase list and update the display
	httpRequest.onreadystatechange = function() { getPurchasesTest(httpRequest) };
	httpRequest.open("POST", "/purchases");
	httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	//get form data
	var category = document.getElementById("category").value;
	var amt = document.getElementById("amt").value;
	var date = document.getElementById("date").value;
	var des = document.getElementById("description").value;

	var data = "cat=" + category + "&amt=" + amt + "&date=" + date + "&des=" + des;

	httpRequest.send(data);

}

function handleCats(httpRequest){

	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {

			//log responseText to console for grading
			console.log("GET Request /cats Response: " + httpRequest.responseText);

			//put categories and amts into an array
			var categories = JSON.parse(httpRequest.responseText);
	
			for (var i = 0; i < categories.length; i++) {
				cats[i] = categories[i].cat;
				amts[i] = categories[i].amt;
			}

			//call for purchases so we can calculate the budget
			getPurchases();
			
			
		} else {
			alert("There was a problem fetching the categories. Try refreshing.");
		}
	}

}

function getPurchases(){

	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	httpRequest.onreadystatechange = function() { calculateBudget(httpRequest) };
	httpRequest.open("GET", "/purchases");
	httpRequest.send();

}

//duplicate that tests if an httpRequest has completed
function getPurchasesTest(httpRequest){

	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {

			//log responseText to console for grading
			console.log("POST Request /purchases Response: " + httpRequest.responseText);

			//clear form input
			document.getElementById("date").value = "";
			document.getElementById("description").value = "";
			document.getElementById("amt").value = "";
			document.getElementById("category").value = "rent";

			var newHttpRequest = new XMLHttpRequest();

			if (!newHttpRequest) {
				alert('Giving up :( Cannot create an XMLHTTP instance');
				return false;
			}

			newHttpRequest.onreadystatechange = function() { calculateBudget(newHttpRequest) };
			newHttpRequest.open("GET", "/purchases");
			newHttpRequest.send();
		}
	}

}

function getAtt(att) {
	return function(item) { return item[att]; };
}

function add(a, b) {
	return parseInt(a) + parseInt(b);
}

function calculateBudget(httpRequest){

	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {

			//log responseText for grading.
			console.log("GET Request /purchases Response: " + httpRequest.responseText);

			//parse responseText
			var purchases = JSON.parse(httpRequest.responseText);


			if (purchases.length < 1){
				for (var i = 0; i < cats.length; i++){
					bud[i] = 0;
				}

			} else {

				//create JavaScript date w/current month and year + first day of the month
				var d = new Date();

				//set day to 01
				d.setDate(01);

				//set month and year to current
				d.setMonth(d.getUTCMonth());
				d.setFullYear(d.getUTCFullYear());

				//convert to ISO formatted String 
				var fullDateString = d.toISOString();
				var dateString = fullDateString.slice(0,10);

				//create a string for the first day of the next month
				d.setMonth(d.getUTCMonth() + 01);
				var fullNextMonth = d.toISOString();
				var nextMonth = fullNextMonth.slice(0,10);

				//for categories 
				for (var i = 0; i < cats.length; i++){

				//filter by cats[i]
				var temp = purchases.filter(function (el) {
    							return (el.cat === cats[i]);});

				//filter by current month: greater or equal to first of the month but less than first of next month
				var temp2 = temp.filter(function (el) {
    							return ((el.date >= dateString) && (el.date < nextMonth));});


				//temp contains all purchases for cat[i]
				//amount of budget for this category
				var temp_amt = amts[i];

				//amounts of purchases for this category
				var pur_amt = temp2.map(getAtt("amt"));

				//total amount of purchases for this category
				var total;
				if (pur_amt.length < 1){
					total = 0;
				} else {
					total = pur_amt.reduce(add);
				}

				//add to array
				bud[i] = total;
				}
			}


			display();

		}
		else {
			alert("There was a problem fetching the purchase list. Try refreshing");
		}
	}
}

function display(){

	//clear the display
	var table = document.getElementById("budget");
	while (table.firstChild){
		table.removeChild(table.firstChild);
	}

	//for each category
	for (var i = 0; i < cats.length; i++){

		//add row to table for category
		var table = document.getElementById("budget");
		var row = document.createElement('tr');
		table.appendChild(row);

		//add category to row
		var category = document.createElement('td');
		category.innerHTML = cats[i] + ": ";
		row.appendChild(category);

		//add amount to row
		var amt = document.createElement('td');

		var disp;
		var temp = amts[i] - bud[i];
		if (temp < 0){
			disp = "$" + Math.abs(temp) + " over";
		} else {
			disp = "$" + temp + " left";
		}

		amt.innerHTML = disp;
		row.appendChild(amt);
	
	}
}


window.addEventListener("load", setup, true);