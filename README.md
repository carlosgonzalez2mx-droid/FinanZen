# 💰 Finanzen - Asistente Financiero Inteligente

Una aplicación web moderna de gestión financiera personal con análisis inteligente mediante IA para tracking de gastos, presupuestos y planificación financiera.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.12-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características Principales

- 📊 **Dashboard Interactivo**: Visualiza tus gastos y presupuesto en tiempo real
- 🤖 **Análisis con IA**: Escanea recibos automáticamente usando Google Gemini AI
- 📑 **Importación de PDF**: Carga presupuestos desde documentos PDF
- 🏷️ **Categorización Flexible**: Organiza gastos en categorías y subcategorías personalizables
- 💳 **Múltiples Métodos de Pago**: Administra diferentes tarjetas y cuentas
- 📋 **Plantillas de Presupuesto**: Guarda y reutiliza configuraciones de presupuesto
- 📈 **Reportes de Ciclo**: Genera informes detallados de tus períodos financieros
- 🔐 **Autenticación Segura**: Login con Google a través de Firebase Auth
- 📱 **Diseño Responsive**: Funciona perfectamente en móviles, tablets y escritorio

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v16 o superior)
- Cuenta de Firebase
- Google Gemini API Key (para funciones IA)

### Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/finanzen.git
cd finanzen
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` y completa con tus credenciales:

```env
# Google Gemini API Key
# Obtén tu API key en: https://ai.google.dev/
VITE_API_KEY=tu_gemini_api_key_aqui

# Firebase Configuration
# Obtén estos valores en: Firebase Console > Project Settings > General
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. **Configura Firebase**

   a. Ve a [Firebase Console](https://console.firebase.google.com/)

   b. Crea un nuevo proyecto o selecciona uno existente

   c. Habilita **Authentication** y activa el proveedor de Google

   d. Crea una base de datos **Firestore** en modo producción

   e. Despliega las reglas de seguridad:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Ejecuta la aplicación en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Arquitectura del Proyecto

```
finanzen/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── AddExpenseModal.tsx
│   ├── BudgetPage.tsx
│   ├── ConfirmDialog.tsx
│   └── ...
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useBudget.ts
│   └── usePaymentMethods.ts
├── contexts/           # React Context Providers
│   └── ErrorContext.tsx
├── services/           # Servicios externos
│   └── geminiService.ts
├── constants.ts        # Constantes globales
├── types.ts           # Definiciones de TypeScript
├── firebaseClient.ts  # Configuración de Firebase
├── firestore.rules    # Reglas de seguridad de Firestore
└── App.tsx           # Componente principal
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase (Auth + Firestore)
- **IA**: Google Gemini API
- **Estilizado**: CSS personalizado con Tailwind-like utilities

## 📊 Estructura de Datos en Firestore

### Colecciones

- **profiles**: Perfiles de usuario con información de suscripción
- **transactions**: Transacciones/gastos individuales
- **payment_methods**: Métodos de pago del usuario
- **user_categories**: Categorías y subcategorías personalizadas
- **budget_plans**: Planes de presupuesto por usuario
- **budget_templates**: Plantillas guardadas de presupuesto

## 🔐 Seguridad

- Las reglas de Firestore aseguran que los usuarios solo puedan acceder a sus propios datos
- Las API keys deben mantenerse en variables de entorno
- Autenticación mediante Firebase Auth con Google OAuth

## 🚢 Despliegue

### Firebase Hosting

```bash
# Build de producción
npm run build

# Despliega a Firebase Hosting
firebase deploy
```

### Otras Plataformas

La aplicación puede desplegarse en cualquier hosting estático:
- Vercel
- Netlify
- GitHub Pages

Asegúrate de configurar las variables de entorno en tu plataforma de hosting.

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build de producción
```

## 🛣️ Roadmap

- [ ] Tests unitarios y de integración
- [ ] Gráficos y visualizaciones de datos
- [ ] Exportación de reportes en PDF/Excel
- [ ] Soporte para múltiples monedas
- [ ] Modo offline (PWA)
- [ ] Sistema de suscripción con Stripe
- [ ] Internacionalización (i18n)
- [ ] Notificaciones push

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

Carlos González López

## 🙏 Agradecimientos

- Google Gemini AI por las capacidades de análisis inteligente
- Firebase por la infraestructura backend
- La comunidad de React y TypeScript

---

**⚠️ Nota de Seguridad**: Nunca compartas tus API keys o credenciales de Firebase. Mantén el archivo `.env` fuera del control de versiones.
