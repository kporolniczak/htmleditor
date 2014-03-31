var output = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE course SYSTEM "nomadCourse.dtd">\n';

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

function retrieveData() {
		for (var i = 0; i < localStorage.length; i++){
			var element = localStorage.key(i);
			$('#'+element).val(JSON.parse(localStorage.getItem(element)));
		}
};

tinyMCE.init({
			plugins: ["advlist anchor autoresize charmap code directionality emoticons fullscreen hr nonbreaking paste preview print wordcount searchreplace save table visualchars visualblocks textcolor"],	
			extended_valid_elements : 'lesson,screen,stitle,text',
			custom_elements: 'lesson,screens,title,text',
			toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
			toolbar2: " print preview media | forecolor backcolor emoticons | Nomad  | save",			
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
					editor.on('keyup', function(e) {
						localStorage.setItem('content',JSON.stringify(editor.getContent()));
					});
					editor.on('BeforeExecCommand', function(e) {
					if(e.command == "mceNewDocument")
						$('input').val("");
						localStorage.clear()
					});
					editor.addButton('Nomad', {
						type: 'menubutton',
						text: 'Nomad',
						icon: false,
						menu: [
							{text: 'Lekcja', onclick: function() {					
							editor.insertContent('<lesson><hr><br><hr><br></lesson><br>');
							localStorage.setItem('content',JSON.stringify(editor.getContent()));}},
							{text: 'Ekran', onclick: function() {
							var title = prompt("Podaj nazwę ekranu","Nazwa ekranu");
							editor.insertContent('<screen><stitle>'+title+'</stitle><br><text>Zawartość ekranu</text></screen>');
							localStorage.setItem('content',JSON.stringify(editor.getContent()));}}
						]
					});
			}
			});
$(document).ready(function(){
	retrieveData();		
	prepareContent();
	$(document).on('keyup', function(){
		storeData();
	});
});