const Applet = imports.ui.applet;
const Tweener = imports.ui.tweener;
const Cinnamon = imports.gi.Cinnamon;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;
const Util = imports.misc.util;

const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;

let appsys = Cinnamon.AppSystem.get_default();

function TakeoffLauncher(){
    this._init();
}

TakeoffLauncher.prototype = {
    
    _init: function() {
        this.actor = new Cinnamon.GenericContainer();
        this.chooser = new TabChooser();

        this.actor.add_actor(this.chooser.actor);

        this.tab = new TakeoffTab(null);
        this.add(tab);
        this.open = false;
    },

    add: function(tab){
        this.actor.add(tab);
        this.chooser.addItem(tab); 
    }

    toggle: function(){
        if (this.open){
            this.actor.show();
            Tweener.addTween(this.actor, {opacity: 255,
                                          time: 0.1,
                                          transition: "easeOutQuad"});
        } else {
            Tweener.addTween(this.actor, {opacity: 255,
                                          time: 0.1,
                                          transition: "easeOutQuad",
                                          onComplete: Lang.bind(this, 
                                                                function(){
                                                                    this.actor.hide()
                                                                })});

        }
    }
};

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(){
        try {
            this.set_applet_tooltip(_("Takeoff Launcher"));

            this._updateIcon();

            global.settings.connect("changed::menu-icon", Lang.bind(this, function() {
                this._updateIcon();
            }))

            this.set_applet_label(_("Menu"));

            let menuLabel = global.settings.get_string("menu-text");
            if (menuLabel != "Menu"){
                this.set_applet_label(menuLabel);
            }
            global.settings.connect("changed::menu-text", Lang.bind(this, function() {
                this.set_applet_label(global.settings.get_string("menu-text"));
            }));

            this.edit_menu_item = new Applet.MenuItem(_("Edit menu"), Gtk.STOCK_EDIT, Lang.bind(this, this._launch_editor));
            this._applet_context_menu.addMenuItem(this.edit_menu_item);

            this.takeoffLauncher = new TakeoffLauncher();
        } catch (e) {
            global.logError(e);
        }
    },

    _updateIcon: function(){
        let icon_file = global.settings.get_string("menu-icon");
        try{
            this.set_applet_icon_path(icon_file);
        } catch (e) {
            global.log("WARNING: Could not load icon file \"" + icon_file + "\" for menu button");
        }
    },

    _launch_editor: function() {
        Util.spawnCommandLine("cinnamon-menu-editor");
    },

    on_applet_clicked: function() {
        this.takeoffLauncher.toggle();
    }
}

function main(metadata, orientation){
    let myApplet = new MyApplet(orientation);
    return myApplet;
}