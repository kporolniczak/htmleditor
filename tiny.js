var output = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE course SYSTEM "nomadCourse.dtd">\n';
var screenId = '0';
var lessonId = 'less0';
var currentEditor;
	
function buildOutput(){
	var type = "remote";
	var cname = $('#course-name').val();	
	var cinfo = $('#course-info').val();
	var author = $('#author').val();
	var introduction = $('#introduction').val();
	var content = prepareContent();
	var summary = $('#summary').val();
	
	output += '<course type="'+type+'">\n';
	output += '\t<name><![CDATA[' + cname + ']]></name>\n';
	output += '\t<info><![CDATA[' + cinfo + ']]></info>\n';
	output += '\t<author_id><![CDATA[' + author + ']]></author_id>\n';
	output += '\t<introduction><![CDATA[' + introduction + ']]></introduction>\n'
	output += '\t<base_module>\n';
	output += content;
	output += '\t</base_module>\n';
	output += '\t<summary><![CDATA[' + summary + ']]></summary>\n'
	output += '</course>';
};

function prepareContentOld(){
	var content = $('#content').val();
	//obcinamy wszystko co jest poza lekcjami
	content = content.substring(content.indexOf('<lesson>'),content.lastIndexOf('</lesson>')+9);
	content = content.replace(new RegExp('<lesson><hr /><screen>', "g"), '<lesson>\n<screen>\n');
	content = content.replace(new RegExp('stitle>', "g"), 'title>');
	content = content.replace(/(<\/title>)(.*?)(<text>)/g, '</title>\n<text>');
	content = content.replace(/(<\/screen>)(.*?)(<\/lesson>)/g, '\n</screen>\n</lesson>\n');
	//wcięcia i CDATA
	content = content.replace(new RegExp('<lesson>', "g"), '\t\t<lesson>');
	content = content.replace(new RegExp('</lesson>', "g"), '\t\t</lesson>');
	content = content.replace(new RegExp('<screen>', "g"), '\t\t\t<screen>');
	content = content.replace(new RegExp('</screen>', "g"), '\t\t\t</screen>');
	content = content.replace(new RegExp('<title>', "g"), '\t\t\t\t<title><![CDATA[');
	content = content.replace(new RegExp('</title>', "g"), ']]></title>');
	content = content.replace(new RegExp('<text>', "g"), '\t\t\t\t<text><![CDATA[');
	content = content.replace(new RegExp('</text>', "g"), ']]></text>');
	return content;
}

function prepareContent(){
	var lessons = JSON.parse(localStorage.getItem('lessons'));
	var content = "";
	for (var i=0; i<lessons.length; i++){
		content += '\t\t<lesson>\n\t\t\t\t<name><![CDATA[' + lessons[i] + ']]></name>\n';
		var screens = JSON.parse(localStorage.getItem('less'+i));
			for(var j=0; j<screens.length; j++){
				content+='\n\t\t\t\t<screen>\n\t\t\t\t\t' + screens[j] + '\n\t\t\t\t</screen>\n';
			}
		content += '\t\t</lesson>\n';
	}
	content = content.replace(new RegExp('stitle>', "g"), 'title>');
	return content;
}

function storeData() {
		localStorage.setItem('course-name',JSON.stringify($('#course-name').val()));
		localStorage.setItem('course-info',JSON.stringify($('#course-info').val()));
		localStorage.setItem('author',JSON.stringify($('#author').val()));
		localStorage.setItem('introduction',JSON.stringify($('#introduction').val()));
		localStorage.setItem('summary',JSON.stringify($('#summary').val()));
};

function storeScreens() {
		var screens = JSON.parse(localStorage.getItem(lessonId));
		var content = currentEditor.getContent();
		screens[screenId] = content;
		localStorage.setItem(lessonId,JSON.stringify(screens));
};

function retrieveData(lessonId) {
		for (var i = 0; i < localStorage.length; i++){
			var element = localStorage.key(i);
			$('#'+element).val(JSON.parse(localStorage.getItem(element)));
		}
		var lessons = JSON.parse(localStorage.getItem('lessons'));
		var select = document.getElementById("lessons");
		$('#lessons').children().remove(); 		
		$('#lessons').append('<option value="no-lesson">-----</option>')
		if(lessons == null) lessons=0;
		for(var i = 0; i<lessons.length; i++){
			var option = document.createElement('option');
			option.text = lessons[i];
			option.value = "less"+i;
			select.add(option, 0);
		}
		$('#lessons').append('<option value="add-lesson">Dodaj lekcję</option>');
		$('#lessons > option[value="'+lessonId+'"]').attr("selected", "selected")
};

function retriveScreens(lessonId){
		
		var screens = JSON.parse(localStorage.getItem(lessonId));
		$('#screen-buttons').children().remove(); 
		if(screens == null) screens=0;
		for(var i = 0; i<screens.length; i++){
			$('#screen-buttons').append('<button class="btn-screen" id="'+i+'">'+(i+1)+'</button>');
		}
		if(lessonId!='no-lesson' && lessonId!='add-lesson'){
		$('#screen-buttons').prepend('<button id="remove-screen">usuń</button>');
		$('#screen-buttons').append('<button id="add-screen">+</button>');
		}
		$('#add-screen')
		.unbind( "click" )
		.click(function(ev){
			ev.preventDefault();
			addScreen(lessonId, screenId+1);
			});;
		$('#remove-screen')
		.unbind( "click" )
		.click(function(ev){
			ev.preventDefault();
			removeScreen(lessonId);
			});;
		$('.btn-screen').each(function(ev){
		$(this).click(function(ev) {
			screens = JSON.parse(localStorage.getItem(lessonId));
			ev.preventDefault();
			screenId=this.id;
			currentEditor.setContent(screens[screenId]);
			retriveScreens(lessonId);
		}); 
	});
	$('.btn-screen').click(function () {
		$('.btn-screen').each(function(){
			$(this).css('border', '1px solid black');
		});
		$(this).css('border', '1px solid red');
});	
}
function addLesson(){
	var title = prompt("Podaj nazwę lekcji","Nazwa ekranu");
	var lessons = JSON.parse(localStorage.getItem('lessons'));
	if(lessons == null) {
		var i=1;
		lessons = [title];
		}else{
	var i = lessons.length;
	lessons.push(title);	
	}
	localStorage.setItem('lessons',JSON.stringify(lessons));
	retrieveData('less'+i);
	retriveScreens('less'+i);
	currentEditor.setContent("");
}

