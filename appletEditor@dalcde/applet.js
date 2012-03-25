// -*- mode: js; js-indent-level: 4; indet-tabs-mode: nil -*-

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Applet = imports.ui.applet;
const AppletManager = imports.ui.appletManager;
const Main = imports.ui.main;

function Viewer(){
    this._init();
}

Viewer.prototype = {

    _init: function(){
        this.actor = new St.BoxLayout({style_class: "modal-dialog", vertical: true});
        this.actor.hide();

//        let monitor = Main.layoutManager.focusMonitor;
//        this.actor.set_position((monitor.width - this.actor.width)/2, (monitor.height - this.actor.height)/2);
        this.open = false;

        this.userAppletsPath = GLib.build_filenamev([global.userdatadir, 'applets']);
        this.userAppletsDir = Gio.file_new_for_path(this.userAppletsPath);

        try{
            if (!this.userAppletsDir.query_exists(null))
                this.userAppletsDir.make_directory_with_parents(null);
        }catch (e){
            global.logError("" + e);
	}

        this.settings = new Gio.Settings({schema: "org.cinnamon"});

        this.enabledApplets = this.settings.get_strv("enabled-applets");
        this.load();
    },

    toggle: function(){
        if (this.open){
            this.actor.hide();
            this.open = false;
        } else {
            this.actor.show();
            this.open = true;
        }
    },

    getAllApplets: function() {
        let directory = null;
        let fileEnum;
        let file, info;
        let uuidList = [];
        try{
            fileEnum = this.userAppletsDir.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
        } catch (e) {
            global.logError("" + e);
            return null;
	}

        while ((info = fileEnum.next_file(null)) != null){
            if (info.get_file_type() != Gio.FileType.DIRECTORY)
	        continue;
            uuidList.push(info.get_name());
        }
        fileEnum.close(null);

        let systemDataDirs = GLib.get_system_data_dirs();
        for (let i = 0; i < systemDataDirs.length; i++){
            let dirPath = systemDataDirs[i] + '/cinnamon/applets';
            let dir = Gio.file_new_for_path(dirPath);
            if (dir.query_exists(null)){
                try{
                    fileEnum = dir.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
                } catch (e) {
                    global.logError("" + e);
                    return null;
                }
                while ((info = fileEnum.next_file(null)) != null){
                    if (info.get_file_type() != Gio.FileType.DIRECTORY)
                        continue;
                    uuidList.push(info.get_name());
                }
                fileEnum.close(null);
            }
        }
        return uuidList;
    },

    getEnabledApplets: function(){
        this.enabledApplets = this.settings.get_strv("enabled-applets");
        let uuidList = [];
        for(let i = 0; i < this.enabledApplets.length; i++){
            let currApplet = this.enabledApplets[i];
            let elements = currApplet.split(":");
            if (elements.length == 4){
                uuidList.push(elements[3]);
            }
        }
        return uuidList;
    },

    getDisabledApplets: function(){
        let allApplets = this.getAllApplets();
        let enabled = this.getEnabledApplets();
        for (let i = 0; i < enabled.length; i++){
            allApplets.splice(allApplets.indexOf(enabled[i]), 1);
        }
        return allApplets;
    },

    load: function(){
        let applets = this.getDisabledApplets();
        for (let i = 0; i < applets.length; i++){
            let directory = AppletManager._find_applet(applets[i]);
            if (directory != null) {
                let applet = AppletManager.loadApplet(applets[i], directory, St.Side.TOP);
                this.actor.add(applet.actor);
            }
        }
    }
};

function MyApplet(orientation){
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation){
        Applet.IconApplet.prototype._init.call(this, orientation);
        this.set_applet_icon_name("gnome-panel");
        this.set_applet_tooltip(_("Enable Applets"));

        this.viewer = new Viewer();

        Main.uiGroup.add_actor(this.viewer.actor);
    },

    on_applet_clicked: function(){
        this.viewer.toggle();
    },

};

function main(metadata, orientation){
    let myApplet = new MyApplet(orientation);
    return myApplet;
}