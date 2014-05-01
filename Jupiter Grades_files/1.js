// this script in every page


// ERROR HANDLING

// log uncaught javascript errors in form
try {window.onerror=otherjserror;}
catch(e) {}
function otherjserror(errmsg,page,line,chr) {
	logjserror(errmsg+' (line '+line+' '+page+')');
	return true;	// return false for browser error alert
}

jserrorlog='';  // log of javascript errors; written to form input jserror when leave page
logging=(document.cookie.indexOf('logging=')>=0);  // logging cookie (developer only) means show diagnostic alerts instead of background logging

// log javascript error message
// m = error message
// errok = 'errok' or 1 to ignore
// e = error object
function logjserror(m,errok,e) {
	if(errok) return;
	if(e) m+='  ['+e.name+': '+e.message+']';
	jserrorlog+="\n"+m;
	if(logging)  // show alert instead of background logging
		alert(m);
	else {
		try {document.form1.jserror.value=jserrorlog;}
		catch(e2) {}
	}
}


// VARS

// if mobile device, webpage sets this = 1
mobile=0;

// these all relate to tooltips
box=null;
tip=null;
tipopen=false;
tiptimer=null;
tipwidth=0;
tipheight=0;
mousex=0;
mousey=0;
windowx=0;
windowy=0;

// browser = MSIE/Safari/Mozilla/?
// browserver = 6/7/8/9/10/11 for MSIE only
// mozilla = true/false
x=navigator.userAgent.indexOf('MSIE');
if(x!=-1) {
	browser='MSIE';
	browserver=navigator.userAgent.substr(x+5,2)-0;
}
else if(navigator.userAgent.indexOf('Trident')!=-1) {  // IE11 no longer has 'MSIE', but older versions do have 'Trident'
	browser='MSIE';
	x=navigator.userAgent.indexOf('rv:');
	browserver=navigator.userAgent.substr(x+3,2)-0;
}
else if(navigator.userAgent.indexOf('Safari')!=-1)  // Chrome too
	browser='Safari';
else if(navigator.userAgent.indexOf('Firefox')!=-1 || navigator.userAgent.indexOf('Netscape')!=-1 || navigator.userAgent.indexOf('SeaMonkey')!=-1)
	browser='Mozilla';
else
	browser='?';
mozilla=(browser=='Mozilla');

// TOUCH

if(navigator.userAgent.indexOf('(iP')!=-1) touch=true, touchthresh=15;  // iOS has bug if >15; 10 is considered dragging
else if(navigator.userAgent.indexOf('Android')!=-1) touch=true, touchthresh=30;  // Android is extra touchy
else touch=false;

function touchstart(e,prevdef) {
	touchx=e.touches[0].clientX;
	touchy=e.touches[0].clientY;
	touchdrag=false;
	if(prevdef) e.preventDefault();  // prevent mouse events, scroll, text select, zoom
}

function touchmove(e) {
	if(Math.abs(touchx-e.touches[0].clientX)>=touchthresh || Math.abs(touchy-e.touches[0].clientY)>=touchthresh) touchdrag=true;
}

function tapped(e) {
	if(touchdrag) return false;
	e.preventDefault();  // stop ios from clicking through to next element
	return true;
}

// TIP BOX

// display tooltip if mouse hover 1.5 seconds
// tip = name of tooltip (not the actual text) set onmouseover; empty if no tooltip
function showtip() {
	if(!tip || !box) return;  // no tip for current element
	var msg=tipmsg1();  // get tip text for given tip name
	if(!msg)  // if no tip text for some reason, hide tipbox
		return hidetip();
	sethtml('tipspan',msg);  // set tip message
	box.className='tipbox';  // show tipbox
	tipwidth=box.offsetWidth;  // measure width and height
	tipheight=box.offsetHeight;
	tipopen=true;
	// same as mousemove:
	box.style.left= (Math.min(mousex+8,windowx-18-tipwidth))+'px';  // display to right of mouse, but don't let it go off edge of window
	box.style.top= (windowy-(mousey+tipheight)>60 || !windowy)?  // display below mouse, unless it would go off bottom of window
		(mousey+20)+'px':  // below mouse (IE6 always this way)
		(mousey-32-tipheight)+'px';  // above mouse
}

// hide tooltip
function hidetip() {
	if(tiptimer) clearTimeout(tiptimer);
	if(!tipopen) return;
	box.className='hide';
	tipopen=false;
}

