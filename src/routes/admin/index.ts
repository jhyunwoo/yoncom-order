import {Hono} from "hono";
import {Bindings, Variables} from "../../lib/bindings";
import auth from "./auth";
import deposit from "./deposit";
import image from "./image";
import adminMenu from "./menu";
import adminOrder from "./order";
import adminRole from "./role";
import adminTable from "./table";

const admin = new Hono<{Bindings: Bindings, Variables: Variables}>()

admin.route('/auth', auth)
admin.route('/deposit', deposit)
admin.route('/image', image)
admin.route('/menu', adminMenu)
admin.route('/order', adminOrder)
admin.route('/role', adminRole)
admin.route('/table', adminTable)

export default admin