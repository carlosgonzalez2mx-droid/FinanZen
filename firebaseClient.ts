
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
// Las credenciales se cargan desde variables de entorno
// Para configurar tu proyecto:
// 1. Copia .env.example a .env
// 2. Obtén tus credenciales de Firebase Console > Project Settings
// 3. Completa los valores en el archivo .env

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validación de configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Configuración de Firebase incompleta. " +
      "Por favor, copia .env.example a .env y completa todas las variables de Firebase. " +
      "Consulta el README.md para más información."
    );
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth
export const auth = getAuth(app);

// Configura la persistencia de sesión para que solo dure mientras el navegador esté abierto
// browserSessionPersistence: La sesión se cierra al cerrar el navegador
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Persistencia de sesión configurada: solo durante la sesión del navegador');
  })
  .catch((error) => {
    console.error('Error al configurar persistencia:', error);
  });

export const db = getFirestore(app);