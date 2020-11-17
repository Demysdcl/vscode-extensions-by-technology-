"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersConstants = void 0;
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
class ServersConstants {
}
exports.ServersConstants = ServersConstants;
/*
 * Object holding information about pair: server default output name and server download name
*/
ServersConstants.WILDFLY_SERVERS = {
    //'wildfly-18.0.1.Final': "WildFly 18.0.1 Final",
    'wildfly-19.1.0.Final': "WildFly 19.1.0 Final"
};
ServersConstants.EAP_SERVERS = {
    "jboss-eap-7.3.0": "Red Hat JBoss EAP 7.3.0"
};
ServersConstants.TEST_SERVERS = Object.assign(Object.assign({}, ServersConstants.WILDFLY_SERVERS), ServersConstants.EAP_SERVERS);
//# sourceMappingURL=serverConstants.js.map