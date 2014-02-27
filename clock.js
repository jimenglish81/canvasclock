function Clock(el, size) {
	this._el = el;
	this._size = size;
}

Clock.prototype._timer = null;

Clock.prototype.initialise = function() {
	var canvas = document.createElement('canvas');
	canvas.height = this._size;
	canvas.width = this._size;
	this._context = canvas.getContext('2d');
	this._el.appendChild(canvas);
	
	this._lighter ="rgba(85,85,85,1)";
	this._darker = "rgba(0,0,0,1)";
	this._highlight = "rgba(255,0,0,1)";
	this._faceColor = "rgba(255,255,255,1)";
	this._faceBorderColor = "rgba(192,192,192,1)";
	this._minuteMarkColor = "rgba(85,85,85,0.4)";
	
	this._center = this._size / 2;
	this._innerCenter = this._center * 0.82;
	this._thinLine = this._size * 0.01;
	this._thickLine = this._size * 0.02;
	this._faceBorderLine = this._size * 0.06;
	
	this._fontSize = this._size * 0.04;
	this._fontFamily = this._romanEnabled ? "Times New Roman" : "Arial"; // get computed style
	
	this._buffer = canvas.cloneNode(true);
	this._bufferContext = this._buffer.getContext('2d');
	this._preRender();
	 
	this._tick();
	return this;
};

Clock.prototype.withMinuteMarks = function() {
	this._minuteMarksEnabled  = true;
	return this;
};

Clock.prototype.withNumbers = function() {
	this._numbersEnabled  = true;
	return this;
};

Clock.prototype.withLabel = function(label, customFont) {
	this._label = label;
	this._customFont = customFont;
	return this;
};

Clock.prototype.withRomanNumerals = function() {
	this._numbersEnabled = true;
	this._romanEnabled = true;
	return this;
};

Clock.prototype._drawHand = function(x, y, color, width) {
	var ctx = this._context;
	var center = this._size / 2;
	ctx.shadowColor = this._minuteMarkColor;
	ctx.shadowBlur = width;
	ctx.shadowOffsetX = this._thinLine;
	ctx.shadowOffsetY = this._thinLine;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineWidth = width;
	ctx.strokeStyle = color;
	ctx.lineTo(center, center);
	ctx.closePath();
	ctx.stroke();
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
};


Clock.prototype._convertToNumeral = function(number) {
	var numeral = '';
	if (number < 4) {
		numeral = new Array(number + 1).join('I');
	} else if (number == 4) {
		numeral = 'IV';
	} else if (number == 5) {
		numeral = 'V';
	} else if (number < 9) {
		numeral = 'V' + (new Array(number - 4).join('I'));
	} else if (number == 9) {
		numeral = 'IX';
	} else if (number == 10) {
		numeral = 'X';
	} else if (number > 10) {
		numeral = 'X' + (new Array(number - 9).join('I'));
	}
	return numeral;
};

Clock.prototype._getFontOffset = function(text, fontSize) {
	fontSize = fontSize || this._fontSize;
	text = '' + text;
	return [
		text.length * (fontSize * 0.2),
		fontSize * 0.6
	]
};

