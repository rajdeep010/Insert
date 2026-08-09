import { getDatabase } from 'firebase/database'
import { getStorage } from "firebase/storage";

import { app } from "@/lib/firebase";

const db = getDatabase(app)
const storage = getStorage(app)

export default db
export {storage}
