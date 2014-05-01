// student login pages

tosave='';
screenlock=true;

function gost(to,save,label) {
	if(screenlock) return;
	screenlock=true;
	setviz('showpage',false);
	setviz('busy',true);
	setviz('showbackmenu','spacer','errok');  // mobile only
	sethtml('pagelabel',((label)?label:'Loading'),'errok');  // mobile only
	if(to) settext('to',to);
	if(save) tosave=save;
	if(tosave) settext('save',tosave);
	if(self.leaving) leaving();
	setTimeout(function(false) {
		document.form1.submit();
	},0);
}

function changeschoolyear() {
	settext('class1',0);
	settext('track',0);
	settext('term',0);
	gost();
}

// FULL SITE

function overnav(l) {
	setstyle(l+'1','studcaplit');
	setstyle(l+'2','lit');
}
function outnav(l) {
	setstyle(l+'1','inverse');
	setstyle(l+'2','inverse');
}

// MOBILE

menuopen=false;
function togglemenu() {
	menuopen=(!menuopen);
	setviz('showmenu',menuopen);
	setviz('pagebar',!menuopen);
	setviz('showpage',!menuopen);
}

function gopage(tab,label) {  // click menu
	setviz('showmenu',false);
	setviz('pagebar',true);
	gost(tab,'',label);
}