// onmouseover look for 'tip' attribute (this fires after inline onmouseover)
function mouseover(e) {  // not used for mobile
	var f=(mozilla)? e.target : event.srcElement;
	var t=f.getAttribute('tip');
	if(t!='preset') tip=t;  // 'preset' means inline onmouseover already defined tip
	if(!t) return;
	if(tiptimer) clearTimeout(tiptimer);
	if(tipopen) showtip();  // update tip immediately if already open
	else tiptimer=setTimeout('showtip()',1500);  // wait 1.5 sec if not already open
}

// onmouseout close tooltip
function mouseout(e) {  // not used for mobile
	if(tiptimer) clearTimeout(tiptimer);
	if(tipopen) tiptimer=setTimeout('hidetip()',50);  // delay 0.05 sec to see if mouseover new tip
}

// onmousemove move tooltip with mouse
function mousemove(e) {  // not used for mobile
	if(!box) return;
	if(browser!='MSIE') {mousex=e.pageX; mousey=e.pageY;}  // Firefox, Safari
	else if(browserver>=8) {mousex=event.x; mousey=event.y;}  // MSIE 8+
	else {mousex=event.x+document.documentElement.scrollLeft; mousey=event.y+document.documentElement.scrollTop;}  // MSIE 7-
	windowx=document.documentElement.clientWidth+document.documentElement.scrollLeft+document.body.scrollLeft;  // visible width inside scrollbar; Firefox/Explorer + Safari
	windowy=document.documentElement.clientHeight+document.documentElement.scrollTop+document.body.scrollTop;
	box.style.left=(Math.min(mousex+8,windowx-18-tipwidth))+'px';
	if(windowy-(mousey+tipheight)>48) box.style.top=(mousey+20)+'px';
	else box.style.top=(mousey-32-tipheight)+'px';
}


// KEYBOARD

// special handling for arrow & return & escape keys
function keydown(e) {
	if(tipopen) hidetip();  // hide tooltip while typing
	var k=(mozilla)? e.keyCode:event.keyCode;  // which key

	// press escape anywhere to select Find box
	if(k==27 && document.form1.find) {
		if(mobile) {}  // n/a for mobile devices
		else if(!document.form1.admin) {  // teacher: Find box in footer
			focusfind();
			selectf('find');
		}
		else {  // admin: open Find prompt or select if already open
			if(!studmenuopen) clickstudbtn();
			else selectf('find');
		}
		return false;
	}

	// check textbox for handling of arrow & return keys
	var f=(mozilla)? e.target : event.srcElement;
	var i=f.getAttribute('keyindex')-0;  // attribute set by initjs()
	if(!i) return true;  // no special handling if no attribute 'keyindex'

	// down arrow, return, eneter
	if(k==40 || k==13 || k==10 || k==3 || k==63233) {
		// return/enter may do an action
		if(k==13 || k==10 || k==3) {
			// shift-return
			if(mozilla?e.shiftKey:event.shiftKey) {
				if(f.getAttribute('onshiftreturn')) {
					setTimeout(f.getAttribute('onshiftreturn'),1);  // execute attribute 'onshiftreturn'
					return false;  // don't type return/enter
				}
				if(f.type=='textarea') return true;  // normal return in textarea
			}
			// return
			if(f.getAttribute('onreturn')) {
				f.blur();  // force onchange first
				setTimeout(f.getAttribute('onreturn'),1);  // execute attribute 'onreturn'
				return false;  // don't type return/enter
			}
		}
		// select next row down
		do {
			i++;  // identify next textbox
			if(textboxes[i]=='') return false;  // stop at last textbox
		} while(document.form1.elements[textboxes[i]].getAttribute('skip')==1)  // if next row has attribute skip==1, find next row after
	}

	// up arrow
	else if(k==38 || k==63232) {
		do {
			if(i==1) return false;  // stop at first textbox
			i--;  // identify previous textbox
		} while(document.form1.elements[textboxes[i]].getAttribute('skip')==1)  // if previous row has attribute skip==1, find row before
	}

	// left arrow
	else if((k==37 || k==63234) && f.getAttribute('keyleft'))  // 'keyleft' attribute, if any, determines which textbox to select on left
		i-=f.getAttribute('keyleft');

	// right arrow
	else if((k==39 || k==63235) && f.getAttribute('keyright')) {  // 'keyright' attribute, if any, determines which textbox to select on right
		var i1=f.getAttribute('keyright')-0+i;
		if(textboxes[i1]) i=i1;  // ignore if no such textbox
	}

	// any other key: type normal
	else return true;

	// select textbox
	document.form1.elements[textboxes[i]].select();
	return false;
}

