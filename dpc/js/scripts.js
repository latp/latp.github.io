var summary = {};
var chartActive = null;
var classes = null;
var models = null;
var attributes = null;
var tables = null;
var options_agent = null;
var attributes_agent = null;

function topnav_responsive_function() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}

function hideOnClick(id) {
	document.getElementById(id).style.display='none';
}

function clearApplyForm(elem) {
    elem.closest("form").reset();
	var formElem = $(elem).closest('form');
	var formId = formElem.attr('id');
	if (formId === "attr_to_create") {
		//	hem de passar a delete all rows la taula
		var table = $(formElem).find('table').get(0);
		deleteAllRows(table);
		checkAbleCreateCreator();
	}
	else
		checkAbleCreate();
}

function checkAbleCreate() {
	if (checkApplyButtonCreator()) {
		document.getElementById("button_apply").disabled=false;
	}
	else
		document.getElementById("button_apply").disabled=true;
}

function checkApplyButton() {
	var inputs_apply = document.getElementsByClassName("input_apply");
	for (var i=0; i<inputs_apply.length; i++) {
		if (inputs_apply[i].value === "")
			return false;
	}
	var selects_apply = document.getElementsByClassName("select_apply");
	for (var i=0; i<selects_apply.length; i++) {
		if (selects_apply[i].selectedIndex == 0)
			return false;
	}
	return true;
}

function checkAbleCreateCreator() {
	//	S'ha modificat
	if (checkApplyButtonCreator()) {
		document.getElementById("button_apply_creator").disabled=false;
	}
	else
		document.getElementById("button_apply_creator").disabled=true;
}

function checkApplyButtonCreator() {
	var inputs_apply = document.getElementsByClassName("input_apply_creator");
	for (var i=0; i<inputs_apply.length; i++) {
		if (inputs_apply[i].value === "")
			return false;
	}
	var selects_apply = document.getElementsByClassName("select_apply_creator");
	for (var i=0; i<selects_apply.length; i++) {
		var indexSel = selects_apply[i].selectedIndex;
		var valueSel = selects_apply[i].options[indexSel].value;
		if (valueSel === "" || valueSel == null)
			return false;
	}
	return true;
}

function sendPost(url, funcToGetData, funcToExecuteAfter, contentType) {
	//	Creating a XHR object
	let xhr = new XMLHttpRequest();
	//	open a connection
	xhr.open("POST", url, true);
	//	Set the request header i.e. which type of content you are sending
	xhr.setRequestHeader("Content-Type", contentType);
	//	Create a state change callback
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			if (this.responseText != null && this.responseText.localeCompare("") != 0) {
				var received = JSON.parse(this.responseText);
				funcToExecuteAfter(received);
			}
			else {
				alert("no data");
			}
		}
	};
	if (funcToGetData != null) {
		//	Converting JSON data to string
		var data = JSON.stringify(dataToSend);
		//	Sending data with the request
		xhr.send(data);
	}
	else {
		xhr.send();
	}
}

function sendPostWithoutResponse(url, funcToGetData, funcToExecuteAfter, contentType) {
	//	Creating a XHR object
	let xhr = new XMLHttpRequest();
	//	open a connection
	xhr.open("POST", url, true);
	//	Set the request header i.e. which type of content you are sending
	xhr.setRequestHeader("Content-Type", contentType);
	//	Create a state change callback
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
            funcToExecuteAfter();
		}
	};
	xhr.send();
}

function getDataConfiguration() {
	var configuration = {};

	configuration.name = document.getElementById("input_name").value;
	configuration.selection = document.getElementById("select_configuration_selection").value;
	configuration.reuse = document.getElementById("select_configuration_reuse").value;
	configuration.reuse_k = document.getElementById("select_configuration_reuse_k").value;
	configuration.revise = document.getElementById("select_configuration_revise").value;
	configuration.revise_bounds = document.getElementById("select_configuration_revise_bounds").value;
	configuration.global_distance = document.getElementById("select_configuration_global_distance").value;
	configuration.discrete_distance = document.getElementById("select_configuration_discrete_distance").value;
	configuration.numeric_distance = document.getElementById("select_configuration_numeric_distance").value;
	configuration.timestamp_distance = document.getElementById("select_configuration_timestamp_distance").value;

	return configuration;
}

function toggleVisibilityConfigurationOptions(elem) {
	var libraries = ["cbr_4.0"];
	var selected_library = elem.options[elem.selectedIndex].value;
	for (var i=0; i<libraries.length; i++) {
		var actualLibrary = libraries[i];
		var actualElem = document.getElementById("div_configuration_" + actualLibrary);
		if (actualLibrary.localeCompare(selected_library) == 0)
			actualElem.style.display = "block";
		else
			actualElem.style.display = "none";
	}
}

function startManagementPage(page) {
	document.getElementById('div_buffered').style.visibility = 'hidden';
	document.getElementById('div_buffer').style.visibility = 'visible';
	if (page === "attributes") {
		checkAbleCreateCreator();
		//	toggleVisibilityAttributesOptions();
		updateSelectModels();
	}
	else if (page === "models") {
		checkAbleCreate();
		//	toggleVisibilityModelOptions();
		updateCreatedModels();
	}
	else if (page === "configurations") {
		checkAbleCreate();
		//	toggleVisibilityConfigurationOptions();
		updateCreatedConfigurations();
	}
	else if (page === "agents") {
		//	checkAbleCreate();
		updateAgents();
	}
	else if (page === "populations") {
		checkAbleCreate();
		updatePopulations();
	}
}

function setInputNumber() {
	$(".input_number").on("keypress keyup blur change",function (event) {
		$(this).val($(this).val().replace(/[^\d].+/, ""));
		if ((event.which < 48 || event.which > 57)) {
			event.preventDefault();
		}
	});
	$(".input_number").on("keypress keyup blur change",function (event) {
		if($(this).val() > 99){
			$(this).val('99');
			return false;
		}
	});
	$(".input_number").on("keypress keyup blur change",function (event) {
		if($(this).val().length > 1 && $(this).val()[0] == 0){
			$(this).val('0');
			return false;
		}
	});
}

function applyFilters(){
	//	Get all selects
	var agent = document.getElementById('select_agent');
	var population = document.getElementById('select_population');
	var configuration = document.getElementById('select_configuration');
	var attributes = document.getElementById('select_attributes');
	//	Get selected option of each select
	var agent_selected = agent.options[agent.selectedIndex];
	var population_selected = population.options[population.selectedIndex];
	var configuration_selected = configuration.options[configuration.selectedIndex];
	var attributes_selected = attributes.options[attributes.selectedIndex];
	//	Creating a XHR object
	let xhr = new XMLHttpRequest();
	let url = "/historic/filter";
	//	open a connection
	xhr.open("POST", url, true);
	//	Set the request header i.e. which type of content you are sending
	xhr.setRequestHeader("Content-Type", "application/json");
	//	Create a state change callback
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			if (this.responseText != null && this.responseText.localeCompare("") != 0) {
				var received = JSON.parse(this.responseText);
				activateSummaryClasses(received);
			}
			else {
				alert("no data");
			}
		}
	};
	//	Converting JSON data to string
	var data = JSON.stringify(
		{
			"agent"		: agent_selected.value,
			"configuration"	: configuration_selected.value,
			"population"	: population_selected.value,
			"attributes"	: attributes_selected.value
		}
	);
	//	Sending data with the request
	xhr.send(data);
}

