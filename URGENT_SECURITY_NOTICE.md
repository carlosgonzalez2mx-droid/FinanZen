# ⚠️ AVISO DE SEGURIDAD URGENTE

## 🚨 ACCIÓN REQUERIDA INMEDIATAMENTE

Tus API keys y credenciales de Firebase **estaban expuestas** en el código fuente. Aunque ahora están en variables de entorno, **DEBES** rotar todas las credenciales comprometidas.

### ✅ Checklist de Seguridad Inmediata

#### 1. Google Gemini API Key [URGENTE]

La key `AIzaSyAIVfbnN3oTJZFNzG1KeAidYO1dHip3GxY` estaba expuesta.

**Acciones:**
1. Ve a [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)
2. Elimina la key comprometida
3. Crea una nueva API key
4. Actualiza tu archivo `.env` con la nueva key:
   ```env
   VITE_API_KEY=tu_nueva_key_aqui
   ```

#### 2. Firebase Credentials [URGENTE]

Las siguientes credenciales estaban expuestas:
```
Project ID: finanzen-d6712
API Key: AIzaSyA4KpkcMGwiE8P3HsvTLOKkbhSA8p-IbrY
```

**Acciones:**
1. Ve a [Firebase Console](https://console.firebase.google.com/project/finanzen-d6712/settings/general/)
2. En "Your apps" → Web apps
3. **Elimina** la aplicación web actual
4. **Crea** una nueva aplicación web
5. Copia las nuevas credenciales a tu `.env`:
   ```env
   VITE_FIREBASE_API_KEY=nueva_api_key
   VITE_FIREBASE_AUTH_DOMAIN=finanzen-d6712.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=finanzen-d6712
   VITE_FIREBASE_STORAGE_BUCKET=finanzen-d6712.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=nuevo_sender_id
   VITE_FIREBASE_APP_ID=nuevo_app_id
   ```

#### 3. Firestore Security Rules [CRÍTICO]

Asegúrate de que las reglas estén desplegadas:

```bash
firebase deploy --only firestore:rules
```

Verifica en [Firestore Rules](https://console.firebase.google.com/project/finanzen-d6712/firestore/rules) que estén activas.

#### 4. Restringe las API Keys

**Firebase API Key:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=finanzen-d6712)
2. Encuentra la API key de Firebase
3. Click en "Edit"
4. En "Application restrictions":
   - Selecciona "HTTP referrers (websites)"
   - Agrega tu dominio de producción (ej: `https://tuapp.web.app/*`)
   - Agrega localhost para desarrollo: `http://localhost:*`
5. En "API restrictions":
   - Selecciona "Restrict key"
   - Habilita solo:
     - Identity Toolkit API
     - Cloud Firestore API
     - Firebase Authentication

#### 5. Habilita Firebase App Check [RECOMENDADO]

Protección adicional contra uso no autorizado:

1. Ve a [Firebase App Check](https://console.firebase.google.com/project/finanzen-d6712/appcheck)
2. Habilita App Check para tu app web
3. Usa reCAPTCHA v3 como proveedor
4. Activa enforcement mode después de probar

#### 6. Limpia el Historial de Git [SI ES REPOSITORIO PÚBLICO]

Si este código está en GitHub/GitLab público:

```bash
# ADVERTENCIA: Esto reescribe la historia de git
# Haz backup primero
git clone --mirror [tu-repo-url] backup-repo

# Usa BFG Repo-Cleaner (más fácil y rápido)
# Descarga de: https://reps.io/BFG-repo-cleaner
java -jar bfg.jar --delete-files .env
java -jar bfg.jar --delete-files firebaseClient.ts

# O usa git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env firebaseClient.ts' \
  --prune-empty --tag-name-filter cat -- --all

# Limpia referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordina con tu equipo primero)
git push origin --force --all
git push origin --force --tags
```

#### 7. Monitoreo Post-Rotación

Durante los próximos días:

1. **Firebase Console**: Revisa logs de autenticación por actividad sospechosa
2. **Google Cloud Billing**: Verifica uso inesperado de Gemini API
3. **Firestore**: Revisa si hay datos nuevos no autorizados

## 📋 Orden de Prioridad

```
1. [CRÍTICO] Rotar Gemini API Key
2. [CRÍTICO] Rotar credenciales Firebase
3. [IMPORTANTE] Verificar Firestore Rules
4. [IMPORTANTE] Restringir API Keys
5. [RECOMENDADO] Habilitar App Check
6. [CONDICIONAL] Limpiar historial Git (si es repo público)
7. [SEGUIMIENTO] Monitorear uso por 7 días
```

## 🆘 Si Detectas Uso No Autorizado

1. **Inmediatamente**: Revoca todas las keys
2. **Verifica**: Logs de Firestore para accesos no autorizados
3. **Contacta**: Soporte de Firebase si es necesario
4. **Considera**: Cambiar el nombre del proyecto si el compromiso es severo

## ✅ Verificación Final

Después de completar todos los pasos:

- [ ] Nueva Gemini API key generada y actualizada en `.env`
- [ ] Nuevas credenciales Firebase generadas y actualizadas en `.env`
- [ ] Firestore rules desplegadas y verificadas
- [ ] API keys restringidas por dominio/IP
- [ ] App Check habilitado (opcional)
- [ ] Historial de git limpio (si aplica)
- [ ] Archivo `.env` en `.gitignore` y NO en git
- [ ] Build funciona: `npm run build`
- [ ] Aplicación funciona con nuevas credenciales: `npm run dev`

## 📞 Recursos de Ayuda

- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)
- [Google Cloud Security](https://cloud.google.com/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 📝 Documentación Adicional

Después de asegurar todo, lee:
- `SECURITY.md` - Mejores prácticas de seguridad continua
- `README.md` - Configuración correcta del proyecto
- `DEVELOPMENT.md` - Guía de desarrollo seguro

---

**NO IGNORES ESTE AVISO**. Las consecuencias de API keys comprometidas pueden incluir:
- Cargos inesperados en tu cuenta de Google Cloud
- Acceso no autorizado a datos de usuarios
- Mal uso de tu cuota de API
- Posible cierre de tu proyecto por violación de términos

**Tiempo estimado para completar**: 15-20 minutos
**Prioridad**: 🔴 CRÍTICA - Hazlo AHORA
