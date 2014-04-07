var output = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE course SYSTEM "nomadCourse.dtd">\n';
var screenId = '0';
var lessonId;
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

function prepareContent(){
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
		$('#screen-buttons').append('<button id="add-screen">+</button>');
		}
		$('#add-screen')
		.unbind( "click" )
		.click(function(ev){
			ev.preventDefault();
			addScreen(lessonId, screenId+1);
			});;
		$('.btn-screen').each(function(ev){
		$(this).click(function(ev) {
			screens = JSON.parse(localStorage.getItem(lessonId));
			ev.preventDefault();
			screenId=this.id;
			currentEditor.setContent(screens[screenId]);
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
	currentEditor.setContent("");
	$('#screen-buttons').children().remove(); 
	retriveScreens(lessonId);
}

tinyMCE.init({
			plugins: ["advlist anchor autoresize charmap code directionality emoticons fullscreen hr nonbreaking paste preview print wordcount searchreplace save table visualchars visualblocks textcolor"],	
			extended_valid_elements : 'tquestion,cquestion,stitle,text,content,answer,answers,feedback',
			custom_elements: 		  'tquestion,cquestion,stitle,text,content,answer,answers,feedback',
			toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons | save | ",
			toolbar2: "addTestQuestion | addControlQuestion | addAnswer | addFeedback",			
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
					editor.addButton('addTestQuestion', {
						text: 'Pytanie testowe',
						icon: false,
						onclick: function() {					
							editor.insertContent('<tquestion><hr><br><content>treść pytania</content><br><answers>Tutaj można dodawać odpowiedzi</answers></tquestion>')},
					});
					editor.addButton('addControlQuestion', {
						text: 'Pytanie kontrolne',
						icon: false,
						onclick: function() {					
							editor.insertContent('<cquestion><hr><br><content>treść pytania</content><br>Tutaj można dodawać odpowiedzi</cquestion>')},
					});
					editor.addButton('addAnswer', {
						text: 'Dodaj odpowiedź',
						icon: false,
						onclick: function() {					
							editor.insertContent('<answer>treść odpowiedzi</answer><br>')},
					});
					editor.addButton('addFeedback', {
						text: 'Wstaw feedback',
						icon: false,
						onclick: function() {					
							editor.insertContent('<feedback>treść pytania</feedback><br>')},
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
$('button').click(function () {
  currentEditor.execCommand('contentReadOnly');
  $(this).css('border', '1px solid red');
});	
});