// when textbox is hidden, set attribute skip=1 to skip over it for arrow/return keys; vice versa when textbox is shown
function setskip(f,x,errok) {
	try {document.form1.elements[f].setAttribute('skip',x);}
	catch(e) {logjserror('setskip('+f+','+x+')',errok,e);}
}


// INITIATE

// after page is fully loaded, scan all text boxes to determine order for return & arrow keys
function initjs() {
	setTimeout('initjs1()',1);  // delay helps Safari
	if(jserrorlog)  // just in case js error before form was drawn
		try {document.form1.jserror.value=jserrorlog;} catch(e) {}
}
function initjs1() {
	// index all textboxes
	textboxes=new Array();
	var z=document.form1.length;
	for(var k=0;k<z;k++) {  // each form element
		var f=document.form1.elements[k];
		if(f.type!='text' && f.type!='password' && f.type!='number' && f.type!='email' && f.type!='url' && !(f.type=='textarea' && f.getAttribute('col')))
			continue;  // find all textboxes; include textarea only of col attribute; skip all other inputs
		if(!f.name) continue;  // ignore textbox if it has no name
		var c=f.getAttribute('col');  // textboxes may optionally have a 'col' attribute, eg 1=first column, 2=second column
		c=(c)? c-0 : 0;  // change NaN to 0, string to number
		if(!textboxes[c]) textboxes[c]='';  // organize textboxes by column
		textboxes[c]+=','+f.name;  // comma-delim textboxes
	}
	textboxes=textboxes.join('')+',';  // join columns together in order; add blank last item
	textboxes=textboxes.split(',');  // all textboxes in linear order; 0th and last item is blank
	var textboxcount=textboxes.length-1;
	for(k=1; k<textboxcount; k++)  // give each textbox an index number as attribute 'keyindex'
		document.form1.elements[textboxes[k]].setAttribute('keyindex',k);

	// listeners, etc
	document.onkeydown=keydown;
	if(!mobile) {
		document.onmouseover=mouseover;
		document.onmouseout=mouseout;
		document.onmousemove=mousemove;
		box=document.getElementById('tipbox');
	}
}


// TEXT BOXES

// return value of textbox f
function text(f,errok) {
	try {var v=document.form1.elements[f].value;}
	catch(e) {logjserror('text('+f+')',errok,e); return '';}
	return (v=='0')? 0:v;  // ensure string 0 counts as false
}

// set value of textbox f
function settext(f,x,errok) {
	try {document.form1.elements[f].value=x;}
	catch(e) {logjserror('settext('+f+','+x+')',errok,e);}
}

// clean value of textbox f and return it; ie, trim whitespace and change \ to checkmark or /
// cap = 1+ to change all caps and all lower to title case, where cap is max length acronym; = 0 to leave caps as is
// def = default value if blank
function cleantext(f,cap,checkmark,def) {
	try {
		var x=document.form1.elements[f].value;
		var x=clean(x,checkmark);
		if(x=='' && def) x=def;
		else if(cap) x=caps(x,cap);
		document.form1.elements[f].value=x;
		return x;
	}
	catch(e) {logjserror('cleantext('+f+')','',e); return '';}
}

// put cursor in textbox or select element f
function focusf(f,errok) {
	try {document.form1.elements[f].focus();}
	catch(e) {logjserror('focusf('+f+')',errok,e);}
}

// select text in textbox f
function selectf(f,errok) {
	try {
		if(browser=='MSIE') {  // IE has tab order problems on select, so focus first
			document.form1.elements[f].focus();
			document.form1.elements[f].select();
		}
		else if(browser=='Safari') {  // Safari fails to select all text
			document.form1.elements[f].focus();
			var len=document.form1.elements[f].value.length;
			setTimeout("document.form1."+f+".selectionStart=0; document.form1."+f+".selectionEnd="+len,1);
		}
		else  // Mozilla okay
			document.form1.elements[f].select();
	}
	catch(e) {logjserror('selectf('+f+')',errok,e);}
}

