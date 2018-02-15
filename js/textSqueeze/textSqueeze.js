var sqz = window.sqz || {};
var wordFreqHashArray = [];

sqz.initialize = function(elem){

	//call space constructor on elem, then initialize functionality
	makeFindSpace(elem, function(){
	
		$.contextMenu({selector: '.'+elem, items: {
			label0: {name: "Text Squeeze"},
			process: {name: "Process", callback: function(key, opt){
				sqz.process();
			}},
			divider0: "-------",
			find: {name: "Search for...", type:'text', value:""},
			mark: {name: "Mark", callback: function(key, opt){
				//do marking here
			}},
			unmark: {name: "UnMark", callback: function(key, opt){
				//do marking here
			}},
			divider1: "-------",
			clear: {name: "Clear All", callback: function(key, opt){
				$("#textBucket").val("");
				$("#showDiv").html("");
			}},
			divider2: "-------",
			commonWords: {name: 'Common Words', type:'checkbox'},
			basicAdjectives: {name: 'Basic Adjectives', type:'checkbox'},
			adverbs: {name: 'Adverbs', type:'checkbox'},
			helpingVerbs: {name: 'Helping Verbs', type:'checkbox'},
			pronouns: {name: 'Pronouns', type:'checkbox'},
			prepositions: {name: 'Prepositions', type:'checkbox'},
			numberlike: {name: 'Numberlike', type:'checkbox'},
			all: {name: 'ALL', type:'checkbox'},
			reset: {name: "Reset", callback: function(key, opt){
				resetFilter();
			}},
			
			
		}});			

		$( "#sliderFreq" ).slider({
            min: -100,
            max: 100,
            value: 0,
            slide: function( event, ui ) {
                setFontSizeFromFreq(ui.value);
            }
        });

		$("#loadTarget").on("click", function(){
		
			var urlToSend = $("#targetUrl").val();
			//alert(urlToSend);
			
			if(urlToSend){
			
				var ajaxUrl = "/getUrl?target=" + urlToSend;
				$.ajax({
					url: ajaxUrl,
					success: function(data) {
						alert('Load was performed.');
						$("#textBucket").text("");
						$("#textBucket").text(data);
					},
					error: function(jqXHR, textStatus, errorThrown){
						alert('Load failed ' + errorThrown);
					}
				});			
				
			}
		
		});
		
		$("#makeWordCloud").on("click", function(){
		    getWordCloud();
		});

		
		$("#textUtility").on("click",function(){
		
		
		});

	});
}

