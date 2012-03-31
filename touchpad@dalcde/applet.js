const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;
const Gio = imports.gi.Gio;

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation){
        Applet.IconApplet.prototype._init.call(this, orientation);

	this.set_applet_tooltip(_("Touchpad on"));
	this._settings = new Gio.Settings({ schema: "org.gnome.settings-daemon.peripherals.touchpad"});

	this.menuManager = new PopupMenu.PopupMenuManager(this);
	this.appletMenu = new Applet.AppletPopupMenu(this, orientation);

	if(!this._settings.get_boolean("touchpad-enabled"))
	    this.set_applet_tooltip(_("Touchpad off"));
	
	this.touchpadEnabledSwitch = new PopupMenu.PopupSwitchMenuItem(_("Enable Touchpad"), this._settings.get_boolean("touchpad-enabled"));
	this.touchpadEnabledSwitch.connect('toggled', Lang.bind(this, this.onSwitchPressed));
	this._settings.connect('changed::touchpad-enabled', Lang.bind(this, this.onEnabledChanged));
	this.appletMenu.addMenuItem(this.touchpadEnabledSwitch);
	this.menuManager.addMenu(this.appletMenu);
	this.set_applet_icon_symbolic_name("input-touchpad-symbolic");
    },

    on_applet_clicked: function(){
	this.appletMenu.toggle();
    },

    onSwitchPressed: function(item){
	if(item.state){
	    this.set_applet_tooltip(_("Touchpad on"));
	    this._settings.set_boolean("touchpad-enabled", true);
	}else {
	    this.set_applet_tooltip(_("Touchpad off"));
	    this._settings.set_boolean("touchpad-enabled", false);
	}
    },

    onEnabledChanged: function(){
	if(this._settings.get_boolean('touchpad-enabled')){
	    this.set_applet_tooltip(_("Touchpad on"));
	    this.touchpadEnabledSwitch.setToggleState(true);
	} else {
	    this.set_applet_tooltip(_("Touchpad off"));
	    this.touchpadEnabledSwitch.setToggleState(false);
	}
    }
};

function main(metadata, orientation){
    let myApplet = new MyApplet(orientation);
    return myApplet;
}