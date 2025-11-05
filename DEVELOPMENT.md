# 🛠️ Guía de Desarrollo - Finanzen

## Arquitectura y Patrones

### Custom Hooks

El proyecto utiliza custom hooks para separar la lógica de negocio de los componentes:

#### `useAuth.ts`
Maneja la autenticación de usuarios con Firebase Auth.
```typescript
const { user, loading } = useAuth();
```

#### `useProfile.ts`
Gestiona el perfil del usuario y suscripción.
```typescript
const { profile, isProActive, updateSubscription } = useProfile(user);
```

#### `useTransactions.ts`
CRUD de transacciones con manejo de errores.
```typescript
const {
  transactions,
  totalExpenses,
  addTransaction,
  clearAllTransactions
} = useTransactions(user);
```

#### `useBudget.ts`
Manejo completo de presupuestos, categorías y plantillas.
```typescript
const {
  budgetPlan,
  budgetCategories,
  budgetTemplates,
  setBudgetPlan,
  uploadBudgetPDF,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  saveTemplate,
  loadTemplate,
  deleteTemplate
} = useBudget(user);
```

#### `usePaymentMethods.ts`
Gestión de métodos de pago.
```typescript
const {
  paymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} = usePaymentMethods(user);
```

### Context API

#### `ErrorContext`
Proporciona un sistema de notificaciones global.
```typescript
const { showNotification } = useNotification();

showNotification('Operación exitosa', 'success');
showNotification('Error al guardar', 'error');
showNotification('Revisa los datos', 'warning');
showNotification('Información importante', 'info');
```

### Componentes Reutilizables

#### `ConfirmDialog`
Diálogo de confirmación personalizado que reemplaza `window.confirm()`.
```typescript
<ConfirmDialog
  isOpen={true}
  title="Eliminar Item"
  message="¿Estás seguro?"
  type="danger" // 'danger' | 'warning' | 'info'
  onConfirm={() => handleDelete()}
  onCancel={() => setOpen(false)}
/>
```

#### `NotificationContainer`
Sistema de notificaciones toast automático.
```typescript
// Se renderiza automáticamente en App.tsx
<NotificationContainer />
```

## Flujo de Datos

```
Usuario → Componente → Custom Hook → Firebase → Hook actualiza estado → Componente re-renderiza
                ↓
         useNotification() muestra feedback
```

## Manejo de Errores

Todos los hooks implementan try-catch y notificaciones automáticas:

```typescript
try {
  await addTransaction(data);
  showNotification('Transacción añadida', 'success');
} catch (error) {
  console.error('Error:', error);
  showNotification('Error al añadir transacción', 'error');
  throw error; // Re-throw para manejo adicional si es necesario
}
```

## Convenciones de Código

### Nombres de Archivos
- Componentes: PascalCase (`AddExpenseModal.tsx`)
- Hooks: camelCase con prefijo `use` (`useAuth.ts`)
- Tipos: PascalCase (`types.ts` con exports PascalCase)
- Constantes: UPPER_SNAKE_CASE en `constants.ts`

### Estructura de Componentes
```typescript
// 1. Imports
import React, { useState } from 'react';
import type { MyType } from '../types';

// 2. Types/Interfaces
interface MyComponentProps {
  // ...
}

// 3. Component
const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  // 3a. Hooks
  const [state, setState] = useState();

  // 3b. Handlers
  const handleClick = () => {
    // ...
  };

  // 3c. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 4. Export
export default MyComponent;
```

### TypeScript

**Siempre usa tipos explícitos:**
```typescript
// ✅ Bueno
const amount: number = 100;
const handleSubmit = (data: FormData): Promise<void> => {
  // ...
};

// ❌ Evitar
const amount = 100;
const handleSubmit = (data: any) => {
  // ...
};
```

**Usa types del archivo types.ts:**
```typescript
import type { Transaction, MainCategory } from '../types';
```

## Testing (Pendiente de implementar)