// unselect textbox or element f
function blurf(f,errok) {
	try {document.form1.elements[f].blur();}
	catch(e) {logjserror('blurf('+f+')',errok,e);}
}

// textarea growbox: expand number of rows onkeyup; see 1.php autorows()
function autorows(f,e,minrows,maxrows,extra) {
	var k=e.keyCode;  // which key
	if(k!=13 && k!=3 && k!=8 && k!=46) return;  // ignore all but return and delete keys
	var t=f.value.split("\n");  // to count rows of text
	var rows=Math.min(maxrows,Math.max(minrows,t.length+extra));
	r=(mozilla && rows>1)? rows-1:rows;  // firefox always shows one too many rows, so r = 1 less than visible rows
	if(r==f.rows) return;
	f.rows=r;
}


// CHECKBOXES

// return true/false if checkbox checked
function checked(f,errok) {
	try {return document.form1.elements[f].checked;}
	catch(e) {logjserror('checked('+f+')',errok,e); return false;}
}

// set checked true/false for checkbox f
function setcheck(f,x,errok) {
	try {document.form1.elements[f].checked=x;}
	catch(e) {logjserror('setcheck('+f+','+x+')',errok,e);}
}

// set checked true for checkbox f
function check(f,errok) {
	try {document.form1.elements[f].checked=true;}
	catch(e) {logjserror('check('+f+')',errok,e);}
}

// set checked false for checkbox f
function uncheck(f,errok) {
	try {document.form1.elements[f].checked=false;}
	catch(e) {logjserror('uncheck('+f+')',errok,e);}
}

// handle mouseclick on checkbox or its label; see 1.php checkbox()
function clickcheck(f,errok) {
	try {
		if(document.form1.elements[f].disabled)  // show tip immediately if click disabled checkbox
			return showtip();
		document.form1.elements[f].checked=!document.form1.elements[f].checked;
		if(document.form1.elements[f].onclick) document.form1.elements[f].onclick();
	}
	catch(e) {logjserror('clickcheck('+f+')',errok,e);}
}


// RADIO BUTTONS

// return selected value of radio btns f; empty string if none selected
function radio(f,errok) {
	try {
		var z=document.form1.elements[f].length;
		for(var n=0; n<z; n++) {
			if(!document.form1.elements[f][n].checked) continue;
			var x=document.form1.elements[f][n].value;
			return (x=='0')? 0:x;  // ensure 0 counts as integer (false) instead of string (true)
		}
		return '';
	}
	catch(e) {logjserror('radio('+f+')',errok,e); return '';}
}

// set radio btn f to value x
function setradio(f,x,errok) {
	try {
		var z=document.form1.elements[f].length;
		for(var n=0; n<z; n++) {
			if(document.form1.elements[f][n].value!=x) continue;
			document.form1.elements[f][n].checked=true;
			return;
		}
		logjserror('setradio('+f+','+x+'): no such value',errok);
	}
	catch(e) {logjserror('setradio('+f+','+x+')',errok,e);}
}

// handle mouseclick on radio btn or its label; see 1.php radio()
function clickradio(f,x,errok) {
	try {
		if(document.form1.elements[f][x].disabled)  // show tip immediately if click disabled radio btn
			return showtip();
		document.form1.elements[f][x].checked=true;
		if(document.form1.elements[f][x].onclick) document.form1.elements[f][x].onclick();
	}
	catch(e) {logjserror('clickradio('+f+','+x+')',errok,e);}
}


// MENUS

// return selected value of select f
function menu(f,errok) {
	try {
		var x=document.form1.elements[f].options[document.form1.elements[f].selectedIndex].value;
		return (x=='0')? 0:x;  // ensure 0 counts as integer (false) instead of string (true)
	}
	catch(e) {logjserror('menu('+f+')',errok,e); return '';}
}

// set selected value to x for select f
function setmenu(f,x,errok) {
	try {
		var z=document.form1.elements[f].options.length;
		for(var n=0; n<z; n++) {
			if(document.form1.elements[f].options[n].value!=x) continue;
			document.form1.elements[f].selectedIndex=n;
			return;
		}
		logjserror('setmenu('+f+','+x+'): no such value',errok);
	}
	catch(e) {logjserror('setmenu('+f+','+x+')',errok,e);}
}

// return select index number of select f
function menui(f,errok) {
	try {return document.form1.elements[f].selectedIndex;}
	catch(e) {logjserror('menui('+f+')',errok,e); return 0;}
}

