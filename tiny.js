var output = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE course SYSTEM "nomadCourse.dtd">\n';

function buildOutput(){
	var type = "remote";
	var cname = $('#course-name').val();	
	var cinfo = $('#course-info').val();
	var author = $('#author').val();
	var introduction = $('#introduction').val();
	var content = $('#content').val();
	var summary = $('#summary').val();
	
	output += '<course type="'+type+'">\n';
	output += '\t<name><![CDATA[' + cname + ']]></name>\n';
	output += '\t<info><![CDATA[' + cinfo + ']]></info>\n';
	output += '\t<author_id><![CDATA[' + author + ']]></author_id>\n';
	output += '\t<introduction><![CDATA[' + introduction + ']]></introduction>\n'
	output += '\t<base_module>\n';
	output += '\t'+ content +'\n';
	output += '\t</base_module>\n';
	output += '\t<summary><![CDATA[' + summary + ']]></summary>\n'
	output += '</course>';
};

tinyMCE.init({
			plugins: ["advlist anchor autoresize charmap code directionality emoticons fullscreen hr nonbreaking paste preview print wordcount searchreplace save table visualchars visualblocks textcolor"],	
			extended_valid_elements : 'lesson,screen',
			custom_elements: 'lesson,screen',
			toolbar1: "ltr rtl | emoticons | nonbreaking | preview |  searchreplace | visualchars | forecolor backcolor | fullscreen | ",
			toolbar2: "Nomad  | save",			
			language: 'pl',
			content_css : "style.css",
			save_enablewhendirty: true,
			save_onsavecallback: function() {
			buildOutput();			
			var blob = new Blob([output], {type: "text/plain;charset=utf-8"});
			var cname = $('#course-name').val();
			saveAs(blob, cname);
			},
			selector: '#content', 
			nonbreaking_force_tab: true,
			setup: function(editor) {
				editor.addButton('Nomad', {
            type: 'menubutton',
            text: 'Nomad',
            icon: false,
            menu: [
                {text: 'Lekcja', onclick: function() {editor.insertContent('<lesson>---Lekcja---</lesson>');}},
                {text: 'Ekran', onclick: function() {editor.insertContent('<screen>---Ekran---</screen>');}}
            ]
        });
    }
			});
			
$(document).ready(function(){
});