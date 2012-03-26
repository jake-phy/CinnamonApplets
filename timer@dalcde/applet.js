const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;

function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextApplet.prototype,

    _init: function(orientation){
	Applet.TextApplet.prototype._init.call(this, orientation);

 	this._settings = new Gio.Settings({ schema: 'org.cinnamon.applets.timer'});

	this.recording = (this.get('start-time') != -1);
	this.previousTime = this.get('previous-time');

	this.name = this.get('name')+": ";
	this.update();

        this.set_applet_label(this.name + this._getParsedTime());

        this._applet_context_menu.addAction(_("Restart Timer"), Lang.bind(this, function(event){
            this.restart();
        }));
    },

    _getTotalTime: function(){
	if (!this.recording){
	    return this.previousTime;
	}else{
	    return this.previousTime + this._getTime() - this.get('start-time');
	}
    },

    _getParsedTime: function(){
	let seconds = this._getTotalTime();
	if (seconds < 60){
	    return seconds + "";
	}else if(seconds < 3600){
	    let minutes = Math.floor(seconds/60);
	    seconds = seconds - minutes*60;
	    if (seconds < 10){
		seconds = "0" + seconds;
	    }
	    return minutes + ":" + seconds;
	}else{
	    let hours = Math.floor(seconds/3600);
	    let minutes = Math.floor((seconds-hours*3600)/60);
	    seconds = seconds - hours*3600 - minutes*60;
	    if (minutes < 10){
		minutes = "0" + minutes;
	    }
	    if (seconds < 10){
		seconds = "0" + seconds;
	    }
	    return hours + ":" + minutes + ":" + seconds;
	}
    },

    _getTime: function(){
	let d = new Date();
	return Math.floor(d.getTime()/1000);
    },

    _onButtonRelease: function(actor, event){
        if (button==3){
	    this._menu.toggle();
	}
    },

    on_applet_clicked: function(){
	if (!this.recording){
	    this.start();
	}else{
	    this.stop();
	}
    },

    update: function(){	
	Mainloop.timeout_add(1000, Lang.bind(this, this.update));
	if (this.recording){
            this.set_applet_label(this.name + this._getParsedTime());
	}
    },

    restart: function(){
	this.write('previous-time', 0);
	this.previousTime = 0;
	this.write('start-time', -1);
	this._time.set_text(0+"");
    },

    start: function(){
	this.write('start-time', this._getTime());
	this.recording = true;
    },

    stop: function(){
	this.previousTime=this._getTotalTime();
	this.write('previous-time', this.previousTime);
 	this.write('start-time', -1);
	this.recording = false;
    },

    write: function(variable, value){
	if (variable == 'name'){
	    this._settings.set_string('name', value);
	}else{
	    this._settings.set_int(variable, value);
	}
    },

    get: function(variable){
	if (variable == 'name'){
	    return this._settings.get_string('name');
	}else{
	    return this._settings.get_int(variable);
	}
    }
};

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}