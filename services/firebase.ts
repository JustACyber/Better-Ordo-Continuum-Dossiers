import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User,
  Auth
} from 'firebase/auth';
import { Character } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyB1gqid0rb9K-z0lKNTpyKiFpOKUl7ffrM",
  authDomain: "ordo-continuum-dossiers.firebaseapp.com",
  projectId: "ordo-continuum-dossiers",
  storageBucket: "ordo-continuum-dossiers.firebasestorage.app",
  messagingSenderId: "1017277527969",
  appId: "1:1017277527969:web:1ab73e9a064c76015c3de0",
  measurementId: "G-7CGN7MPC4G"
};

const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const APP_ID = 'ordo-continuum-v12';

// DB Context Types
export type DbContext = 'empire' | 'resistance';

// Paths
const EMPIRE_PATH = 'public/data/protocols';
const RESISTANCE_PATH = 'resistance/data/protocols';

// Local Storage Keys
const LS_KEY_EMPIRE = 'ordo_local_storage_db_v12';
const LS_KEY_RESISTANCE = 'ordo_local_storage_res_v1';

let isOfflineMode = false;
// Listeners now need to track which context they belong to, or we simply trigger all for simplicity in this scale
const listeners: Set<() => void> = new Set();

// Helper to get collection path based on context
const getCollectionPath = (ctx: DbContext) => {
    const subPath = ctx === 'resistance' ? RESISTANCE_PATH : EMPIRE_PATH;
    // Constructs: artifacts/ordo-continuum-v12/public/data/protocols OR artifacts/ordo-continuum-v12/resistance/data/protocols
    // Note: Firestore needs alternating collection/doc/collection. 
    // Structure: collection('artifacts') -> doc(APP_ID) -> collection('public' or 'resistance') -> doc('data') -> collection('protocols')
    // We need to be careful with the path construction.
    // Let's use a path string for internal logic consistency
    if (ctx === 'resistance') {
        return ['artifacts', APP_ID, 'resistance', 'data', 'protocols'];
    }
    return ['artifacts', APP_ID, 'public', 'data', 'protocols'];
};

const getLsKey = (ctx: DbContext) => ctx === 'resistance' ? LS_KEY_RESISTANCE : LS_KEY_EMPIRE;

const getLocalDB = (ctx: DbContext): Record<string, Character> => {
  try {
    return JSON.parse(localStorage.getItem(getLsKey(ctx)) || '{}');
  } catch {
    return {};
  }
};

const setLocalDB = (ctx: DbContext, data: Record<string, Character>) => {
  localStorage.setItem(getLsKey(ctx), JSON.stringify(data));
  listeners.forEach(l => l());
};