// set selection to index item x in select f
function setmenui(f,x,errok) {
	try {document.form1.elements[f].selectedIndex=x;}
	catch(e) {logjserror('setmenui('+f+','+x+')',errok,e);}
}


// LIST BOX

// return string of selections for select box
// format: value1=1/0,value2=1/0,value3=1/0
function listbox(f,errok) {
	try {
		var v='';
		var z=document.form1.elements[f].length;
		for(var n=0; n<z; n++)
			v+=document.form1.elements[f][n].value+'='+((document.form1.elements[f][n].selected)?1:0)+',';
		return v.substr(0,v.length-1);  // remove last comma
	}
	catch(e) {logjserror('listbox('+f+')',errok,e); return '';}
}

// get string of selects for select box and save to hidden input; this is the only way to post form values of list boxes
function savelistbox(f,errok) {
	var v=listbox(f+'list',errok);
	settext(f,v,errok);
}


// INNER HTML

// set innerhtml of element id i
function sethtml(i,x,errok) {
	var o=document.getElementById(i);
	if(!o) return logjserror('sethtml('+i+','+x+') no such id',errok);
	o.innerHTML=x;
}

// return innerhtml of element id i
function gethtml(i,errok) {
	var o=document.getElementById(i);
	if(!o) {logjserror('getspan('+i+') no such id',errok); return '';}
	return o.innerHTML;
}


// STYLE

// set classname for element id or name i
function setstyle(i,x,errok) {
	if(document.getElementById(i))
		document.getElementById(i).className=x;
	else if(document.form1 && document.form1.elements[i])
		document.form1.elements[i].className=x;
	else
		logjserror('setstyle('+i+','+x+') no such element',errok);
}

// return classname for element id i
function getstyle(i,errok) {
	if(document.getElementById(i))
		return document.getElementById(i).className;
	else if(document.form1 && document.form1.elements[i])
		return document.form1.elements[i].className;
	logjserror('getstyle('+i+') no such element',errok);
	return '';
}

// set visibility of element id or name i
// x = 'spacer', 'hide'/false, 'show'/true
function setviz(i,x,errok) {
	if(document.getElementById(i))
		var o=document.getElementById(i);
	else if(document.form1 && document.form1.elements[i])
		var o=document.form1.elements[i];
	else
		return logjserror('setviz('+i+','+x+') no such element',errok);
	if(o.className.substr(0,4)=='hide')  // if page built with multiple classnames, 'hide' must be first
		o.className=o.className.substr(5,99);
	o.style.display=(x=='hide' || !x)? 'none':'';
	o.style.visibility=(x=='spacer')? 'hidden':'visible';
}

// redefine stylesheet rule for display/visibility
// s = <style> block index starting at 0
// r = rule index starting at 0
// x = 'spacer', 'hide'/false, 'show'/true
function setvizrule(s,r,x) {
	try {
		if(document.styleSheets[s].rules)
			var o=document.styleSheets[s].rules[r].style;
		else
			var o=document.styleSheets[s].cssRules[r].style;
		o.display=(x=='hide' || !x)? 'none':'';
		o.visibility=(x=='spacer')? 'hidden':'visible';
	}
	catch(e) {logjserror('setvizrule('+s+','+r+','+x+')','',e);}
}

accordionht=[];

function accordion(id,open) {
	var o=document.getElementById(id);
	if(!accordionht[id]) {  // measure native ht
		o.className='clip';
		o.style.height='auto';
		accordionht[id]=o.offsetHeight;
		o.style.height=(open?0:accordionht[id])+'px';
		o.className='accordion';
		setTimeout(function() {o.style.height=(open?accordionht[id]:0)+'px';},15);  // 15ms delay helps Firefox
	}
	else o.style.height=(open?accordionht[id]:0)+'px';
}


// OTHER ATTRIBUTES

// set disabled true/false for element name f
function setdisabled(f,x,errok) {
	try {document.form1.elements[f].disabled=x;}
	catch(e) {logjserror('setdisabled('+f+','+x+')',errok,e);}
}

// return value of attribute a for element id i
function atti(i,a,errok) {
	try {return document.getElementById(i).getAttribute(a);}
	catch(e) {logjserror('atti('+i+','+a+')',errok,e); return '';}
}

// return value of attribute a for element name f
function att(f,a,errok) {
	try {return document.form1.elements[f].getAttribute(a);}
	catch(e) {logjserror('att('+f+','+a+')',errok,e); return '';}
}

