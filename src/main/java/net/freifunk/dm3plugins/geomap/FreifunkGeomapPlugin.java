package net.freifunk.dm3plugins.geomap;

import de.deepamehta.plugins.workspaces.WorkspacesPlugin;

import de.deepamehta.plugins.accesscontrol.AccessControlPlugin;
import de.deepamehta.plugins.accesscontrol.AccessControlPlugin.Permission;
import de.deepamehta.plugins.accesscontrol.AccessControlPlugin.Role;
import de.deepamehta.plugins.accesscontrol.model.Permissions;

import de.deepamehta.core.model.DataField;
import de.deepamehta.core.model.Topic;
import de.deepamehta.core.model.TopicType;
import de.deepamehta.core.service.Plugin;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;



public class FreifunkGeomapPlugin extends Plugin {

    private static final String FREIFUNK_WORKSPACE_NAME = "Freifunk";

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private AccessControlPlugin accessControl;
    private WorkspacesPlugin workspaces;

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods



    // **************************************************
    // *** Hooks (called from DeepaMehta 3 framework) ***
    // **************************************************



    @Override
    public void postInstallPluginHook() {
        createFreifunkWorkspace();
        initACL();
    }

    @Override
    public void providePropertiesHook(Topic topic) {
        if (topic.typeUri.equals("net/freifunk/topictype/freikarte") ||
            topic.typeUri.equals("net/freifunk/topictype/access_point")) {
            //
            topic.setProperty("de/deepamehta/core/property/longitude",
                dms.getTopicProperty(topic.id, "de/deepamehta/core/property/longitude"));
            topic.setProperty("de/deepamehta/core/property/latitude",
                dms.getTopicProperty(topic.id, "de/deepamehta/core/property/latitude"));
        }
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private void createFreifunkWorkspace() {
        // create workspace
        workspaces = (WorkspacesPlugin) dms.getPlugin("de.deepamehta.3-workspaces");
        Topic workspace = workspaces.createWorkspace(FREIFUNK_WORKSPACE_NAME);
        // assign "Access Point" type
        TopicType apType = dms.getTopicType("net/freifunk/topictype/access_point", null);     // clientContext=null
        workspaces.assignType(workspace.id, apType.id);
        // assign "Freifunk Community" type
        TopicType fcType = dms.getTopicType("net/freifunk/topictype/community", null);        // clientContext=null
        workspaces.assignType(workspace.id, fcType.id);
    }

    private void initACL() {
        // Note: the Freifunk plugin must be installed *after* the Access Control plugin.
        // FIXME: remove that constraint by providing public plugin API as OSGi service.
        accessControl = (AccessControlPlugin) dms.getPlugin("de.deepamehta.3-accesscontrol");
        //
        Permissions permissions = new Permissions();
        permissions.add(Permission.WRITE, false);
        permissions.add(Permission.CREATE, true);
        //
        // *Everyone* can create a "Freikarte"
        TopicType fkType = dms.getTopicType("net/freifunk/topictype/freikarte", null);
        accessControl.createACLEntry(fkType.id, Role.EVERYONE, permissions);
        // *Members* of the Freifunk workspace can create "Access Points".
        TopicType apType = dms.getTopicType("net/freifunk/topictype/access_point", null);
        accessControl.createACLEntry(apType.id, Role.MEMBER, permissions);
        // *Members* of the Freifunk workspace can create "Freifunk Communities".
        TopicType fcType = dms.getTopicType("net/freifunk/topictype/community", null);
        accessControl.createACLEntry(fcType.id, Role.MEMBER, permissions);
    }
}
