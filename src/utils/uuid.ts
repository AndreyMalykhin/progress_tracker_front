import { v4 } from "uuid";

function uuid() {
    return "temp-" + v4();
}

export default uuid;
