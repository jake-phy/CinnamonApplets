const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;
const St = imports.gi.St;
const ModalDialog = imports.ui.modalDialog;

function queryLocation(timestamp){
    return this._init(timestamp);
}

queryLocation.prototype = {
    __proto__: ModalDialog.ModalDialog.prototype,

    _init: function(timestamp) {
	global.logError("Start");
	ModalDialog.ModalDialog.prototype._init.call(this, { styleClass: 'panel-launcher-add-dialog' });

	let box;
	let label = new St.Label();
	label.set_text(_("File Destination"));
	let box = new St.BoxLayout({ styleClass: 'panel-launcher-add-dialog-content-box' });
	let leftBox = new St.BoxLayout({ vertical: true, styleClass: 'panel-launcher-add-dialog-content-box-left' });
	let rightBox = new St.BoxLayout({ vertical: true, styleClass: 'panel-launcher-add-dialog-content-box-right' });
	this._fileEntry = new St.Entry({ styleClass: 'panel-launcher-add-dialog-entry', can_focus: true});
	leftBox.add(label, { x_align: St.Align.START, x_fill: false, x_expand: false });
	rightBox.add(this._fileEntry, {x_align: St.Align.END, x_fill: false, x_expand: false });

	box.add(leftBox);
	box.add(rightBox);
	this.contentLayout.add(box, {y_align: St.Align.START});

	this._fileEntry.grab_key_focus();
	this.setButtons([
	    {
		label: _("Start"),
		action: Lang.bind(function(){
		    this.close();
		    return _fileEntry.get_text();
		})
	    },
	    {
		label: _("Cancel"),
		key: Clutter.KEY_Escape,
		action: Lang.bind(this, function(){
		    this.close();
		    return -1;
		})
	    }
        ]);

	ModalDialog.ModalDialog.prototype.open.call(this, timestamp);
    }
}

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation) {
	Applet.IconApplet.prototype._init.call(this, orientation);

	try{
	    this.set_applet_tooltip(_("Click here to start recording desktop"));
	    this.set_applet_icon_name("media-record");
	}catch (e) {
	    global.logError(e);
	}

	this.itemAdvanced = new PopupMenu.PopupMenuItem("Advanced");
	this.itemAdvanced.connect('activate', this._onAdvancedActivated);
	this._applet_context_menu.addMenuItem(this.itemAdvanced);
    },


    _onAdvancedActivated: function() {
	GLib.spawn_command_line_async('gtk-recordMyDesktop');
    },

    on_applet_clicked: function(event) {
	let location = queryLocation(event.get_time());
	if (location == -1){
	}else{
           GLib.spawn_command_line_async('recordmydesktop --no-frame' + location);
	}
    }
};

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}