// set attribute a to value x for element name f
function setatt(f,a,x,errok) {
	try {document.form1.elements[f].setAttribute(a,x);}
	catch(e) {logjserror('setatt('+f+','+a+','+x+')',errok,e);}
}


// BUTTONS

// onmouseover button; see 1.php btn()
function overbtn(i) {
	if(btndim(document.getElementById(i))) return;
	setstyle(i,'btnlit btntxt');
	setstyle(i+'l','btnlitl');
	setstyle(i+'r','btnlitr');
}

// onmouseout button; see 1.php btn()
function outbtn(i) {
	if(btndim(document.getElementById(i))) return;
	setstyle(i,'btn btntxt');
	setstyle(i+'l','btnl');
	setstyle(i+'r','btnr');
}

// onmouseclick button; see 1.php btn()
function clickbtn(i) { /// obs
	document.getElementById(i).onclick();
}

// return 'dim' attribute for button object o; see 1.php btn()
function btndim(o) {
	return o.getAttribute('dim')-0;
}

// set 'dim' attribute for button id i; see 1.php btn()
function setbtndim(i,dim,inv,errok) {
	if(!document.getElementById(i)) return;  // ignore if doesn't exist
	var btn=(inv)?'btni':'btn';
	setstyle(i,((dim)?btn+'dim':btn)+' btntxt');
	if(!inv) {
		setstyle(i+'l','btnl');
		setstyle(i+'r','btnr');
	}
	try {document.getElementById(i).setAttribute('dim',(dim)?1:0);}
	catch(e) {logjserror('setbtndim('+i+','+dim+','+inv+')',errok,e);}
}


// PROMPT

promptopen=0;  // name of prompt current only
defaultprompt=0;  // name of prompt to show when no other prompt open

// show or hide prompt name p
// nohide = true to always show, false to toggle
// return true if prompt open, false if closed
function showprompt(p,nohide) {
	if(promptopen)  // close any other prompt already open
		setviz(promptopen,false);
	if(p==promptopen && !nohide || !p) p=defaultprompt;  // close prompt or show default
	promptopen=p;
	if(p) setviz(p,true);
	return promptopen;
}


// FORM VALIDATION

// when checking form, show alert message m and optionaly select element name f
function err(f,m) {
	if(!m) m='';
	sethtml('alert',m,'errok');
	setviz('showalert', m!='', 'errok');
	if(!f) return;
	var type=document.form1.elements[f].type;
	(type=='text' || type=='password' || type=='number' || type=='email' || type=='url')?  // select text if textbox, else focus
		selectf(f) : focusf(f);
}


// STRING FUNCTIONS

// return true if needle is in haystack, case sensitive
function isin(needle,haystack) {
	return (haystack.indexOf(needle)>=0);
}

// return true if needle is one of the comma-delim items in haystack, case sensitive
function isany(needle,haystack) {
	haystack=haystack.split(',');
	for(var k=0; k<haystack.length; k++)
		if(haystack[k]==needle) return true;
	return false;
}

// trim whitespace, change \ to checkmark or /
function clean(x,checkmark) {
	if(!x) return '';
	x=x+'';
	var f=String.fromCharCode(32,160,9,10,13); // white space
	while(f.indexOf(x.charAt(0))>=0 && x.length>0)  // trim leading
		x=x.substring(1,x.length);
	while(f.indexOf(x.charAt(x.length-1))>=0 && x.length>0)  // trim trailing
		x=x.substring(0,x.length-1);
	x=x.replace(/\\/g, checkmark?'✓':'/');
	return x;
}

// in string x allow only characters in string f; replace any other chars with string r
function filter(x,f,r) {
	var y='';  // output
	if(r==null) r='';
	var z=x.length;
	for(var i=0; i<z; i++)
		y+=(f.indexOf(x.charAt(i))>=0)? x.charAt(i):r;
	return y;
}

// parse number from string x; returns blank if not a number
// format = string of swiches:
//   . = allow decimals, else round integers
//   - = allow negative, else positive only
//   % = show percent sign
//   + = show positive sign
function number(x,format) {
	var f='0123456789.';
	if(format.indexOf('-')>=0) f+='-';
	var y=filter(x+'',f);  // remove any chars not allowed, like commas
	if(y-0!=y || y=='') return '';  // NaN
	if(format.indexOf('.')<0) y=Math.round(y);  // round integers
	if(format.indexOf('+')>=0 && y>0) y='+'+y;  // show positive sign
	if(format.indexOf('%')>=0) y += '%';  // show percent sign
	return y;
}