export const OrdoService = {
  auth,
  db,
  isOffline: () => isOfflineMode,
  
  init: (): Promise<User | { uid: string }> => {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, 
        (user) => {
          if (user) {
            unsub();
            resolve(user);
          } else {
            signInAnonymously(auth)
              .then((uc) => {
                unsub();
                resolve(uc.user);
              })
              .catch((err) => {
                console.warn("Firebase connection failed. Offline Mode.", err);
                isOfflineMode = true;
                unsub();
                resolve({ uid: 'offline-user' });
              });
          }
        },
        (error) => {
           console.warn("Firebase Auth Error. Offline Mode.", error);
           isOfflineMode = true;
           resolve({ uid: 'offline-user' });
        }
      );
    });
  },

  // Added context argument, default to 'empire' for backward compatibility
  subscribeAll: (callback: (data: Record<string, Character>) => void, context: DbContext = 'empire') => {
    if (isOfflineMode) {
      const handler = () => callback(getLocalDB(context));
      listeners.add(handler);
      handler(); 
      return () => { listeners.delete(handler); };
    }

    const pathSegments = getCollectionPath(context);
    // @ts-ignore - spread arguments for collection
    const collRef = collection(db, ...pathSegments);
    
    return onSnapshot(collRef, (snapshot) => {
      const data: Record<string, Character> = {};
      snapshot.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data() as Character;
      });
      callback(data);
    }, (err) => {
        console.warn(`Firebase Read Error (${context}). Fallback to local.`, err);
        isOfflineMode = true;
        callback(getLocalDB(context));
    });
  },

  subscribeOne: (id: string, callback: (data: Character | null) => void, context: DbContext = 'empire') => {
    if (isOfflineMode) {
      const handler = () => {
        const db = getLocalDB(context);
        callback(db[id] || null);
      };
      listeners.add(handler);
      handler();
      return () => { listeners.delete(handler); };
    }

    const pathSegments = getCollectionPath(context);
    // @ts-ignore
    const docRef = doc(db, ...pathSegments, id);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as Character);
      } else {
        callback(null);
      }
    }, (err) => {
        console.warn(`Firebase Read Error One (${context}). Fallback to local.`, err);
        isOfflineMode = true;
        const db = getLocalDB(context);
        callback(db[id] || null);
    });
  },

  create: async (name: string, context: DbContext = 'empire'): Promise<string> => {
    const id = name.toLowerCase().replace(/\s+/g, '_') + "_" + Math.floor(Math.random() * 10000);
    
    const newChar: Character = {
        id: id,
        meta: {
            name: name, rank: "Рекрут", image: "",
            class: "", archetype: "", race: "", subrace: "", background: "", level: 1,
            origin: "", age: "", job: "", clearance: "", comm: ""
        },
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, hp_curr: 0, hp_max: 0, hp_temp: 0, ac: 10, speed_mod: 0, shield_curr: 0, shield_max: 0 },
        saves: { prof_str: false, prof_dex: false, prof_con: false, prof_int: false, prof_wis: false, prof_cha: false },
        skills: { 
            data: {}, 
            bonuses: {} 
        },
        combat: { weapons: [], inventory: [] },
        abilities: [], traits: [], features: [],
        profs: { langs: [], tools: [], armory: [] },
        money: { u: 0, k: 0, m: 0, g: 0 },
        psych: { size: "Средний", age: "", height: "", weight: "", trait: "", ideal: "", bond: "", flaw: "", analysis: "" },
        psionics: { base_attr: "int", caster_type: "1", class_lvl: 2, mod_points: 0, points_curr: 0, spells: [] },
        universalis: { save_base: 8, save_attr: "int", custom_table: [], counters: [] },
        locks: { identity: false, biometrics: false, skills: false, equipment: false, psych: false, psionics: false, universalis: false }
    };

    if (isOfflineMode) {
      const db = getLocalDB(context);
      db[id] = newChar;
      setLocalDB(context, db);
      return id;
    }

    try {
        const pathSegments = getCollectionPath(context);
        // @ts-ignore
        await setDoc(doc(db, ...pathSegments, id), newChar);
    } catch (e) {
        console.warn("Create failed, offline mode", e);
        isOfflineMode = true;
        const localDb = getLocalDB(context);
        localDb[id] = newChar;
        setLocalDB(context, localDb);
    }
    return id;
  },

  update: async (id: string, data: Partial<Character>, context: DbContext = 'empire') => {
    const cleanData = JSON.parse(JSON.stringify(data));
    
    if (isOfflineMode) {
      const db = getLocalDB(context);
      if (db[id]) {
        db[id] = { ...db[id], ...cleanData };
        setLocalDB(context, db);
      }
      return;
    }

    try {
      const pathSegments = getCollectionPath(context);
      // @ts-ignore
      await setDoc(doc(db, ...pathSegments, id), cleanData, { merge: true });
    } catch (e) {
      console.warn("Update failed, offline mode", e);
      isOfflineMode = true;
      const db = getLocalDB(context);
      if (db[id]) {
         db[id] = { ...db[id], ...cleanData };
         setLocalDB(context, db);
      }
    }
  },

  delete: async (id: string, context: DbContext = 'empire') => {
    if (isOfflineMode) {
      const db = getLocalDB(context);
      delete db[id];
      setLocalDB(context, db);
      return;
    }

    try {
        const pathSegments = getCollectionPath(context);
        // @ts-ignore
        await deleteDoc(doc(db, ...pathSegments, id));
    } catch (e) {
        console.warn("Delete failed, offline mode", e);
        isOfflineMode = true;
        const db = getLocalDB(context);
        delete db[id];
        setLocalDB(context, db);
    }
  }
};