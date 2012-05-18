const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const AppFavorites = imports.ui.appFavorites;
const PopupMenu = imports.ui.popupMenu;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const DND = imports.ui.dnd;

const MENU_SCHEMAS = "org.cinnamon.applets.classicMenu";
let menuSettings = new Gio.Settings({schema: MENU_SCHEMAS});

const FAV_ICON_SIZE = menuSettings.get_int("favorites-icon-size");

let appSys = Cinnamon.AppSystem.get_default();

const AppletMeta = imports.ui.appletManager.applets["classicMenu@dalcde"];
const FavSys = AppletMeta.favSys;

let favInstance = FavSys.getFavSys();

let DRAGGING = false;
let listInUse = new Array();
let root = null;

function FavButton(i, j, menu){
    this._init(i, j, menu);
}

FavButton.prototype = {
    _init: function(i, j, menu){
	this.i = i;
	this.j = j;
        this.menu = menu;

	this.actor = new St.Bin({reactive: true, track_hover: true});
        this._id = listInUse[i][j];
        this.app = appSys.lookup_app(this._id)
        if (!this.app) this.app = appSys.lookup_settings_app(this._id);

        this.name = this.app.get_name();
        this.description = this.app.get_description();

        if (this.description ==null) this.description = "";

        this.nameLabel = new St.Label({text: this.name, style_class: "favorites-label"});
        this.descriptionLabel = new St.Label({text: this.description});
        this.icon = this.app.create_icon_texture(FAV_ICON_SIZE);

        this.vertBox = new St.BoxLayout({vertical: true});
        this.vertBox.add(this.nameLabel);
        this.vertBox.add(this.descriptionLabel, {y_align: St.Align.END});

        this.horBox = new St.BoxLayout();
        this.horBox.style = "width: 225px;";
        this.horBox.add(this.icon, {y_align: St.Align.MIDDLE});
        this.horBox.add(this.vertBox, {y_align: St.Align.MIDDLE});

	this.actor.set_child(this.horBox);

 	this.actor._delegate = this;

        this.setActive(false);
        this._draggable = DND.makeDraggable(this.actor);
        this._draggable.connect('drag-begin', Lang.bind(this, this._onDragBegin));
//        this._draggable.connect('drag-end', Lang.bind(this, this._onDragEnd));

	this.actor.connect('button-release-event', Lang.bind(this, this._onButtonReleaseEvent));
        this.actor.connect('notify::hover', Lang.bind(this, this._onHoverChanged));
    },

    _onButtonReleaseEvent: function(actor, event){
        if (event.get_button()==1)
            this.activate();
    },

    _onHoverChanged: function(actor){
        this.setActive(actor.hover);
    },

    setActive: function(active){
        if (active)
            this.actor.style_class = 'menu-category-button-selected';
        else
            this.actor.style_class = 'menu-category-button';
    },

    activate: function(){
        this.app.open_new_window(-1);
        this.menu.close();
    },

    getDragActor: function(){
        return new Clutter.Clone({ source: this.actor });
    },

    getDragActorSource: function(){
	return this.actor;
    },

    _onDragBegin: function(){
        DRAGGING = true;
        this.allocated = false;
//        listInUse[this.i].splice(this.j, 1);
//        root.load();
    },

    _onDragEnd:function(){
//        if (!this.allocated)
//            listInUse[this.i].splice(this.j, 0, this._id);
    }
}

function FavSubBox(menu, parent){
    this._init(menu, parent);
}