function initContent(){
	var screens = JSON.parse(localStorage.getItem('less0'));
	if(screens) $('#content').text(screens[screenId]);	
}

function addScreen(lessonId){
	var screens = JSON.parse(localStorage.getItem(lessonId));
	if(screens == null) {
		var i=0;
		screens = [""];
		}else{
	var i = screens.length;
	screens.push("");
	}
	localStorage.setItem(lessonId,JSON.stringify(screens));
	screenId=i;
	currentEditor.setContent("<stitle>Tutaj wpisz tytuł ekranu</stitle><br><text>A tutaj tekścik</text><br>");
	storeScreens();
	$('#screen-buttons').children().remove(); 
	retriveScreens(lessonId);
}

function removeScreen(lessonId){
	screens = JSON.parse(localStorage.getItem(lessonId));
	currentEditor.setContent("");
	if (screenId > -1) {
		screens.splice(screenId, 1);
	}
	localStorage.setItem(lessonId,JSON.stringify(screens));
	retriveScreens(lessonId);
}

tinyMCE.init({
			plugins: ["advlist anchor autoresize charmap code directionality emoticons fullscreen hr nonbreaking paste preview print wordcount searchreplace save table visualchars visualblocks textcolor"],	
			extended_valid_elements : 'tquestion,cquestion,stitle,text,content,canswer,wanswer,answers,cfeedback,pfeedback,wfeedback',
			custom_elements: 		  'tquestion,cquestion,stitle,text,content,canswer,wanswer,answers,cfeedback,pfeedback,wfeedback',
			toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons | save | ",
			toolbar2: "addQuestion | addAnswer | addFeedback",			
			language: 'pl',
			content_css : "style.css",
			force_br_newlines : true,
			force_p_newlines : false,
			save_enablewhendirty: true,
			save_onsavecallback: function() {
			buildOutput();			
			var blob = new Blob([output], {type: "text/plain;charset=utf-8"});
			var cname = $('#course-name').val();
			saveAs(blob, cname+".xml");
			},
			selector: '#content', 
			mode : 'textareas',
			forced_root_block : false,
			nonbreaking_force_tab: true,
			setup: function(editor) {
					currentEditor = editor;
					editor.on('keyup', function(e) {
						storeScreens();
					});
					editor.on('BeforeExecCommand', function(e) {
					if(e.command == "mceNewDocument")
						$('input').val("");
						//localStorage.clear();
					});
					editor.addButton('addQuestion', {
						type: 'menubutton',
						text: 'Wstaw pytanie',
						icon: false,
						menu:
						[
								{
								text: 'Pytanie testowe', onclick: function() {						
									editor.insertContent('<tquestion><hr><br><content>treść pytania</content><br><answers>Tutaj można dodawać odpowiedzi<br></answers><br><hr></tquestion>')},
								},
								{
								text: 'Pytanie kontrolne', onclick: function() {						
									editor.insertContent('<cquestion><hr><br><content>treść pytania</content><br><answers>Tutaj można dodawać odpowiedzi<br></answers><br><hr></cquestion>')},
								}
							
						]
						});						
					editor.addButton('addAnswer', {
						type: 'menubutton',
						text: 'Dodaj odpowiedź',
						icon: false,
						menu: [
								{
								text: 'Poprawna odpowiedź', onclick: function() {						
									editor.insertContent('<canswer>treść odpowiedzi</canswer><br><p class="toRemove">-----------feedback---------------</p><br>')},
								},
								{
								text: 'Błędna odpowiedź', onclick: function() {						
									editor.insertContent('<wanswer>treść odpowiedzi</wanswer><br><p class="toRemove">-----------feedback---------------</p><br>')},
								}
							]
					});
					editor.addButton('addFeedback', {
						type: 'menubutton',
						text: 'Wstaw feedback',
						icon: false,
						menu:
						[
								{
								text: 'Odpowiedż poprawna', onclick: function() {						
									editor.insertContent('<cfeedback>feedback</cfeedback><br>')},
								},
								{
								text: 'Odpowiedż częściowo poprawna', onclick: function() {						
									editor.insertContent('<pfeedback>feedback</pfeedback><br>')},
								},
								{
								text: 'Odpowiedź błędna', onclick: function() {						
									editor.insertContent('<wfeedback>feedback</wfeedback><br>')},
								}
						]
					});
					}
			});
$(document).ready(function(){

	retrieveData('less0');	
	initContent();
	retriveScreens('less0');
	$(document).on('keyup', function(){
		storeData();
	});
	
	$('#lessons').change(function() {
		lessonId = $("#lessons option:selected").val();
		if(lessonId != null){
		retriveScreens(lessonId);
		}
		if(lessonId == 'add-lesson'){
			addLesson();
		}
	});	
});