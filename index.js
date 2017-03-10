module.exports = function(text) {
	const ar = text
    .replace(/>\s{0,}</g,"><")
    .replace(/</g,"~::~<")
    .replace(/xmlns\:/g,"~::~xmlns:")
    .replace(/xmlns\=/g,"~::~xmlns=")
    .split('~::~');

  const shift = ['\n'];
	const step = '    '; // 2 spaces
  const tags = ['uses-permission', 'uses-sdk', 'application'];

	let inComment = false;
	let deep = 0;
	let str = '';
	let ix = 0;
  let prevName = '';

	var maxdeep = 100; // nesting level

	// initialize array with shifts //
	for(ix=0;ix<maxdeep;ix++) shift.push(shift[ix]+step); 

  for(ix=0; ix<ar.length; ix++) {

    // \n <eml/>
    const tagName = /^<([\w-:]+)/gi.exec(ar[ix]);
    if (tagName && tags.indexOf(tagName[1]) > -1 && tagName[1] !== prevName) {
      str += '\n';
      prevName = tagName[1];
    }

    // <eml \n />
    if (ar[ix].search(/<\w/) > -1 && / .+ /g.test(ar[ix])) {
      ar[ix] = ar[ix].replace(/ /gi, shift[deep] + step);
    }

    // start comment or <![CDATA[...]]> or <!DOCTYPE //
    if(ar[ix].search(/<!/) > -1) { 
      str += shift[deep]+ar[ix];
      inComment = true; 
      // end comment  or <![CDATA[...]]> //
      if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) { 
        inComment = false; 
      }
    } else 
    // end comment  or <![CDATA[...]]> //
    if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) { 
      str += ar[ix];
      inComment = false; 
    } else 
    // <elm></elm> //
    if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
      /^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) { 
      str += ar[ix];
      if(!inComment) deep--;
    } else
    // <elm> //
    if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
      str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];
    } else 
    // <elm>...</elm> //
    if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
      str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
    } else 
    // </elm> //
    if(ar[ix].search(/<\//) > -1) { 
      str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
    } else 
    // <elm/> //
    if(ar[ix].search(/\/>/) > -1 ) {
      ar[ix] = ar[ix].replace('/>', ' />');
      str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
    } else 
    // <? xml ... ?> //
    if(ar[ix].search(/<\?/) > -1) { 
      str += shift[deep]+ar[ix];
    } else 
    // xmlns //
    if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) { 
      if (/ .+ /g.test(ar[ix])) {
        ar[ix] = ar[ix].replace(/ /gi, shift[deep]);
      }
      str += shift[deep]+ar[ix];
    } 
    
    else {
      str += ar[ix];
    }
  }
		
	return  (str[0] == '\n') ? str.slice(1) : str;
}