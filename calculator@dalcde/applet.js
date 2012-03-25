const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;

const Gtk = imports.gi.Gtk;
const St = imports.gi.St;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;

const Meta = imports.ui.appletManager.appletMeta["calculator@dalcde"];

function Calculator(){
    this._init();
}

Calculator.prototype = {
    _init: function(){
        this.actor = new St.BoxLayout({vertical: true});

        this.str = "";

        this.label = new St.Label();
        this.buttons = new Array(4);

        this.buttons[0] = new Array(4);
        this.buttons[1] = new Array(4);
        this.buttons[2] = new Array(4);
        this.buttons[3] = new Array(4);

        this.buttons[0,0] = new St.Icon({icon_name: "key7",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[0,1] = new St.Icon({icon_name: "key8",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[0,2] = new St.Icon({icon_name: "key9",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[0,3] = new St.Icon({icon_name: "key+",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[1,0] = new St.Icon({icon_name: "key4",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[1,1] = new St.Icon({icon_name: "key5",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[1,2] = new St.Icon({icon_name: "key6",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[1,3] = new St.Icon({icon_name: "key-",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[2,0] = new St.Icon({icon_name: "key1",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[2,1] = new St.Icon({icon_name: "key2",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[2,2] = new St.Icon({icon_name: "key3",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[2,3] = new St.Icon({icon_name: "keytimes",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[3,0] = new St.Icon({icon_name: "key0",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[3,1] = new St.Icon({icon_name: "keydot",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[3,2] = new St.Icon({icon_name: "key=",
                                         icon_type: St.IconType.FULLCOLOR});
        this.buttons[3,3] = new St.Icon({icon_name: "keydiv",
                                         icon_type: St.IconType.FULLCOLOR});
        this.ac = new St.Icon({icon_name: "ac",
                               icon_type: St.IconType.FULLCOLOR});
 
        this.hor = new Array(4);

        this.horL = new St.BoxLayout();
        this.hor[0] = new St.BoxLayout();
        this.hor[1] = new St.BoxLayout();
n        this.hor[2] = new St.BoxLayout();
        this.hor[3] = new St.BoxLayout();

        this.actor.add(this.horL);
        this.horL.add(this.label);
        this.horL.add(this.ac);

        for (let i = 0; i < 4; i ++){
            this.actor.add(this.hor[i]);
            for (let j = 0; j < 4; j++){
//                this.hor[i].add(this.buttons[i][j]);
            }
        }
    }
};

function MyMenu(actor, orientation){
    this._init(actor, orientation);
}

MyMenu.prototype = {
    __proto__: PopupMenu.PopupMenu.prototype,

    _init: function(actor, orientation){
        PopupMenu.PopupMenu.prototype._init.call(this, actor, 0.0, orientation, 0);

        this.calculator = new Calculator();
        this.addActor(this.calculator.actor);
    }
}

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation){
        Applet.IconApplet.prototype._init.call(this, orientation);

        Gtk.IconTheme.get_default().append_search_path(Meta.path);

        this.set_applet_tooltip(_("Click to open calculator"));
        this.set_applet_icon_name("accessories-calculator");

        this.menuManager = new PopupMenu.PopupMenuManager();
        this.menu = new MyMenu(this.actor, orientation);
        this.menuManager.addMenu(this.menu);
    },

    on_applet_clicked: function(){
        this.menu.toggle();
    }
};

function main(metadata, orientation){
    let myApplet = new MyApplet(orientation);
    return myApplet;
}