function activateSummaryClasses(received) {
	var summary_classes = document.getElementById("summary_classes");
	summary_classes.style.display = "block";
	classes = received.classes;
	var select_summary_classes = document.getElementById("select_summary_classes");
	var length = select_summary_classes.options.length;
	for (i = length-1; i >= 0; i--) {
		select_summary_classes.options[i] = null;
	}
	for (var i=0; i<classes.length; i++) {
		var option = document.createElement("option");
		option.text = classes[i];
		option.value = classes[i];
		select_summary_classes.add(option);
	}
	select_summary_classes.addEventListener("change",function() {
		triggerGraphicsBySummary();
	});
	summary = {};
	//	Update parameters received in a global variable
	for (var i=0; i<classes.length; i++) {
		var actual_classe = classes[i];
		summary[actual_classe] = received[actual_classe];
	}
	summary.graphical_evaluations_original = [];
	summary.graphical_evaluations = [];
	for (var i=0; i<received.graphical_evaluations.length; i++) {
		var g_e = received.graphical_evaluations[i];
		summary.graphical_evaluations_original.push(g_e);
		g_e = g_e.replace(" ", "_");
		g_e = g_e.toLowerCase();
		summary.graphical_evaluations.push(g_e);
	}
	updateSummary();
	createSelectGraphicalEvaluations();
	initializeCheckboxTable();
	initializeChart();
	updateVisibilityGraphicalParametersTable();
}

function triggerGraphicsBySummary() {
	var selectedClass = $( "#select_summary_classes" ).val();
	//	Desactivar tots els visibility
	for (var i=0; i<classes.length; i++) {
		var classe_name = classes[i];
		for (var j=0; j<summary.graphical_evaluations.length; j++) {
			var evaluation_name = summary.graphical_evaluations[j];
			document.getElementById("checkbox_" + classe_name + "_visibility_" + evaluation_name).checked = false;
		}
	}
	//	Activar els visibility de real i predicted values
	document.getElementById("checkbox_" + selectedClass + "_visibility_real_values").checked = true;
	document.getElementById("checkbox_" + selectedClass + "_visibility_predicted_values").checked = true;
	document.getElementById("checkbox_" + selectedClass + "_visibility_error_values").checked = true;
	//	Actualitza la interficie
	initializeChart();
	//	Actualitzar els parametritzador del grafic
	document.getElementById('select_classes').value = selectedClass;
	document.getElementById('select_evaluations').value = "real_values";
	updateVisibilityGraphicalParametersTable();
}

function updateSummary() {
	var select_summary_classes = document.getElementById("select_summary_classes");
	var selected_classe = select_summary_classes.options[select_summary_classes.selectedIndex].value;
	document.getElementById("mean_error").innerHTML = summary[selected_classe].mean_error;
	document.getElementById("std_dev").innerHTML = summary[selected_classe].std_dev;
	document.getElementById("max_error").innerHTML = summary[selected_classe].max_error;
	document.getElementById("min_error").innerHTML = summary[selected_classe].min_error;
	document.getElementById("not_predicted").innerHTML = summary[selected_classe].not_predicted;
	document.getElementById("total_historics").innerHTML = summary[selected_classe].total_historics;
}

function initializeCheckboxTable() {
	//	Fem visible el contenidor
	document.getElementById("div_graphical_parameters").style.display="block";
	//	Creem la taula
	var tableAnterior = document.getElementById("table_checkbox");
	if (tableAnterior != null)
		tableAnterior.remove();
	var tableDiv = document.getElementById("div_chart_classes");
	var table = document.createElement("table");
	table.classList.add("table_graphical_options");
	table.id = "table_checkbox";
	table.classList.add("no_outer_border");
	var tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	//	La primera fila conte el titol de cada columna
	var tr = document.createElement("tr");
	tableBody.appendChild(tr);
	var td = document.createElement("th");
	td.appendChild(document.createTextNode("Show"));
	tr.appendChild(td);
	var td = document.createElement("th");
	td.appendChild(document.createTextNode("Lines"));
	tr.appendChild(td);
	var td = document.createElement("th");
	td.appendChild(document.createTextNode("Dashed"));
	tr.appendChild(td);
	var td = document.createElement("th");
	td.appendChild(document.createTextNode("Dots"));
	tr.appendChild(td);
	var td = document.createElement("th");
	td.appendChild(document.createTextNode("Color"));
	tr.appendChild(td);
	for (var i=0; i<classes.length; i++) {
		var classe_name = classes[i];
		//	Creem la fila
		var tr = document.createElement("tr");
		tableBody.appendChild(tr);
		//	Per cada evaluacio crear el que toca
		for (var j=0; j<summary.graphical_evaluations.length; j++) {
			//	Obtenim el nom de l'avaluacio actual
			var evaluation_name = summary.graphical_evaluations[j];
			//	Creem el switch de visibilitat i l'afegim a la taula
			var checkboxVisibility = createCheckboxCustomized("checkbox_" + classes[i] + "_visibility_" + evaluation_name);
			var td = document.createElement("td");
			td.id = "td_" + classes[i] + "_visibility_" + evaluation_name;
			td.appendChild(checkboxVisibility);
			td.style.display = 'none';
			tr.appendChild(td);
			//	Creem el switch de linies i l'afegim a la taula
			var checkboxLines = createCheckboxCustomized("checkbox_" + classes[i] + "_lines_" + evaluation_name);
			var td = document.createElement("td");
			td.id = "td_" + classes[i] + "_lines_" + evaluation_name;
			td.appendChild(checkboxLines);
			td.style.display = 'none';
			tr.appendChild(td);
			//	Creem el switch de dashed i l'afegim a la taula
			var checkboxDashed = createCheckboxCustomized("checkbox_" + classes[i] + "_dashed_" + evaluation_name);
			var td = document.createElement("td");
			td.id = "td_" + classes[i] + "_dashed_" + evaluation_name;
			td.appendChild(checkboxDashed);
			td.style.display = 'none';
			tr.appendChild(td);
			//	Creem el switch de punts i l'afegim a la taula
			var checkboxDots = createCheckboxCustomized("checkbox_" + classes[i] + "_dots_" + evaluation_name);
			var td = document.createElement("td");
			td.id = "td_" + classes[i] + "_dots_" + evaluation_name;
			td.appendChild(checkboxDots);
			td.style.display = 'none';
			tr.appendChild(td);
			//	Creem el boto de color i l'afegim a la taula
			var jscolorBtn = createJscolorButton("jscolorbtn_" + classes[i] + "_color_" + evaluation_name);
			var td = document.createElement("td");
			td.id = "td_" + classes[i] + "_color_" + evaluation_name;
			td.appendChild(jscolorBtn);
			td.style.display = 'none';
			tr.appendChild(td);
			//	Afegim listener a tot per tal que reinicialitzi el chart en cas que algu canvii el seu estat
			checkboxVisibility.addEventListener('change', function() {
				initializeChart()
			});
			checkboxLines.addEventListener('change', function() {
				toggleLinesDashed(this.firstChild.id,"dashed");
				initializeChart();
			});
			checkboxDots.addEventListener('change', function() {
				initializeChart();
			});
			checkboxDashed.addEventListener('change', function() {
				toggleLinesDashed(this.firstChild.id,"lines");
				initializeChart();
			});
		}
	}
	tableDiv.appendChild(table);
	jscolor.install();
	//	Activem les opcions per defecte
	for (var i=0; i<classes.length; i++) {
		var classe_name = classes[i];
		for (var j=0; j<summary.graphical_evaluations.length; j++) {
			var evaluation_name = summary.graphical_evaluations[j];
			if (evaluation_name === "real_values")
				document.getElementById("checkbox_" + classe_name + "_lines_" + evaluation_name).checked = true;
			else if (evaluation_name === "predicted_values")
				document.getElementById("checkbox_" + classe_name + "_lines_" + evaluation_name).checked = true;
			else if (evaluation_name === "error_values")
				document.getElementById("checkbox_" + classe_name + "_dashed_" + evaluation_name).checked = true;
		}
	}
	document.getElementById("checkbox_" + classes[0] + "_visibility_" + "real_values").checked = true;
	document.getElementById("checkbox_" + classes[0] + "_visibility_" + "predicted_values").checked = true;
	document.getElementById("checkbox_" + classes[0] + "_visibility_" + "error_values").checked = true;
}

function toggleLinesDashed(id_triggered, type_to_trigger) {
	//
	var id_triggered_splitted = id_triggered.split("_");
	id_triggered_splitted[2] = type_to_trigger;
	var id_to_trigger = id_triggered_splitted.join("_");
	document.getElementById(id_to_trigger).checked = false;
}