// d = number of decimal places (fixed); 0 for integer
function roundit(x,d) {
	if(x+''=='') return '';
	x=x-0;
	if(x+''=='NaN') return '';
	if(!d) return Math.round(x+0.00001);
	var z='0000000000';
	var m=('1'+z.substr(0,d))-0;
	x=(Math.round(x*m+0.00001)/m)+'';
	if(x.indexOf('.')<0) x+='.';
	var it=x.split('.');
	if(it[1].length<d)
		x+=z.substr(0,d-it[1].length);
	return x;
}

// change all-caps or all-lower to title case
// maxacro = maximum number of characters for acronym
function caps(x,maxacro) {
	if(x=='') return x;
	var upper=x.toUpperCase();
	var lower=x.toLowerCase();
	if(x!=upper && x!=lower) return x;  // no change if already mixed case
	var len=x.length;
	if(x==upper && len<=maxacro) return x;  // allow acronyms with all caps
	var sep=" ,.-'‘’()[]\"“”";
	var y='';
	var capnext=true;
	for(var i=0; i<len; i++) {
		var c=lower.charAt(i);
		y+=(capnext)? c.toUpperCase() : c;
		capnext=(sep.indexOf(c)>=0);
	}
	return y;
}

// if email address is all caps, change to lower; ok if mixed caps
function ecaps(email) {
	if(email==email.toUpperCase())
		return email.toLowerCase();
	return email;
}

// onchange textbox, ensure number has correct range and number of decimal places
// f = name of textbox
// d = number of decimal places (fixed), 0 for integer (default), -1 for as-is
// mn = minimum; null if n/a
// mx = maximum; null if n/a
function changenum(f,d,mn,mx) {
	var x=text(f)+'';
	if(x!='') {
		x-=0;
		if(x+''=='NaN') x='';
		else {
			if(mn!=null && x<mn) x=mn;
			if(mx!=null && x>mx) x=mx;
			if(!d) d=0;
			if(d>=0) x=roundit(x,d);
		}
	}
	settext(f,x);
	return x;
}

// onchange textbox for email address, erase anything that's not a email address and use standard separate between multiple addresses
// multi = true to allow multiple addresses
// def = default if blank
function changeemail(f,multi,def) {
	var x=text(f)+'';
	x=x.replace(/\.{2,}/g,'.');  // change 2+ dots to one
	var y='';
	pattern=new RegExp("[a-z0-9][a-z0-9._'\\-/!#$%&*+=?^`{|}~]*@[a-z0-9][a-z0-9.\\-]*\\.[a-z]{2,}","gi");
	while(matches=pattern.exec(x)) {  // each address
		var email=matches[0];
		if(email==email.toUpperCase())  // change all-caps to lowercase
			email=email.toLowerCase();
		y+=email+', ';  // separate by comma space
		if(!multi) break;
	}
	y=y.substr(0,y.length-2);  // remove last comma space
	if(!y && def) y=def;
	settext(f,y);
}

// onchange textbox for url, erase anything that doesn't appear to be a url
function changeweb(f) {
	var x=text(f);
	x=clean(x);
	if(x.indexOf('.')==-1 || x.indexOf(' ')!=-1 || x.indexOf('@')!=-1) x='';
	settext(f,x);
}

// clean date string; must be input as m/d/y or m/d
// defaultyear = 8-digit school year like 20122013; if input m/d without year, use first default for Aug-Dec, second default for Jan-July
// defaultmdy = optionally revert to this if date erased or invalid
function cleandate(mdy,defaultyear,defaultmdy) {
	if(!defaultmdy) defaultmdy='';
	mdy=repstr(' ','',mdy);  // remove spaces
	mdy=filter(mdy,'0123456789/','/');  // change any other punctuation to slash, like 12-31-99 or 12.31.99
	mdy=mdy.split('/');
	var m=mdy[0]-0;
	var d=mdy[1]-0;
	var y=mdy[2]-0;
	if(m<1 || m>12 || m+''=='NaN') return defaultmdy;  // blank if missing/invalid month
	if(d<1 || d>31 || d+''=='NaN') return defaultmdy;  // blank if missing/invalid date (doesn't validate number of days in month)
	if(!(y>=1 && y<=99 || y>=2000 && y<=2099 || mdy[2]=='00') || y+''=='NaN') {  // if missing or invalid year use defaultyear
		defaultyear+='';  // convert to string
		y=(m>=8)?
			defaultyear.substr(2,2):  // first two-digit year for Aug-Dec
			defaultyear.substr(defaultyear.length-2,2);  // second two-digit year for Jan-July
	}
	else if(y<10) y='0'+y;  // ensure year two digits
	return m+'/'+d+'/'+y;
}

