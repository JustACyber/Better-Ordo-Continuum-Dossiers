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

// Replace with your actual Firebase config or use environment variables
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

const APP_ID = 'ordo-continuum-legacy-v1';

export const OrdoService = {
  auth,
  db,
  
  init: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth)
            .then((uc) => resolve(uc.user))
            .catch(reject);
        }
      });
    });
  },

  subscribeAll: (callback: (data: Record<string, Character>) => void) => {
    const collRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'protocols');
    return onSnapshot(collRef, (snapshot) => {
      const data: Record<string, Character> = {};
      snapshot.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data() as Character;
      });
      callback(data);
    });
  },

  subscribeOne: (id: string, callback: (data: Character | null) => void) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'protocols', id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as Character);
      } else {
        callback(null);
      }
    });
  },

  create: async (name: string): Promise<string> => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    const id = name.toLowerCase().replace(/\s+/g, '_') + "_" + Math.floor(Math.random() * 10000);
    
    const newChar: Character = {
        id: id,
        meta: {
            name: name, rank: "Рекрут", image: "",
            class: "", archetype: "", race: "", background: "", level: 1,
            origin: "", age: "", job: "", clearance: "", comm: ""
        },
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, hp_curr: 0, hp_max: 0, hp_temp: 0, ac: 10, speed_mod: 0, shield_curr: 0, shield_max: 0 },
        saves: { prof_str: false, prof_dex: false, prof_con: false, prof_int: false, prof_wis: false, prof_cha: false },
        skills: { 
            athletics: 0, acrobatics: 0, sleight: 0, stealth: 0,
            history: 0, void: 0, nature: 0, investigation: 0, programming: 0, tech: 0, fund_science: 0, weapons: 0, religion: 0,
            perception: 0, survival: 0, medicine: 0, insight: 0, animal: 0,
            performance: 0, intimidation: 0, deception: 0, persuasion: 0,
            bonuses: {} 
        },
        combat: { weapons: [], inventory: [] },
        abilities: [], traits: [], features: [],
        profs: { langs: [], tools: [], armory: [] },
        money: { u: 0, k: 0, m: 0, g: 0 },
        psych: { size: "Средний", age: "", height: "", weight: "", trait: "", ideal: "", bond: "", flaw: "", analysis: "" },
        psionics: { base_attr: "int", caster_type: "1", class_lvl: 1, type: "learned", mod_points: 0, points_curr: 0, spells: [] },
        universalis: { save_base: 8, save_attr: "int", custom_table: [], counters: [] },
        locks: { identity: false, biometrics: false, skills: false, equipment: false, psych: false, psionics: false, universalis: false }
    };

    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'protocols', id), newChar);
    return id;
  },

  update: async (id: string, data: Partial<Character>) => {
    if (!auth.currentUser) return;
    // Basic cleanup to remove undefined
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'protocols', id), cleanData, { merge: true });
  },

  delete: async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'protocols', id));
  }
};