function initializeChart() {
	document.getElementById("chart_div").style.display = 'block';
	var chartData = getChartData();
	var config = {
		type: 'bar',
		data: chartData,
		options: {
			title: {
				display: false,
			},
			legend: {
				display: true,
				onClick: (e) => e.stopPropagation()
			},
			tooltips: {
				mode: 'index',
				intersect: true
			},
			scales:{
				xAxes: [{
					display: false
				}]
			}
		}
	}
	var canvas = document.getElementById('line_chart');
	var context = canvas.getContext('2d');
	if (context != null)
		context.clearRect(0, 0, canvas.width, canvas.height);
	if (chartActive != null) {
		var scrollX = window.scrollX;
		var scrollY = window.scrollY;
		chartActive.destroy();
		chartActive = new Chart(context, config);
		window.scrollTo(scrollX, scrollY);
	}
	else
		chartActive = new Chart(context, config);
}

function getChartData() {
	//	Mostrem cada grafic en funcio de si esta activat o no la taula de checkboxes
	var arrayLength = summary[classes[0]].error_values.length;
	var barChartData = {};
	barChartData.labels = Array.from({length: arrayLength}, (el, index) => index);
	barChartData.datasets = [];
	for (var i=0; i<classes.length; i++) {
		for (var j=0; j<summary.graphical_evaluations.length; j++) {
			var evaluation_name = summary.graphical_evaluations[j];
			var checkboxVisibility = document.getElementById("checkbox_" + classes[i] + "_visibility_" + evaluation_name);
			var checkboxLines = document.getElementById("checkbox_" + classes[i] + "_lines_" + evaluation_name);
			var checkboxDots = document.getElementById("checkbox_" + classes[i] + "_dots_" + evaluation_name);
			var checkboxDashed = document.getElementById("checkbox_" + classes[i] + "_dashed_" + evaluation_name);
			var jscolorBtn = document.getElementById("jscolorbtn_" + classes[i] + "_color_" + evaluation_name);
			if (checkboxVisibility.checked) {
				var dataset = {};
				//	Style lines
				if (!checkboxLines.checked && !checkboxDashed.checked)
					dataset.showLine = false;
				//	Style dots
				if (!checkboxDots.checked)
					dataset.pointRadius = 0;
				//	Style dashed
				if (checkboxDashed.checked)
					dataset.borderDash = [5,5];
				//	Style color
				var color_js = jscolorBtn.jscolor.toHEXString();
				dataset.backgroundColor = color_js;
				dataset.borderColor = color_js;
				//	Style title
				dataset.label = summary.graphical_evaluations_original[j] + " " + classes[i];
				//	Add values
				var values = summary[classes[i]][evaluation_name];
				dataset.data = values;
				dataset.type = 'line';
				dataset.fill = false;
				barChartData.datasets.push(dataset);
			}
		}
	}
	return barChartData;
}


function randomColor() {
	return '#' + randomColorWithoutSharp();
}

function randomColorWithoutSharp() {
	var x=Math.round(0xffffff * Math.random()).toString(16);
	var y=(6-x.length);
	var z="000000";
	var z1 = z.substring(0,y);
	return z1 + x;
}

function createCheckboxCustomized(id) {
	var newLabel = document.createElement("label");
	newLabel.classList.add("switch");
	var newCheckbox = document.createElement("input");
	newCheckbox.setAttribute("type", "checkbox");
	newCheckbox.id = id;
	var newDiv = document.createElement("div");
	var newSpan = document.createElement("span");
	newDiv.appendChild(newSpan);
	newLabel.appendChild(newCheckbox);
	newLabel.appendChild(newDiv);
	return newLabel;
}

function createJscolorButton(idButton) {
	var btn = document.createElement("input");
	btn.id=idButton;
	btn.setAttribute("type","button");
	btn.setAttribute("data-jscolor","{preset:'large dark', value:\'"+randomColorWithoutSharp()+"\', onChange: 'initializeChart()'}");
	return btn;
}

function createSelectGraphicalEvaluations() {
	//	Crear el select de les evaluacions amb totes les opcions
	var select_evaluations = document.createElement("select");
	select_evaluations.id = "select_evaluations";
	select_evaluations.classList.add("input_select_normal");
	select_evaluations.classList.add("glowing_border_normal");
	for (var i=0; i<summary.graphical_evaluations.length; i++) {
		var evaluation_name = summary.graphical_evaluations_original[i];
		var option = document.createElement("option");
		option.text = evaluation_name;
		option.value = summary.graphical_evaluations[i];
		select_evaluations.add(option);
	}
	select_evaluations.addEventListener("change", function(){
		updateVisibilityGraphicalParametersTable();
	});
	//		Borrem els que s'hagin pogut afegir abans
	var sgpe = document.getElementById("select_graphical_parameters_evaluation");
	while (sgpe.firstChild) {
		sgpe.removeChild(sgpe.lastChild);
	}
	//		Afegim l'actual
	sgpe.appendChild(select_evaluations);
	//	Crear el select de les classes amb totes les opcions
	var select_classes = document.createElement("select");
	select_classes.id = "select_classes";
	select_classes.classList.add("input_select_normal");
	select_classes.classList.add("glowing_border_normal");
	for (var i=0; i<classes.length; i++) {
		var classe_name = classes[i];
		var option = document.createElement("option");
		option.text = classe_name;
		option.value = classe_name;
		select_classes.add(option);
	}
	select_classes.addEventListener("change", function(){
		updateVisibilityGraphicalParametersTable();
	});
	//		Borrem els que s'hagin pogut afegir abans
	var sgpc = document.getElementById("select_graphical_parameters_classe");
	while (sgpc.firstChild) {
		sgpc.removeChild(sgpc.lastChild);
	}
	//		Afegim l'actual
	sgpc.appendChild(select_classes);
}

function updateVisibilityGraphicalParametersTable() {
	var select_classes = document.getElementById("select_classes");
	var selected_classe = select_classes.options[select_classes.selectedIndex].value;
	var select_evaluations = document.getElementById("select_evaluations");
	var selected_evaluation = select_evaluations.options[select_evaluations.selectedIndex].value;
	for (var i=0; i<classes.length; i++) {
		var classe_name = classes[i];
		for (var j=0; j<summary.graphical_evaluations.length; j++) {
			var evaluation_name = summary.graphical_evaluations[j];
			var td_visibility = document.getElementById("td_" + classe_name + "_visibility_" + evaluation_name);
			var td_lines = document.getElementById("td_" + classe_name + "_lines_" + evaluation_name);
			var td_dots = document.getElementById("td_" + classe_name + "_dots_" + evaluation_name);
			var td_dashed = document.getElementById("td_" + classe_name + "_dashed_" + evaluation_name);
			var td_color = document.getElementById("td_" + classe_name + "_color_" + evaluation_name);
			if (classe_name.localeCompare(selected_classe) == 0 && selected_evaluation.localeCompare(evaluation_name) == 0) {
				td_visibility.style.display='table-cell';
				td_lines.style.display='table-cell';
				td_dots.style.display='table-cell';
				td_dashed.style.display='table-cell';
				td_color.style.display='table-cell';
			}
			else {
				td_visibility.style.display='none';
				td_lines.style.display='none';
				td_dots.style.display='none';
				td_dashed.style.display='none';
				td_color.style.display='none';
			}
		}
	}
}

//	Creator stored Attributes

function updateCreatedAttributes() {
	var attributes = sendPost("/attributes/all",null,createStoredAttributes,"application/json");
}

function createStoredAttributes(data) {
	attributes = {};
	for (var i=0; i<data.length; i++) {
		attributes[data[i].id] = data[i].attributes;
		if (attributes[data[i].id] != null)
			attributes[data[i].id].sort((a, b) => (a.id).localeCompare(b.id));
	}
	for (var i=0; i<data.length; i++)
		createOneBlockOfStoredAttributes(data[i]);
	document.getElementById('div_buffer').style.visibility = 'hidden';
	document.getElementById('div_buffered').style.visibility = 'visible';
}

//	Creator stored Configuration
function updateCreatedConfigurations() {
	var confs = sendPost("/configurations/all",null,createStoredConfigurations,"application/json");
}