### Estructura recomendada:
```
src/
├── components/
│   ├── Dashboard.tsx
│   └── __tests__/
│       └── Dashboard.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
```

### Framework recomendado:
- **Vitest** para tests unitarios
- **React Testing Library** para componentes
- **Firebase Emulator** para tests de integración

## Performance

### Optimizaciones Implementadas:
- `useCallback` para funciones que se pasan como props
- `useMemo` para cálculos costosos
- Carga lazy de imágenes en preview

### Optimizaciones Pendientes:
- Code splitting con `React.lazy()`
- Virtualizaciónen listas largas
- Debouncing en búsquedas
- Service Worker para offline

## Debugging

### Firebase
```typescript
// Habilitar logs de Firebase (solo desarrollo)
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Firebase persistence error:', err);
  });
```

### Vite
```bash
# Ver el bundle analyzer
npm run build
npx vite-bundle-visualizer
```

### React DevTools
- Instala la extensión React Developer Tools
- Usa el Profiler para encontrar renders innecesarios

## Git Workflow

### Branches
- `main` - Producción
- `develop` - Desarrollo
- `feature/*` - Nuevas features
- `fix/*` - Bug fixes
- `refactor/*` - Refactorizaciones

### Commits
Usa conventional commits:
```bash
feat: Agregar exportación de reportes
fix: Corregir cálculo de totales
refactor: Extraer lógica a custom hook
docs: Actualizar README
style: Formatear código
test: Agregar tests para Dashboard
chore: Actualizar dependencias
```

### Pre-commit checklist:
- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay console.logs en código de producción
- [ ] Los tipos de TypeScript están correctos
- [ ] Se agregaron comentarios donde sea necesario
- [ ] Se actualizó la documentación si aplica

## Estructura de Firestore

### Indices Requeridos

Crea estos índices compuestos en Firestore Console:

1. **transactions**
   - `user_id` (Ascending) + `date` (Descending)
   - `user_id` (Ascending) + `category` (Ascending) + `date` (Descending)

2. **user_categories**
   - `user_id` (Ascending) + `main_category` (Ascending)

### Ejemplos de Queries

```typescript
// Transacciones por usuario ordenadas por fecha
const q = query(
  collection(db, 'transactions'),
  where('user_id', '==', user.uid),
  orderBy('date', 'desc'),
  limit(50)
);

// Transacciones de una categoría específica
const q = query(
  collection(db, 'transactions'),
  where('user_id', '==', user.uid),
  where('category', '==', 'ALIMENTACIÓN'),
  orderBy('date', 'desc')
);
```

## Variables de Entorno

### Desarrollo
```env
# .env.local (para sobrescribir .env en local)
VITE_API_KEY=tu_key_de_desarrollo
```

### Producción
Las variables se configuran en el hosting:
- Firebase Hosting: No requiere variables de entorno
- Vercel/Netlify: Configura en dashboard

## Deployment

### Build local
```bash
npm run build
npm run preview  # Preview del build antes de deploy
```

### Firebase Hosting
```bash
firebase deploy --only hosting
```

### Rollback
```bash
# Ver versiones anteriores
firebase hosting:channel:list

# Rollback a versión anterior
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

## Troubleshooting

### Error: "Firebase configuration incomplete"
- Verifica que todas las variables `VITE_FIREBASE_*` estén en `.env`
- Reinicia el servidor de desarrollo

### Error: "API key not set"
- Verifica `VITE_API_KEY` en `.env`
- Asegúrate de que el archivo se llame exactamente `.env`

### Error de permisos en Firestore
- Verifica que las rules estén desplegadas: `firebase deploy --only firestore:rules`
- Verifica que el usuario esté autenticado

### Build muy grande (>500KB)
- Considera code splitting
- Verifica que no estés importando librerías completas innecesariamente
- Usa `import { specific } from 'library'` en lugar de `import * as`

## Recursos

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Mantén esta guía actualizada conforme el proyecto evoluciona**