sqz.process = function(){
		
	var wordHash = {};
	var wordArr = [];		

	var wordArr = $("#textBucket").val().split( /[\s,\.,\,,\-,\(,\),;,\!,\",\',\[,\],:,?,\/]+/ );
	
	//search each common list		
	$.each(wordArr,function(idx, wrd){
		
				
		if(wordHash[wrd]){
			wordHash[wrd].frequency = (wordHash[wrd].frequency + 1);
		}else{
		
			var classList = "word";
			var wordTypeNotFound = true;
			
			
			//look for basics
			if(wordTypeNotFound && InArray(wrd,wordType["commonWords"].words) > -1){
				classList = classList + " commonWords";
				wordTypeNotFound = false;					
			}
			if(wordTypeNotFound && InArray(wrd,wordType["basicAdjectives"].words) > -1){
				classList = classList + " basicAdjectives";
				wordTypeNotFound = false;
			}			
			if(wordTypeNotFound && InArray(wrd,wordType["adverbs"].words) > -1){
				classList = classList + " adverbs";
				wordTypeNotFound = false;
			}	
			if(wordTypeNotFound && InArray(wrd,wordType["helpingVerbs"].words) > -1){
				classList = classList + " helpingVerbs";
				wordTypeNotFound = false;
			}			
			if(wordTypeNotFound && InArray(wrd,wordType["pronouns"].words) > -1){
				classList = classList + " pronouns";
				wordTypeNotFound = false;
			}				
			if(wordTypeNotFound && InArray(wrd,wordType["prepositions"].words) > -1){
				classList = classList + " prepositions";
				wordTypeNotFound = false;
			}	
			if(wordTypeNotFound && InArray(wrd,wordType["numberlike"].words) > -1){
				classList = classList + " numberlike";
				wordTypeNotFound = false;
			}
			
			//look for literal numerics		
			if(wordTypeNotFound && IsNumeric(wrd)){
				classList = classList + " numberlike";
				wordTypeNotFound = false;
			}	
					
		
			wordHash[wrd] = {"classList":classList,"frequency":1};
		}

			
	});
	
	
	wordFreqHashArray =[];
	
	for (var key in wordHash) {
	    console.log(key, wordHash[key].classList, wordHash[key].frequency);
	    
	    if(wordHash[key].frequency > 2 && wordHash[key].classList == "word") {
	        var ptSize = wordHash[key].frequency*4;
	        wordFreqHashArray.push([key, ptSize]);
	    }
	}
	
	
	var c = [];
	$.each(wordArr,function(idx, wrd){
		
		var classList = wordHash[wrd].classList;
		if(wordHash[wrd].frequency < 10){
			classList = classList + " frequency" + wordHash[wrd].frequency;
		}else{
			classList = classList + " frequencyN";
		}
		
		c.push("<span class='" + classList + "'>" + wrd + "</span>");
	});
	
	

	$("#showDiv").html(c.join(' '));


}

function setFontSizeFromFreq(val){
	
	var freqFont = 0;
	var freqFontMax = 0;
	var enlarge = (val >= 0);
	
	//settings
	var freqFactor = 0.1;
	var freqBaseSize = 10;
	var freqFontMaxSpread = 20;
	var freqMaxFontAllowed = 35;
	
			
	var maxFreq = 10 + 1; //max number of freqs registered before N
	
	for(var freq = maxFreq; freq > 0; freq = freq-1){

		var freqClass = 'frequency';
		var freqVal = (enlarge ? freq : maxFreq-freq);
		freqFont = Math.floor(freqBaseSize + freqVal*freqFactor*Math.abs(val)); 
		
		if(freq == maxFreq){
			//handle as N
			freqClass = freqClass + 'N';
			freqFontMax = freqFont;		
		}else{
			//handle regularly
			freqClass = freqClass + freq;
		}

		
		//console.log(val, freqClass, freqVal, Math.floor(freqFont));
		//console.log(val, freqClass, freqFont, Math.abs(freqFontMax - freqFont), freqFontMaxSpread, Math.abs(freqFontMax - freqFont) > freqFontMaxSpread, freqFont <= freqFontMaxSpread);
		
		var vanish = false;
		if(enlarge){
			vanish = Math.abs(freqFontMax - freqFont) > freqFontMaxSpread;
		}
		
		if(vanish){
			//vanish
			$("."+freqClass).css("font-size", "0pt");
		}else{
			if(freqFont > freqMaxFontAllowed){
				//do not keep increasing font			
				$("."+freqClass).css("font-size", Math.floor(freqMaxFontAllowed) + "pt");
			}else{
				$("."+freqClass).css("font-size", Math.floor(freqFont) + "pt");
			}
		}
		
	}
	
	if(freqFontMax - freqFont > freqFontMaxSpread*1.5){
		//hide repeats	
		var unique = {};
		$.each($(".word"),function(idx, val){
			if($(val).attr("style").indexOf("0pt")<0){
				if(unique[$(val).text()]){
					//its already in - make vanish
					$(val).css("font-size", "0pt");
				}else{
					//add it
					unique[$(val).text()] = 1;
				}
			}
		});	
	}



}

function resetFilter(){

	var jQs = ['commonWords',
'basicAdjectives',
'adverbs',
'helpingVerbs',
'pronouns',
'prepositions',
'numberlike'];

	var turnOnAll = $('input[name=context-menu-input-all]').attr('checked');

	for(var i = 0; i < jQs.length; i++){
		var jQ = 'input[name=context-menu-input-'+ jQs[i] +']';
		var ischecked = $(jQ).attr('checked');
		if(turnOnAll || ischecked) {		
			wordShow(jQs[i],true);
		}else{
			wordShow(jQs[i],false);
		}
	}
	
}

function IsNumeric(input)
{
    return (input - 0) == input && input.length > 0;
}

function InArray(matchIn,arrayIn){
	var res = -1;
	$.each(arrayIn, function(index, value) { 
		if (value.toLowerCase() == matchIn.toLowerCase()) {
			res = index;
			return false;
		}
	});
	return res;
}

function wordShow(which,show){
	if(show){	
		$("."+which).show();
		
		setStyles(which);
	
	}else{
		$("."+which).hide();
	}

}

function getSelected() {
	if(window.getSelection) { 
		return window.getSelection(); 
	}else if(document.getSelection) { 
		return document.getSelection(); 
	}else {
		var selection = document.selection && document.selection.createRange();
		if(selection.text) { 
			return selection.text; 
		}
		return false;
	}
	return false;
}

function setStyles(which){


	$("."+which).css(wordType[which].styleObj);


}

function makeFindSpace(elem, callback){

	var c = [];

	
	c.push("<div id='work'>");

	c.push("<div>");
	c.push("<canvas id='my_canvas' width='400' height='300'></canvas>");
	c.push("<br/><input type='button' id='makeWordCloud' value='Make'></input><br/>");
	c.push("</div>");

	c.push("<div>");
	c.push("URL to Inspect:<input size='60' id='targetUrl'></input>");
	c.push("<input type='button' id='loadTarget' value='Load'></input>");
	c.push("</div>");
	
	c.push("<div id='bucketDiv'>");
	c.push("<br/>");
	c.push("<textarea id='textBucket'  rows='10'></textarea>");
	c.push("<br/>");

	
	c.push("Text Frequency:");
	c.push("<div id='sliderFreq'></div>");	
	c.push("<input id='textUtility' type='button' value='Utility'></input>");
	
	c.push("</div>");
	/*
	c.push("<div id='contolDiv'>");
	c.push("<textarea id='textDrops' rows='4'></textarea>");
	c.push("<br/>");
	c.push("<input id='textDrop' type='button' value='Process'></input>");
	c.push("</div>");
	*/
	c.push("<div id='showDivContainer'>");
	c.push("<div id='showDiv'></div>");
	c.push("</div>");
	c.push("</div>");
	
	$("."+elem).append(c.join(''));
	
	callback();
	
}




var styleObj = {};
styleObj["commonWords"]={"color":"silver"};
styleObj["adverbs"]={"color":"blue"};
styleObj["helpingVerbs"]={"color":"red"};
styleObj["basicAdjectives"]={"color":"blue"};
styleObj["pronouns"]={"color":"brown"};
styleObj["prepositions"]={"color":"blue"};
styleObj["numberlike"]={"color":"aqua"};


//Conjunction joins words or phrases
//Interjection expresses a feeling
var wordType = {};
wordType["commonWords"] = {"styleObj": {"color":"silver"},"words":[
's','the','a','an','and','or','as','else','for','of','by','if','both','but','so','also','not','no','than','although','Though','whether','why','while','However','Perhaps','whereas','thus','oh','o','Because','therefore']};

//ADJECTIVES describes noun -which, how many, what kind of 
//describes a noun or a pronoun (how something or someone is)
wordType["basicAdjectives"] =
{"styleObj": {"color":"blue"},"words":[
//which
'Each','either','another','latter','former','same',
//how many
'all','entire','most','such','much','more','many','some','several','fewer','few','one',
//when
'Recent'
]};

//ADVERBS describes verb or adj -where, when, how, to what extent
//describes a verb, an adjective or an adverb (how someone does something)
wordType["adverbs"] = {"styleObj": {"color":"blue"},"words":[
//where
'where','There','here','far','near','nearby','close','Further',
//how many or how much
'least','mostly','almost','rather','slightly',
//how
'how','probably','Alone','possibly','quite','Similarly','very','actually','widely','only','especially','still',
//when and how often
'then','usually','often','always','frequently','once','again','now','immediately','forever','formerly','finally','sometime','sometimes','ultimately','initially','recently','later','late','never'
]};

//common helping verbs
wordType["helpingVerbs"] = {"styleObj": {"color":"red"},"words":[
//to have
'has','have','had',
//to be
'is','been','are','were','was','be','would','am',
//to do
'does','did','do','could',
//may - to be able
'may','might',
//shall - to have to, to owe, ought - to owe
'shall',' should', 'ought'
]};

//pronoun - substitute for a noun
wordType["pronouns"] = {"styleObj": {"color":"brown"},"words":['its','those','it','who','what','which','their','when','that','they','These','us','his','them','he','this','whom','him','her','itself','i','you','my','me','herself','themselves','she','our','we','any']};

//PREPOSITION - expresses a connection between persons or things
wordType["prepositions"] = {"styleObj": {"color":"navy"},"words":[
//when
'before','whilst','During',
//where
'within','from','to','other','on','with','in','after','through','into','until','at','around','out','up','under','about','off','along','across','among','against','except','between','down','below','over','Upon','onto','inside','toward']};

//numbers
wordType["numberlike"] = {"styleObj": {"color":"aqua"},"words":['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve']};

//adverbs with ly

//adjectives

//nouns - names a person or a thing

//proper nouns

//verbs - expresses an action or a state