FavSubBox.prototype = {
    _init: function(menu, parent){
        this.menu = menu;
	this.parent = parent;
        this.actor = new St.BoxLayout();
	this.box = new St.BoxLayout();
	this._dragPlaceholder = null;
	this._dragPlaceholderHeight = -1;
	this._dragPlaceholderLeft = false;
	this.actor._delegate = this;
        this.actor.add_actor(this.box);
    },

    load: function(i){
	this.i = i;
	this.box.get_children().forEach(Lang.bind(this, function(child){child.destroy();}));

        this.leftCol = new St.BoxLayout({vertical: true});
        this.rightCol = new St.BoxLayout({vertical: true});

        this.box.add_actor(this.leftCol);
        this.box.add_actor(this.rightCol);
	this.buttons = new Array();
        for (let j in listInUse[i]){
            let k = j % 2;
            let button = new FavButton(i, j, this.menu);
            if (k == 0)
                this.leftCol.add_actor(button.actor);
            else
                this.rightCol.add_actor(button.actor);
	    this.buttons.push(button);
        }
    },

    handleDragOver: function(source, actor, x, y, time){
/*	if (!(source instanceof FavButton)) return DND.DragMotionResult.NO_DROP;

	let centerX = this.buttons[0].actor.get_allocation_box().x2;
	let left;
	if (x < centerX)
	    left = true;
	else
	    left = false;

        let h = 0;
        for (let i in this.buttons){
            if (y > this.buttons[i].actor.get_allocation_box().y1 + this.buttons[i].actor.height / 2) h = i/2;
        }

	if (h != this._dragPlaceholderHeight || left != this._dragPlaceholderLeft){
	    this._dragPlaceholderHeight = h;
	    this._dragPlaceholderLeft = left;
//	    if (this.source.j == pos && this.buttons.indexOf(source) != -1){
//		if (this.dragPlaceholderPos) this._dragplaceholder.animateOutAndDestroy();
//		this._dragPlaceholder = null;
//		return DND.DragMotionResult.CONTINUE;
//	    }
	}
    
	let pos = h*2;
	if (left) pos++;

	if (this._dragPlaceholder)
	    this._dragPlaceholder.actor.destroy();

	this._dragPlaceholder = new DND.GenericDragPlaceholderItem();
	this._dragPlaceholder.child.set_width(source.actor.width);
	this._dragPlaceholder.child.set_height(source.actor.height);

//	this.buttons.splice(0, 0, this._dragPlaceholder);
	this.reload();
	return DND.DragMotionResult.MOVE_DROP;*/
    },

    acceptDrop: function(source, actor, x, y, time) {
/*	if (!(source instanceof FavButton)) return false;

        DRAGGING = false;
	if (!this._dragPlaceholderLeft && FavList[this.i].length == this._dragPlaceholderHeight*2)
	    this._dragPlaceholderLeft = true;
	pos = this._dragPlaceholderHeight*2;
	if (!this._dragPlaceholderLeft) pos ++;

	desktopFile = FavList[source.i][source.j];
	if (source.i == this.i)
	    if (source.j < pos)
		pos --;
        source.allocated = true;
	listInUse[this.i].splice(pos, 0, desktopFile);
	if(this._dragPlaceholder){
	    this._dragPlaceholder.animateOutAndDestroy();
	    this._dragPlaceholder = null;
	    this._dragPlaceholderHeight = -1;
	    this._dragPlaceholderLeft = false;
	}

	actor.destroy();
	return true;*/
    }
}

function FavBox(menu, leftBox, rightHeader){
    this._init(menu, leftBox, rightHeader);
}

FavBox.prototype = {
    _init: function(menu, leftBox, rightHeader){
        root = this;
        this.menu = menu;
        this.leftBox = leftBox;
        this.rightHeader = rightHeader;

        this.actor = new St.BoxLayout();
        this.box = new St.BoxLayout();

        this.scrollBox = new St.ScrollView({x_fill: true, y_fill: true, y_align: St.Align.START, style_class: 'vfade menu-applications-scrollbox'});
        this.scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.actor.add_actor(this.scrollBox);

        this.load();
        this.scrollBox.add_actor(this.box);
        favInstance.connect("changed", Lang.bind(this, this.load));
    },

    load: function(){
        //Update list if not dragging
        if (!DRAGGING) listInUse = favInstance._list;

        this.scrollBox.remove_actor(this.box);
	this.box.destroy();
        this.box = new St.BoxLayout({vertical: true});
	this.subBox = new Array();
//loading first section
	if (listInUse.length != 0){
	    let sub = new FavSubBox(this.menu, this);
	    sub.load(0);
	    this.subBox.push(sub);
	    this.box.add_actor(sub.actor);
	}
//loading other sections
	for (let i = 1; i < listInUse.length; i++){
	    let sub = new FavSubBox(this.menu, this);
	    sub.load(i);
	    this.subBox.push(sub);
	    this.box.add_actor(new PopupMenu.PopupSeparatorMenuItem().actor);
	    this.box.add_actor(sub.actor);
	}
        this.scrollBox.add_actor(this.box);
    },

    _onOpenStateChangedFav: function(menu, open){
        if(open){
            let scrollBoxHeight = this.leftBox.get_allocation_box().y2-this.leftBox.get_allocation_box().y1 - (this.rightHeader.get_allocation_box().y2 - this.rightHeader.get_allocation_box().y1);

            this.scrollBox.style = "height: " + scrollBoxHeight+"px;"
        }
    }
};