// replace string x with string y in string t
function repstr(x,y,t) {
	while(true) {
		var n=t.indexOf(x);
		if(n==-1) return t;
		t=t.substring(0,n)+y+t.substring(n+x.length,t.length);
	}
}

// return true if strings a and b are same without html entities
function samehtml(a,b) {
	return (unhtml(a)==unhtml(b));
}

// convert &quot; &amp; <br> to " & \n
function unhtml(x) {
	x=x+'';
	x=x.replace(/<br>/g,"\n");
	x=x.replace(/&quot;/g,'"');
	x=x.replace(/&lt;/g,'<');
	x=x.replace(/&gt;/g,'>');
	x=x.replace(/&amp;/g,'&');
	return x;
}

function html(x) {
	x=x+'';
	x=x.replace(/\n/g,'<br>');
	x=x.replace(/&/g,'&amp;');
	x=x.replace(/"/g,'&quot;');
	x=x.replace(/</g,'&lt;');
	x=x.replace(/>/g,'&gt;');
	return x;
}

// change '' to '&nbsp;' (so IE table cells render correctly)
function noempty(x) {
	return (x=='')? '&nbsp;':x;
}

// js escape() ruins utf8, so just encode the basics
function esc(x) {
	if(!x) return '';
	x=x+'';
	x=x.replace(/%/g,'%25');
	x=x.replace(/&/g,'%26');
	x=x.replace(/=/g,'%3D');
	x=x.replace(/</g,'%3C');
	x=x.replace(/>/g,'%3E');
	x=x.replace(/;/g,'%3B');
	x=x.replace(/\+/g,'%2B');  // PHP converts + to space, so encode as hex
	x=x.replace(/\n/g,'%0A');
	x=x.replace(/\r/g,'%0D');
	return x;
}


// COOKIE

// save cookie
// expire = 0 to expire after browser session, blank to expire in one year; compare to 1.php
function savecookie(name,value,expire) {
	if(expire+''!='0') {
		e=new Date();
		e.setTime(e.getTime()+(365*24*60*60*1000));  // one year
		document.cookie=name+'='+esc(value)+'; expires='+e.toGMTString()+'; path=/';
	}
	else
		document.cookie=name+'='+esc(value)+'; path=/';
}


// OTHER

function now() {
	var d=new Date();
	return d.getTime()/1000;
}


// NAVIGATION

// post form, optionally to url
function gopost(url) {
	if(url) document.form1.action=(url);
	document.form1.submit();
}

// open help popup window
// page = filename without .html extension, or full filename with .php, or blank
// helpcontext = topic to list relevant help pages; only if page blank
function openhelp(page,helpcontext) {
	var url;
	if(!page) url='../help/index.php?'+helpcontext;
	else if(page.indexOf('.')<0) url='../help/'+page+'.html';  // go to specific help page
	else url='../help/'+page;  // usually for contact.php
	helpwin=window.open(
		url,
		'helpwin',
		'width=560,height=500,scrollbars=yes,resizable=yes,location=yes,toolbar=no,directories=no,status=no'
	);
	try {helpwin.focus();}  // msie may have window in background, so bring it front
	catch(e) {alert('Turn off your pop-up blocker to see the Help window.');}
}

// open video in popup window
function openvideo(v) {
	var path=(document.URL.indexOf('https://')!=-1)?  // no ssl for videos
		'http://jupitergrades.com' : '..';
	helpwin=window.open(
		path+'/videos/index.php?'+v,
		'helpwin',
		'width='+screen.width+',height='+screen.height+',left=0,top=0,scrollbars=yes,resizable=yes,toolbar=no,location=no,directories=no,status=no'
	);
	try {helpwin.focus();}  // for msie
	catch(e) {alert('Turn off your pop-up blocker to see the Video window.');}
}