function createStoredConfigurations(data) {
	for (var i=0; i<data.length; i++)
		createOneBlockOfStoredConfiguration(data[i]);
	document.getElementById('div_buffer').style.visibility = 'hidden';
	document.getElementById('div_buffered').style.visibility = 'visible';
}

function createOneBlockOfStoredConfiguration(conf) {
	var div_rc = document.getElementById("div_right_creator");
	var div_ocfs = document.createElement("DIV");
	div_ocfs.classList.add("options_container_full_size");
	div_rc.appendChild(div_ocfs);
	div_ocfs.innerHTML = `
		<div class='options_title'><p>` + conf.id + `</p></div>
		<form id=conf_created_` + conf.id + ` action='/configurations/` + conf.id + `' method='post'>
			<div class='middle'>
				<span class='title_element'><strong>Name:</strong></span>
				<span class='select_element'>
					<input class='input_text_normal input_text_normal glowing_border_normal' type='text' name='name' id=name_` + conf.id + `>
				</span>
			</div>
			<div id='div_configuration_cbr_4.0'>
				<div class='middle'>
					<span class='title_element'><strong>Selection:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='selection' id=selection_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='All individuals sorted'>All individuals sorted</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Reuse:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='reuseMethod' id=reuseMethod_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='Mean with most equal cases'>Mean with most equal cases</option>
							<option value='Mean with random cases'>Mean with random cases</option>
							<option value='Mean with random cases for each class'>Mean with random cases for each class</option>
							<option value='Corrected mean with most equal cases'>Corrected mean with most equal cases</option>
							<option value='Corrected mean with random cases'>Corrected mean with random cases</option>
							<option value='Corrected mean with random cases for each class'>Corrected mean with random cases for each class</option>
							<option value='Median with most equal cases'>Median with most equal cases</option>
							<option value='Median with random cases'>Median with random cases</option>
							<option value='Median with random cases for each class'>Median with random cases for each class</option>
							<option value='Copy most recent case from most equal cases'>Copy most recent case from most equal cases</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Reuse K:</strong></span>
					<span class='select_element'>
						<input class='input_number input_text_normal glowing_border_normal' type='number' min=1 step=1 name='reuseK' id=reuseK_` + conf.id + `>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Revise:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='revise' id=revise_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='ID3'>IB3</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Revise min bound:</strong></span>
					<span class='select_element'>
						<input class='input_number input_text_normal glowing_border_normal' type='number' min=0 step=1 name='reviseMinBound' id=reviseMinBound_` + conf.id + `>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Revise max bound:</strong></span>
					<span class='select_element'>
						<input class='input_number input_text_normal glowing_border_normal' type='number' min=0 step=1 name='reviseMaxBound' id=reviseMaxBound_` + conf.id + `>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Global distance:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='dg' id=dg_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='Global Distance Euclidian'>Global Distance Euclidian</option>
							<option value='Global Distance Mean'>Global Distance Mean</option>
							<option value='Global Distance Weighted'>Global Distance Weighted</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Discrete distance:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='dlDisc' id=dlDisc_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='Local Distance Binary'>Local Distance Binary</option>
							<option value='Local Distance Hamming'>Local Distance Hamming</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Numeric distance:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='dlNum' id=dlNum_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='Local Distance Euclidian'>Local Distance Euclidian</option>
						</select>
					</span>
				</div>
				<div class='middle'>
					<span class='title_element'><strong>Timestamp distance:</strong></span>
					<span class='select_element'>
						<select class='select_apply input_select_normal glowing_border_normal' name='dlTimestamp' id=dlTimestamp_` + conf.id + `>
							<option disabled selected style="display:none;"></option>
							<option value='Local Distance Timestamp'>Local Distance Timestamp</option>
						</select>
					</span>
				</div>
			</div>
			<div class='middle button_container'>
				<button class='button_default glowing_border_normal' type='reset' name='action' value='clear'>Clear</button>
				<button class='button_default glowing_border_normal' type='submit' name='action' value='update'>Update</button>
				<button class='button_default glowing_border_normal' type='button' onclick='deleteCreated("` + conf.id + `")'>Delete</button>
				<button class='button_default glowing_border_normal' type='button' onclick='copyToCreator("conf_created_` + conf.id + `", "idCopy")'>Copy</button>

				<button type='submit' id=delete_` + conf.id + ` name='action' value='delete' style="display:none;"></button>
			</div>
		</form>
	`;
	//	Default values text
	$("#name_" + conf.id).prop("defaultValue", conf.name);
	$("#reuseK_" + conf.id).prop("defaultValue", conf.configuration.reuseK);
	$("#reviseMinBound_" + conf.id).prop("defaultValue", conf.configuration.reviseMinBound);
	$("#reviseMaxBound_" + conf.id).prop("defaultValue", conf.configuration.reviseMaxBound);
	//	Default values select
	$("#selection_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.selection; }).prop('defaultSelected',true);
	$("#reuseMethod_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.reuseMethod; }).prop('defaultSelected',true);
	$("#revise_" + conf.id + " option").filter(function() { return $(this).val() === conf.configuration.revise; }).prop('defaultSelected',true);
	$("#dg_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.dg; }).prop('defaultSelected',true);
	$("#dlNum_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.dlNum; }).prop('defaultSelected',true);
	$("#dlDisc_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.dlDisc; }).prop('defaultSelected',true);
	$("#dlTimestamp_" + conf.id + " option").filter(function() { return $(this).html() === conf.configuration.dlTimestamp; }).prop('defaultSelected',true);
	//	Limit numbers in input_number
	$(".input_number").on("keypress keyup blur",function (event) {
		$(this).val($(this).val().replace(/[^\d].+/, ""));
		if ((event.which < 48 || event.which > 57)) {
			event.preventDefault();
		}
	});
}

function deleteCreated(id) {
	var url = "/configurations/" + id + "?action=check";
	var confs = sendPost(url,null,allowPerformance,"application/x-www-form-urlencoded");
}

function allowPerformance(data) {
	if (data.message === "ok")
		document.getElementById(data.id).click();
	else
		showBlur(data.title,data.message);
}

function copyToCreator(idOriginal,idCopy) {
	var formOriginal = document.getElementById(idOriginal);
	var formCopy = document.getElementById(idCopy);
	form2form(formOriginal,formCopy);
	checkAbleCreate();
}

function form2form(formA, formB) {
    $(':input[name]', formA).each(function() {
		if ($(this).attr('name') !== "action") {
			$('[name=' + $(this).attr('name') +']', formB).val($(this).val())
		}
    })
}

function showBlur(title,message) {
	$("#p_title").text(title);
	$("#p_message").text(message);
	$("#blurredPopup").show();
	$("#blurredPopup").children().show();
}

function hideBlur(elem) {
	$("#blurredPopup").hide();
	$("#blurredPopup").children().hide();
}

function addRow(elem) {
	var newRow = `
		<tr class="attr_row">
			<td class="large_cell">
				<input type="text" name="attr_id" class="text_overflow_right input_apply">
			</td>
			<td class="medium_cell">
				<select name="attr_type" select_apply">
					<option disabled selected style="display:none;"></option>
					<option value="-1">No type</option>
					<option value="0">Discrete</option>
					<option value="1">Numeric</option>
					<option value="5">Timestamp</option>
				</select>
			</td>
			<td class="small_cell">
				<input type="number" name="attr_weight" class="input_number input_number_attr input_apply" min="0" max="99">
			</td>
			<td>
				<button type="button" onclick='putSelectModelsToDefault(this); deleteRow(this);'><img src="">x</button>
			</td>
		</tr>
	`
	$(elem).closest('table').find('tbody').append(newRow);
	setInputNumber();
}

function addRowCreator(elem) {
	var newRow = `
		<tr class="attr_row">
			<td class="large_cell">
				<input type="text" name="attr_id" class="text_overflow_right input_apply_creator">
			</td>
			<td class="medium_cell">
				<select name="attr_type" class="select_apply_creator">
					<option disabled selected style="display:none;"></option>
					<option value="-1">No type</option>
					<option value="0">Discrete</option>
					<option value="1">Numeric</option>
					<option value="5">Timestamp</option>
				</select>
			</td>
			<td class="small_cell">
				<input type="number" name="attr_weight" class="input_number input_number_attr input_apply_creator" min="0" max="99">
			</td>
			<td>
				<button type="button" onclick='putSelectModelsToDefault(this); deleteRow(this);' class="attr_delete_row_creator"><img src="">x</button>
			</td>
		</tr>
	`
	$(elem).closest('table').find('tbody').append(newRow);
	setInputNumber();
	checkAbleCreateCreator();
}

function deleteAllRows(elem) {
	var deleteBtns = elem.getElementsByClassName('attr_delete_row_creator');
	for (var i=deleteBtns.length-1; i>=0; i--)
		deleteRow(deleteBtns[i]);
}

function deleteRow(elem) {
	var formElem = $(elem).closest('form');
	var formId = formElem.attr('id');
	var allTR = $(formElem).find("tr");
	var lengthRows = allTR.length;
	var lastTR = allTR.last();
	if (lengthRows <=3) {
		if (formId === "attr_to_create")
			addRowCreator(elem);
		else
			addRow(lastTR);
	}
	elem.closest('tr').remove();
	if (formId === "attr_to_create")
		checkAbleCreateCreator();
}

function sendFormRecieveJson(idForm,idServer,idToActivate,collection,action) {
	var infoForm = $("#" + idForm).closest('form').serialize();
	var url = "/" + collection + "/";
	if (idServer == null)
		url += "?action=" + action + "&idToActivate=" + idToActivate + "&" + infoForm;
	else
		url += idServer + "/?action=" + action + "&idToActivate=" + idToActivate + "&" + infoForm;

	var attributes = sendPost(url, null, allowPerformance, "application/x-www-form-urlencoded");
}

function createElementInServer(collection,id) {
	var infoForm = $("#" + id).closest('form').serialize();
	var url = "/" + collection + "/?action=create&" + infoForm;
	var attributes = sendPost(url, null, allowPerformance,"application/x-www-form-urlencoded");
}

function createForm(collection,id) {
	//	Enviar al check
	var infoForm = $("#" + id).closest('form').serialize();
	var url = "/" + collection + "/?action=check&" + infoForm;
	var confs = sendPost(url,null,allowPerformance,"application/x-www-form-urlencoded");
}

//	Creator stored Models

function updateCreatedModels() {
	var confs = sendPost("/models/all",null,createStoredModels,"application/json");
}

function createStoredModels(data) {
	for (var i=0; i<data.length; i++)
		createOneBlockOfStoredModel(data[i]);
	document.getElementById('div_buffer').style.visibility = 'hidden';
	document.getElementById('div_buffered').style.visibility = 'visible';
}

function createOneBlockOfStoredModel(model) {
	var div_rc = document.getElementById("div_right_creator");
	var div_ocfs = document.createElement("DIV");
	div_ocfs.classList.add("options_container_full_size");
	div_rc.appendChild(div_ocfs);

	div_ocfs.innerHTML = `
		<div class='options_title'><p>` + model.id + `</p></div>
		<form id=model_created_` + model.id + ` action='/models/` + model.id + `' method='post'>
			<div class='middle'>
				<span class='title_element' style='width: 30%;'><strong>Name</strong></span>
				<span class='select_element'>
					<input class='input_text_normal glowing_border_normal' type='text' name='name' id=name_` + model.id + `>
				</span>
			</div>

			<div class='middle'>
				<span class='title_element' style='width: 30%;'><strong>JSON Model</strong></span>
			</div>
			<textarea id=model_` + model.id + ` name="model" class="input_textarea_normal glowing_border_normal" cols="58" rows="20"></textarea>

			<div class='middle button_container'>
				<button class='button_default glowing_border_normal' type='button' onclick='copyToCreator("model_created_` + model.id + `", "form_creator")'>Copy</button>
				<button class='button_default glowing_border_normal' type='reset' name='action' value='clear'>Clear</button>
				<button class='button_default glowing_border_normal' type='submit' name='action' value='update'>Update</button>
				<button class='button_default glowing_border_normal' type='submit' name='action' value='delete'>Delete</button>
			</div>
		</form>
	`;
	//	Default values text
	var modelStr = JSON.stringify(model.model, undefined, 4);
	$("#name_" + model.id).prop("defaultValue", model.name);
	$("#model_" + model.id).prop("defaultValue", modelStr);
}

function createOneBlockOfStoredAttributes(attr) {
	var div_rc = document.getElementById("div_right_creator_attr");
	var div_created_attr = document.createElement("DIV");
	div_created_attr.classList.add("options_container_full_size_attr");
	div_rc.appendChild(div_created_attr);
	div_created_attr.innerHTML = `
		<div class='options_title'><p>` + attr.id + `</p></div>
		<form id='attr_created_` + attr.id + `' action='/attributes/` + attr.id + `' method='post'>
			<p style="display:none;">` + attr.id + `</p>
			<div class='middle'>
				<span class='title_element_attr'><strong>Name:</strong></span>
				<span class='select_element'>
					<input class='input_text_normal glowing_border_normal' type='text' name='name' id=name_` + attr.id + `>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element_attr'><strong>Model</strong></span>
				<span class='select_element'>
					<select id="creator_models_` + attr.id + `" class='select_apply creator_models input_select_long glowing_border_normal' name='model_selection' onchange="updateAttributesOfCreatedAttribute(this)"></select>
				</span>
			</div>
			<div class="table_inside">
				<div class="middle">
					<div>
						<table id="table_` + attr.id + `" class="table_same_size" onchange="putSelectModelsToDefault(this)">
							<thead>
								<tr>
									<th>Id</th>
									<th class="medium_cell">Type</th>
									<th class="small_cell">Weight</th>
									<th></th>
								</tr>
							</thead>
							<tbody class="tbody_scroll">
								<tr class="attr_row">
									<td>
										<input class="text_overflow_right" type="text" name="attr_id">
									</td>
									<td class="medium_cell">
										<select name="attr_type">
											<option disabled selected style="display:none;"></option>
											<option value="-1">No type</option>
											<option value="0">Discrete</option>
											<option value="1">Numeric</option>
											<option value="5">Timestamp</option>
										</select>
									</td>
									<td class="small_cell">
										<input type="number" name="attr_weight" class="input_number input_number_attr" min="0" max="99">
									</td>
									<td>
										<button type="button" onclick='putSelectModelsToDefault(this); deleteRow(this);'><img src="">x</button>
									</td>
								</tr>
							</tbody>
							<tfoot>
								<tr>
									<td colspan="4">
										<button type="button" onclick='addRow(this); putSelectModelsToDefault(this);'><img src="">+</button>
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</div>
			<div class='middle button_container'>
				<button class='button_default glowing_border_normal' type='button' onclick="form2default(this)">Clear</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("attr_created_` + attr.id + `","` + attr.id +`","delete_` + attr.id +`","attributes","check_delete")'>Delete</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("attr_created_` + attr.id + `","` + attr.id +`","update_` + attr.id +`","attributes","check_update")'>Update</button>
				<button class='button_default glowing_border_normal' type='button' onclick='form2formAttributes(this)'>Copy</button>

				<button id="delete_` + attr.id + `" type='submit' name='action' value='delete' style="display:none;"></button>
				<button id="update_` + attr.id + `" type='submit' name='action' value='update' style="display:none;"></button>
			</div>
		</form>
	`;
	//	Default values text
	attr.name = attr.name == null ? "" : attr.name;
	$("#name_" + attr.id).prop("defaultValue", attr.name);
	//	Afegir els model select disponibles
	createSelectModelsOfCreatedAttribute(attr.id);
	//	Posar per defecte el model original de l'atribut en qüestió
	updateAttributesOfCreatedAttribute(document.getElementById("creator_models_" + attr.id));
}

function form2default(elem) {
	$(elem).closest('form').get(0).reset();
	var idAttribute = $(elem).closest('form').find("p").get(0).innerHTML;
	var table = $(elem).closest('form').find('table').get(0);
	deleteAllRows(table);
	updateAttributesOfCreatedAttribute(document.getElementById("creator_models_" + idAttribute));
}

function updateSelectModels() {
	sendPost("/models/all",null,createSelectModels,"application/json");
}

function createSelectModels(data, type) {
	//	Actualitzem la variable global models com a mapa amb claus d'id del model
	models = {};
	for (var i=0; i<data.length; i++) {
		var modelId = data[i].id;
		models[modelId] = data[i];
	}
	//	Creem les opcions
	var sel = document.getElementById("creator_models");
	var option = document.createElement("option");
	option.text = "-- Customized attributes --";
	option.value = "";
	sel.add(option);
	for (let modelId in models) {
		var option = document.createElement("option");
		option.text = models[modelId].name;
		option.value = models[modelId].id;
		sel.add(option);
	}
	sel.addEventListener('change', updateAttributes, false);
	updateCreatedAttributes();
}

function createSelectModelsOfCreatedAttribute(idCreatedAttribute) {
	//	Creem les opcions
	var sel = document.getElementById("creator_models_" + idCreatedAttribute);
	var option = document.createElement("option");
	option.text = "-- Actual attributes --";
	option.value = "_______________actual_attributes_______________";
	sel.add(option);
	var option = document.createElement("option");
	option.text = "-- Customized attributes --";
	option.value = "";
	sel.add(option);
	for (let modelId in models) {
		var option = document.createElement("option");
		option.text = models[modelId].name;
		option.value = models[modelId].id;
		sel.add(option);
	}
}

function updateAttributesOfCreatedAttribute(selectModel) {
	var selectedModelId = selectModel.options[selectModel.selectedIndex].value;
	$(selectModel).closest('form').find('.attr_row').remove();
	if (selectedModelId === "_______________actual_attributes_______________") {
		var idAttribute = $(selectModel).closest('form').find("p").get(0).innerHTML;
		//	Hem d'aconseguir l'identificador actual de l'atribut
		var defaultAttributes = attributes[idAttribute];
		for (var i=0; i<defaultAttributes.length; i++) {
			var actualAttr = defaultAttributes[i];
			var newRow = createRowAttribute(actualAttr.id,actualAttr.type,actualAttr.weight);
			$(selectModel).closest('form').find('tbody').append(newRow);
		}
	}
	else if (selectedModelId === "") {
		//	Esborrar tot i posar una sola linia (ok)
		//$(selectModel).closest('table').find('tbody').append(newRow);
		var lastTR = $(selectModel).closest('form').find('tr').last();
		addRow(lastTR);
	}
	else {
		var selectedModel = models[selectedModelId];
		var defaultAttributes = selectedModel.defaultAttributes;
		defaultAttributes.sort((a, b) => (a.id).localeCompare(b.id));
		for (var i=0; i<defaultAttributes.length; i++) {
			var actualAttr = defaultAttributes[i];
			var newRow = createRowAttribute(actualAttr.id,actualAttr.type,actualAttr.weight);
			$(selectModel).closest('form').find('tbody').append(newRow);
		}
	}
	setInputNumber();
}

function updateAttributes() {
	//	triggered select = this;
	var selectedModelId = this.options[this.selectedIndex].value;
	//	Clear all table
	$(this).closest('form').find('.attr_row').remove();
	//	Add rows with info
	if (selectedModelId === "") {
		var lastTR = $("#attr_to_create table tr").last();
		addRowCreator(lastTR);
	}
	else {
		var selectedModel = models[selectedModelId];
		var defaultAttributes = selectedModel.defaultAttributes;
		defaultAttributes.sort((a, b) => (a.id).localeCompare(b.id));
		for (var i=0; i<defaultAttributes.length; i++) {
			var actualAttr = defaultAttributes[i];
			var newRow = createRowAttribute(actualAttr.id,actualAttr.type,actualAttr.weight);
			$("#attr_to_create").find('tbody').append(newRow);
		}
	}
	setInputNumber();
}

function createRowAttribute(attrId, attrType, attrWeight) {
	var selectType = createSelect(["No type", "Discrete", "Numeric", "Timestamp"], ["-1", "0", "1", "5"], attrType);
	selectType.name = "attr_type";
	selectType.value = "";
	selectType.classList.add("select_apply_creator");
	var newRow = `
		<tr class="attr_row">
			<td class="large_cell">
				<input name="attr_id" class="text_overflow_right input_apply_creator" type="text" value="` + attrId + `">
			</td>
			<td class="medium_cell select_cell">` + selectType.outerHTML + `</td>
			<td class="small_cell">
				<input type="number" name="attr_weight" class="input_number input_number_attr input_apply_creator" min="0" max="99" value=` + attrWeight + `>
			</td>
			<td>
				<button type="button" onclick='putSelectModelsToDefault(this); deleteRow(this);' class='attr_delete_row_creator'><img src="">x</button>
			</td>
		</tr>
	`
	return newRow;
}

function createSelect(textOptions, valueOptions, selectedValue) {
	var selectList = document.createElement("select");
	var opt = document.createElement("option");
	opt.defaultSelected = true;
	opt.disabled = true;
	opt.style.display = 'none';
	selectList.appendChild(opt);
	for (var i=0; i<textOptions.length; i++) {
		opt = document.createElement("option");
		opt.value = valueOptions[i];
		opt.text = textOptions[i];
		if (selectedValue != null && opt.value === selectedValue.toString())
			opt.defaultSelected = true;
		selectList.appendChild(opt);
	}
	return selectList;
}

function form2formAttributes(elemFrom) {
	var idAttributeFrom = $(elemFrom).closest('form').find("p").get(0).innerHTML;
	var inputNameFrom = document.getElementById("name_" + idAttributeFrom);
	var selectModelFrom = document.getElementById("creator_models_" + idAttributeFrom);
	var tableFrom = document.getElementById("table_" + idAttributeFrom);
	var inputNameTo = document.getElementById("creator_name");
	var selectModelTo = document.getElementById("creator_models");
	var tableTo = document.getElementById("creator_table");

	//	Copiar el nom
	inputNameTo.value = inputNameFrom.value;
	//	Copiar el select
	selectModelTo.selectedIndex = selectModelFrom.selectedIndex == 0 ? 0 : selectModelFrom.selectedIndex-1;
	//	Copiar la taula d'atributs
	table2table(tableFrom,tableTo);

	//	Actualitzar el check del create
	checkAbleCreateCreator();
}

function table2table(tableFrom,tableTo) {
	//	Clear all table
	$(tableTo).find(".attr_row").remove();
	//	Copy each row
	$(tableFrom).find(".attr_row").each(function (index) {
		var attrId = $(this).find('[name ="attr_id"]').val();
		var attrType = $(this).find('[name ="attr_type"]').val();
		var attrWeight = $(this).find('[name ="attr_weight"]').val();
		var newRow = createRowAttribute(attrId,attrType,attrWeight);
		$(tableTo).closest('table').find('tbody').append(newRow);
	});
	setInputNumber();
	checkAbleCreateCreator();
}

function putSelectModelsToDefault(elem) {
	var selectElem = $(elem).closest('form').find('.creator_models');
	selectElem.val("");
}

function updateAgents() {
	sendPost("/agents/options",null,updateAvailableInfoAgents,"application/json");
}

function updateAvailableInfoAgents(data) {
	//	Actualitzar la informacio de les variables globals
	options_agent = data;

    //  Guardem el que hem rebut a una variable global
	attributes_agent = {};
	for (var i=0; i<options_agent.attributes.length; i++) {
		var attr = options_agent.attributes[i];
	}

	//	Actualitzar la informacio dels select
	var sel_default_attributes = $('#agent_to_create [name ="default_attributes"]').get(0);
	var sel_default_cbr = $('#agent_to_create [name ="default_cbr"]').get(0);
	var sel_default_populations = $('#agent_to_create [name ="default_populations"]').get(0);

	updateSelect(sel_default_attributes,options_agent.attributes);
	sel_default_attributes.selectedIndex = -1;
	updateSelect(sel_default_cbr,options_agent.configurations);
	sel_default_cbr.selectedIndex = -1;
	updateSelect(sel_default_populations,options_agent.populations);
	sel_default_populations.selectedIndex = -1;

	sel_default_attributes.addEventListener('change',function(){
		updateWithAttributes("attributes_depended");
	},false);
	//	Fer una crida al servidor per obtenir els agents creats
	sendPost("/agents/all",null,createStoredAgents,"application/json");
}

function updateWithAttributes(idDiv) {
	document.getElementById(idDiv).style.display='block';
	var sel_class_attributes = $('#agent_to_create [name ="class_attributes"]').get(0);
	var sel_individual_key = $('#agent_to_create [name ="individual_key"]').get(0);
	var sel_attribute_key = $('#agent_to_create [name ="attribute_key"]').get(0);
	var sel_configuration_key = $('#agent_to_create [name ="configuration_key"]').get(0);
	var sel_population_key = $('#agent_to_create [name ="population_key"]').get(0);
	var sel_default_attributes = $('#agent_to_create [name ="default_attributes"]').get(0);
	var selectedIndexAttr = sel_default_attributes.selectedIndex-1;
	$(sel_class_attributes).find('option').remove();
	$(sel_individual_key).find('option:not(:first)').remove();
	$(sel_attribute_key).find('option:not(:first)').remove();
	$(sel_configuration_key).find('option:not(:first)').remove();
	$(sel_population_key).find('option:not(:first)').remove();

	if (selectedIndexAttr >= 0) {
		updateSelectClassAttributes(sel_class_attributes,options_agent.attributes[selectedIndexAttr].attributes);
		updateSelectKeys(sel_individual_key,options_agent.attributes[selectedIndexAttr].attributes);
		sel_individual_key.selectedIndex = -1;
		updateSelectKeys(sel_attribute_key,options_agent.attributes[selectedIndexAttr].attributes);
		sel_attribute_key.selectedIndex = 0;
		updateSelectKeys(sel_configuration_key,options_agent.attributes[selectedIndexAttr].attributes);
		sel_configuration_key.selectedIndex = 0;
		updateSelectKeys(sel_population_key,options_agent.attributes[selectedIndexAttr].attributes);
		sel_population_key.selectedIndex = 0;
	}
}

function updateSelectKeys(selectElem,data) {
	for (var i=0; i<data.length; i++) {
		var option = document.createElement("option");
		option.text = data[i].id;
		option.value = data[i].id;
		selectElem.add(option);
	}
}

function updateSelectClassAttributes(selectElem,data) {
	for (var i=0; i<data.length; i++) {
		if (data[i].type == 1) {
			var option = document.createElement("option");
			option.text = data[i].id;
			option.value = data[i].id;
			selectElem.add(option);
		}
	}
}

function updateSelect(selectElem,data) {
	for (var i=0; i<data.length; i++) {
		var option = document.createElement("option");
		option.text = data[i].name;
		option.value = data[i].id;
		selectElem.add(option);
	}
}

function createStoredAgents(data) {
	for (var i=0; i<data.length; i++)
		createOneBlockOfStoredAgent(data[i]);
	document.getElementById('div_buffer').style.visibility = 'hidden';
	document.getElementById('div_buffered').style.visibility = 'visible';
}

function createOneBlockOfStoredAgent(agent) {
	var div_rc = document.getElementById("div_right_creator");
	var div_created_agent = document.createElement("DIV");
	div_created_agent.classList.add("options_container_full_size");
	div_rc.appendChild(div_created_agent);
	var button_class = agent.isDefaultAgent ? "button_default_agent_active" : "button_default_agent";
	div_created_agent.innerHTML = `
		<div class='options_title'><p>` + agent.id + `</p><div id='default_agent_` + agent.id + `' class='div_button_default_agent'><div class="` + button_class + `"></div></div></div>
		<form id='agent_created_` + agent.id + `' action='/agents/` + agent.id + `' method='post'>
			<p style="display:none;">` + agent.id + `</p>
			<div class='middle'>
				<span class='title_element'><strong>Name:</strong></span>
				<span class='select_element'>
					<input class='input_text_normal glowing_border_normal' type='text' name='name'>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Default CBR:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='default_cbr'>
						<option val="" disabled selected style="display:none;"></option>
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Default Populations:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='default_populations'>
						<option val="" disabled selected style="display:none;"></option>
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Default Attributes:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='default_attributes'>
						<option val="" disabled selected style="display:none;"></option>
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Classes:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_multiple' name='class_attributes' multiple="multiple">
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Individual Key:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='individual_key'></select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Attribute Key:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='attribute_key'>
						<option value="" selected>-- Use Default Attributes --</option>
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>CBR Key:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='configuration_key'>
						<option value="" selected>-- Use Default CBR --</option>
					</select>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Population Key:</strong></span>
				<span class='select_element'>
					<select class='select_apply glowing_border_normal input_select_normal' name='population_key'>
						<option value="" selected>-- Use Default Population --</option>
					</select>
				</span>
			</div>

			<div class='middle button_container'>
				<button class='button_default glowing_border_normal' type='reset' name='action' value='clear'>Clear</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("agent_created_` + agent.id + `","` + agent.id +`","delete_` + agent.id +`","agents","check_delete")'>Delete</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("agent_created_` + agent.id + `","` + agent.id +`","update_` + agent.id +`","agents","check_update")'>Update</button>
				<button class='button_default glowing_border_normal' type='button' onclick='copyToCreatorAgent("agent_created_` + agent.id + `", "agent_to_create")'>Copy</button>

				<button id="delete_` + agent.id + `" type='submit' name='action' value='delete' style="display:none;"></button>
				<button id="update_` + agent.id + `" type='submit' name='action' value='update' style="display:none;"></button>
			</div>
		</form>
	`;
	var formElemId = "agent_created_" + agent.id;

	var sel_default_attributes = $('#' + formElemId + ' [name ="default_attributes"]').get(0);
	var sel_default_cbr = $('#' + formElemId + ' [name ="default_cbr"]').get(0);
	var sel_default_populations = $('#' + formElemId + ' [name ="default_populations"]').get(0);
	var sel_class_attributes = $('#' + formElemId + ' [name ="class_attributes"]').get(0);
	var sel_individual_key = $('#' + formElemId + ' [name ="individual_key"]').get(0);
	var sel_attribute_key = $('#' + formElemId + ' [name ="attribute_key"]').get(0);
	var sel_configuration_key = $('#' + formElemId + ' [name ="configuration_key"]').get(0);
	var sel_population_key = $('#' + formElemId + ' [name ="population_key"]').get(0);

	//
	if (!agent.isDefaultAgent) {
		var url = "/default/" + agent.id;
		document.getElementById("default_agent_" + agent.id).addEventListener("click", function() {
			setDefaultAgent(this);
		});
	}

	//	Posem el nom de l'agent com a valor per defecte
	$('#' + formElemId + ' [name ="name"]').prop("defaultValue", agent.name);

	//	Crear select amb tots els valors
	updateSelect(sel_default_attributes,options_agent.attributes);
	updateSelect(sel_default_cbr,options_agent.configurations);
	updateSelect(sel_default_populations,options_agent.populations);

	//	Posar valors per defecte als select
	$(sel_default_attributes).find('option[value="' + agent.defaultAttributes + '"]').attr("selected",true);
	$(sel_default_cbr).find('option[value="' + agent.defaultConfiguration + '"]').attr("selected",true);
	$(sel_default_populations).find('option[value="' + agent.defaultPopulation + '"]').attr("selected",true);

	//	Crear la resta de selects amb els valors que indiqui l'atribut seleccionat
	var selectedIndexAttr = sel_default_attributes.selectedIndex-1;
	updateSelectClassAttributes(sel_class_attributes,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_individual_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_attribute_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_configuration_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_population_key,options_agent.attributes[selectedIndexAttr].attributes);

	//	Posar valors per defecte al select indicat
	$(sel_individual_key).find('option[value="' + agent.keyId + '"]').attr("selected",true);
	$(sel_attribute_key).find('option[value="' + agent.keyAttributes + '"]').attr("selected",true);
	$(sel_configuration_key).find('option[value="' + agent.keyConfiguration + '"]').attr("selected",true);
	$(sel_population_key).find('option[value="' + agent.keyPopulation + '"]').attr("selected",true);
	for (var i=0; i<agent.classAttributes.length; i++) {
		var classAttribute = agent.classAttributes[i];
		$(sel_class_attributes).find('option[value="' + classAttribute + '"]').attr("selected",true);
	}
}

function setDefaultAgent(obj) {
	var agentId = obj.id.split("_")[2];
	var baseUrl = "/agents";
	var url = baseUrl + "/default/" + agentId;
	sendPostWithoutResponse(url,null,reloadPage,"application/json");
}

function reloadPage() {
	location.reload();
}

function checkAbleCreateAgent() {
	var name = $('#agent_to_create_name').val();
	var default_cbr = $('#agent_to_create_default_cbr').val();
	var default_populations = $('#agent_to_create_default_populations').val();
	var default_attributes = $('#agent_to_create_default_attributes').val();
	var class_attributes = $('#agent_to_create_class_attributes').val();
	var individual_key = $('#agent_to_create_individual_key').val();
	var attribute_key = $('#agent_to_create_attribute_key').val();
	var cbr_key = $('#agent_to_create_cbr_key').val();
	var population_key = $('#agent_to_create_population_key').val();

	var indispensables = [
		default_cbr,
		default_populations,
		default_attributes,
		class_attributes,
		individual_key
	];

	document.getElementById("create_button_agent").disabled=false;
	for (var i=0; i<indispensables.length; i++) {
		if (indispensables[i] == null || indispensables[i] === "") {
			document.getElementById("create_button_agent").disabled=true;
			break;
		}
	}
}

function clearCreatorAgent(elem) {
	//
	var elemForm = $(elem).closest('form').get(0);
	var elemFormId = elemForm.id;
	var input_name = $('#' + elemFormId + ' [name ="name"]').get(0);
	var sel_default_cbr = $('#' + elemFormId + ' [name ="default_cbr"]').get(0);
	var sel_default_populations = $('#' + elemFormId + ' [name ="default_populations"]').get(0);
	var sel_default_attributes = $('#' + elemFormId + ' [name ="default_attributes"]').get(0);
	var sel_class_attributes = $('#' + elemFormId + ' [name ="class_attributes"]').get(0);
	var sel_individual_key = $('#' + elemFormId + ' [name ="individual_key"]').get(0);
	var sel_attribute_key = $('#' + elemFormId + ' [name ="attribute_key"]').get(0);
	var sel_configuration_key = $('#' + elemFormId + ' [name ="configuration_key"]').get(0);
	var sel_population_key = $('#' + elemFormId + ' [name ="population_key"]').get(0);
	//
	var selectedIndexAttr = sel_default_attributes.selectedIndex;
	//
	$(sel_class_attributes).find('option').remove();
	$(sel_individual_key).find('option:not(:first)').remove();
	$(sel_attribute_key).find('option:not(:first)').remove();
	$(sel_configuration_key).find('option:not(:first)').remove();
	$(sel_population_key).find('option:not(:first)').remove();
	//
	input_name.value = "";
	sel_default_cbr.selectedIndex = -1;
	sel_default_populations.selectedIndex = -1;
	sel_default_attributes.selectedIndex = -1;
	//
	$(elemForm).find('.attributes_depended').css("display","none");
}

function copyToCreatorAgent(idOriginal,idCopy) {
	var formOriginal = document.getElementById(idOriginal);
	var formCopy = document.getElementById(idCopy);
	$(formCopy).find('.attributes_depended').css("display","block");
	form2formAgent(formOriginal,formCopy);
}

function form2formAgent(formA, formB) {
	var sel_default_attributes_formA = $('#' + formA.id + ' [name ="default_attributes"]').get(0);
	var sel_default_attributes = $('#' + formB.id + ' [name ="default_attributes"]').get(0);
	var sel_class_attributes = $('#' + formB.id + ' [name ="class_attributes"]').get(0);
	var sel_individual_key = $('#' + formB.id + ' [name ="individual_key"]').get(0);
	var sel_attribute_key = $('#' + formB.id + ' [name ="attribute_key"]').get(0);
	var sel_configuration_key = $('#' + formB.id + ' [name ="configuration_key"]').get(0);
	var sel_population_key = $('#' + formB.id + ' [name ="population_key"]').get(0);
	//
	$(sel_class_attributes).find('option').remove();
	$(sel_individual_key).find('option:not(:first)').remove();
	$(sel_attribute_key).find('option:not(:first)').remove();
	$(sel_configuration_key).find('option:not(:first)').remove();
	$(sel_population_key).find('option:not(:first)').remove();
	//
	var selectedIndexAttr = sel_default_attributes_formA.selectedIndex-1;
	updateSelectClassAttributes(sel_class_attributes,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_individual_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_attribute_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_configuration_key,options_agent.attributes[selectedIndexAttr].attributes);
	updateSelectKeys(sel_population_key,options_agent.attributes[selectedIndexAttr].attributes);
    $(':input[name]', formA).each(function() {
		if ($(this).attr('name') !== "action") {
			$('[name=' + $(this).attr('name') +']', formB).val($(this).val())
		}
    });
	checkAbleCreateAgent();
}

function updatePopulations() {
	sendPost("/populations/all",null,createStoredPopulations,"application/json");
}

function createStoredPopulations(data) {
	for (var i=0; i<data.length; i++)
		createOneBlockOfStoredPopulation(data[i]);
	document.getElementById('div_buffer').style.visibility = 'hidden';
	document.getElementById('div_buffered').style.visibility = 'visible';
}

function createOneBlockOfStoredPopulation(population) {
	var div_rc = document.getElementById("div_right_creator");
	var div_created_population = document.createElement("DIV");
	div_created_population.classList.add("options_container_full_size");
	var individuals_size = population['individuals'] == null ? 0 : population['individuals'].length;
	div_rc.appendChild(div_created_population);
		div_created_population.innerHTML = `
		<div class='options_title'><p>` + population.id + `</p></div>
		<form id='population_created_` + population.id + `' action='/populations/` + population.id + `' method='post'>
			<div class='middle'>
				<span class='title_element'><strong>Name:</strong></span>
				<span class='select_element'>
					<input class='input_text_normal glowing_border_normal' type='text' name='name' onchange='checkAbleCreate()'>
				</span>
			</div>
			<div class='middle'>
				<span class='title_element'><strong>Total individuals:</strong></span>
				<span class='select_element'>
					<input class='input_text_normal input_text_no_modificable' type='text' name='num_individuals' readonly tabindex='-1'>
				</span>
			</div>
			<input type='text' name='pop_individuals' value='' style='display:none;'>
			<div class='middle button_container'>
				<button class='button_default glowing_border_normal' type='reset' name='action' value='clear'>Clear</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("population_created_` + population.id + `","` + population.id +`","delete_` + population.id +`","populations","check_delete")'>Delete</button>
				<button class='button_default glowing_border_normal' type='button' onclick='sendFormRecieveJson("population_created_` + population.id + `","` + population.id +`","update_` + population.id +`","populations","check_update")'>Update</button>
				<button class='button_default glowing_border_normal' type='button' onclick='copyToCreator("population_created_` + population.id + `", "population_to_create")'>Copy</button>

				<button id="delete_` + population.id + `" type='submit' name='action' value='delete' style="display:none;"></button>
				<button id="update_` + population.id + `" type='submit' name='action' value='update' style="display:none;"></button>
			</div>
		</form>
	`;
	var formElemId = "population_created_" + population.id;

	//	Posem el nom de la population com a valor per defecte
	$('#' + formElemId + ' [name ="name"]').prop("defaultValue", population.name);

	//	Posem el nombre d'individus com a valor per defecte
	$('#' + formElemId + ' [name ="num_individuals"]').prop("defaultValue", individuals_size);

	//	Posem el nombre d'individus com a valor per defecte
	$('#' + formElemId + ' [name ="pop_individuals"]').prop("defaultValue", population.id);
}