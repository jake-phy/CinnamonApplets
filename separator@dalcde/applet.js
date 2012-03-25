const Applet = imports.ui.applet;

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextApplet.prototype,

    _init: function(orientation){
	Applet.TextApplet.prototype._init.call(this, orientation);

	try{
	    this.set_applet_label(" | ");
	}
	catch (e){
	    global.logError(e);
	}
    }
};

function main(metadata, orientation){
    let myApplet = new MyApplet(orientation);
    return myApplet;
}