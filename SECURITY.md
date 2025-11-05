# 🔐 Guía de Seguridad - Finanzen

## ⚠️ IMPORTANTE: Acción Inmediata Requerida

Si acabas de clonar este proyecto o si las API keys estuvieron expuestas anteriormente:

### 1. Revoca las API Keys Comprometidas

**Google Gemini API:**
1. Ve a [Google AI Studio](https://ai.google.dev/)
2. Navega a "API keys"
3. Elimina o revoca cualquier key que haya estado expuesta
4. Genera una nueva API key

**Firebase:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "finanzen-d6712"
3. Ve a Project Settings > General
4. En "Your apps", elimina la aplicación web existente
5. Crea una nueva aplicación web para obtener nuevas credenciales
6. Actualiza las reglas de Firestore si es necesario

### 2. Configuración Segura de Variables de Entorno

**Local Development:**
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y agrega tus NUEVAS credenciales
# NUNCA compartas este archivo
```

**Firebase Hosting:**
```bash
# Las variables de entorno no se necesitan en el build
# Las credenciales de Firebase se embeben en el build de producción
# Asegúrate de que las reglas de Firestore estén bien configuradas
```

**Otras plataformas (Vercel, Netlify):**
- Configura las variables de entorno en el dashboard de tu plataforma
- No uses archivos .env en producción

### 3. Verifica el .gitignore

Asegúrate de que estos archivos NUNCA se suban a git:
```
.env
.env.local
.env.*.local
```

### 4. Limpia el Historial de Git (Si las keys fueron commiteadas)

```bash
# ADVERTENCIA: Esto reescribe el historial de git
# Coordina con tu equipo antes de ejecutar

# Opción 1: Usando BFG Repo Cleaner (recomendado)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Opción 2: Usando git filter-branch
git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' HEAD
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Fuerza el push (CUIDADO: coordina con tu equipo)
git push origin --force --all
```

## 🛡️ Mejores Prácticas de Seguridad

### Firestore Security Rules

Las reglas actuales en `firestore.rules` implementan:
- Autenticación requerida para todas las operaciones
- Usuarios solo pueden acceder a sus propios datos
- Validación de ownership en cada colección

**Verifica periódicamente:**
```bash
firebase deploy --only firestore:rules
```

### Firebase Authentication

- Actualmente solo Google OAuth está habilitado
- Considera agregar límites de tasa (rate limiting)
- Implementa captcha para prevenir bots

### API Keys

**Firebase Keys (públicas pero restringidas):**
- Restringe las API keys en Google Cloud Console
- Limita por dominio/IP en producción
- Habilita App Check para protección adicional

**Gemini API Key (privada):**
- NUNCA expongas en el frontend sin proxy
- Considera crear un backend/Cloud Function para llamadas a Gemini
- Implementa límites de tasa

### Manejo de Datos Sensibles

**NO almacenes en Firestore:**
- Números de tarjetas de crédito completos
- Números de seguro social
- Contraseñas en texto plano
- Información bancaria sensible

**SÍ puedes almacenar:**
- Nombres de métodos de pago (ej: "Tarjeta ****1234")
- Montos de transacciones
- Categorías y descripciones

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** abras un issue público
2. Envía un email a: [tu-email-de-seguridad]
3. Describe el problema en detalle
4. Permite tiempo razonable para respuesta antes de disclosure público

## ✅ Checklist de Seguridad

Antes de deployar a producción:

- [ ] Todas las API keys han sido rotadas
- [ ] `.env` está en `.gitignore`
- [ ] Firestore rules están desplegadas
- [ ] Firebase App Check está habilitado (opcional pero recomendado)
- [ ] Las API keys de Firebase tienen restricciones de dominio
- [ ] El código no contiene `console.log()` con datos sensibles
- [ ] HTTPS está habilitado en producción
- [ ] Se implementaron límites de tasa para operaciones costosas

## 📚 Recursos Adicionales

- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)

---

**Última actualización:** Noviembre 2024