Clock.prototype._preRender = function() {
	var ctx = this._bufferContext;
	var angle = Math.PI * 3/2;
	var hour = 0;
	
	var lighter = this._lighter;
	var darker = this._darker;
	var highlight = this._highlight;
	var faceColor = this._faceColor;
	var faceBorderColor = this._faceBorderColor;
	var minuteMarkColor = this._minuteMarkColor;
	
	var center = this._center;
	var innerCenter = this._innerCenter;
	var thinLine = this._thinLine;
	var thickLine = this._thickLine;
	var faceBorderLine = this._faceBorderLine;
	var fontFamily = this._fontFamily;	
	
	var pi2 = Math.PI * 2;	
	var faceAngleDelta = pi2 / 12;
	var fontSize = this._fontSize;
	var fontOffset = fontSize / 2;
	
	// draw clock face
	ctx.strokeStyle = faceBorderColor;
	ctx.fillStyle = faceColor;
	ctx.beginPath();
	ctx.lineWidth = faceBorderLine;
	ctx.arc(center, center, center * 0.92, 0, pi2, true); 
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	if (this._minuteMarksEnabled) {
		// minute lines
		var minuteMarkAngleDelta = pi2 / 60;
		var minuteMarkAngle = angle;
		for (var i = 0; i < 60; i++) {
			ctx.beginPath();
			ctx.fillStyle = minuteMarkColor;
		
			x = (innerCenter) * Math.cos( minuteMarkAngle ) + center;
			y = (innerCenter) * Math.sin( minuteMarkAngle ) + center;
		
			ctx.fillRect(x, y, thinLine, thinLine);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
			minuteMarkAngle += minuteMarkAngleDelta;
		}
	}
	
	// numbers
	ctx.font = fontSize + "pt " + fontFamily;
	for (var i = 0; i < 12; i++) {
		ctx.beginPath();
		ctx.fillStyle = darker;
		
		x = (innerCenter * 0.92) * Math.cos( angle ) + center;
		y = (innerCenter * 0.92) * Math.sin( angle ) + center;
		
		if (this._numbersEnabled) {
			hour = i % 13 || 12;
			if (this._romanEnabled) {
				hour = this._convertToNumeral(hour); 
			}
			fontOffset = this._getFontOffset(hour);
			x -= fontOffset[0];
			y += fontOffset[1];
			ctx.fillText(hour, x, y);
	    } else {
			ctx.arc(x, y, thickLine, 0, pi2, true);	
		}
		ctx.fill();
		ctx.closePath();
		angle += faceAngleDelta;
	}
};

Clock.prototype._tick = function() {
	var now = new Date();
	var ctx = this._context;
	var x = 0;
	var y = 0;
	var hours = now.getHours() % 12;
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var milliseconds = now.getMilliseconds();

	var center = this._center;
	var innerCenter = this._innerCenter;
	var thinLine = this._thinLine;
	var thickLine = this._thickLine;
	var lighter = this._lighter;
	var darker = this._darker;
	var highlight = this._highlight;
	var faceColor = this._faceColor;
	var fontFamily = this._fontFamily;
	
	var labelFontSize = this._fontSize * 0.98;
	var baseAngle = Math.PI * 3/2;
	var centerDot = this._size * 0.025;	
	var pi2 = Math.PI * 2;
	var pi60 = pi2 / 60;
	var pi12 = pi2 / 12;
	
	ctx.clearRect(0, 0, this._size, this._size);
	ctx.drawImage(this._buffer, 0, 0);
	
	// label
	if (this._label) { 
		labelOffset = this._getFontOffset(this._label, labelFontSize);
		ctx.beginPath();
		ctx.font = 'italic ' + labelFontSize + "pt " + (this._customFont || fontFamily);
		ctx.fillStyle = lighter;
		ctx.fillText(this._label, center - labelOffset[0], innerCenter * 0.6);
		ctx.fill();
		ctx.closePath();	
	}
	
	// minutes
	minutes = minutes + (seconds / 60);
	x = (innerCenter * 0.92) * Math.cos( baseAngle + pi60 * minutes ) + center;
	y = (innerCenter * 0.92) * Math.sin( baseAngle + pi60 * minutes ) + center;
	this._drawHand(x, y, lighter, thickLine);
	
	// hours
	hours = hours + (minutes / 60);
	x = (innerCenter * 0.65) * Math.cos( baseAngle + pi12 * hours ) + center;
	y = (innerCenter * 0.65) * Math.sin( baseAngle + pi12 * hours ) + center;
	this._drawHand(x, y, lighter, thickLine);

	// seconds	
	seconds = seconds + (milliseconds / 1000); // tick or smooth?
	x = (innerCenter * 0.92) * Math.cos( baseAngle + pi60 * seconds ) + center;
	y = (innerCenter * 0.92) * Math.sin( baseAngle + pi60 * seconds ) + center;
	this._drawHand(x, y, highlight, thinLine);
	
	// circle at end of hand
	x = (innerCenter * 0.85) * Math.cos( baseAngle + pi60 * seconds ) + center;
	y = (innerCenter * 0.85) * Math.sin( baseAngle + pi60 * seconds ) + center;
	ctx.beginPath();
	ctx.arc(x, y, thinLine, 0, pi2, true);
	ctx.fillStyle = faceColor;
	ctx.strokeStyle = highlight;
	ctx.lineWidth = thinLine;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	// center
	ctx.beginPath();
	ctx.arc(center, center, centerDot, 0, pi2, true);
	ctx.fillStyle = darker;
	ctx.fill();
	ctx.closePath();
		
	this._timer = setTimeout(this._tick.bind(this), 100);
};


