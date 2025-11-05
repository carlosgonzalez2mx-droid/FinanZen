# 🔑 Cómo Obtener tu API Key de Google Gemini

## Opción 1: Google AI Studio (Recomendado - Más Fácil)

1. **Ve a Google AI Studio**
   - Abre: https://aistudio.google.com/app/apikey
   - O ve a: https://makersuite.google.com/app/apikey

2. **Inicia sesión**
   - Usa tu cuenta de Google

3. **Crea una nueva API Key**
   - Click en "Get API Key" o "Create API Key"
   - Selecciona un proyecto existente o crea uno nuevo
   - Click en "Create API key in new project" (recomendado)

4. **Copia la API Key**
   - Verás algo como: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX`
   - ⚠️ **IMPORTANTE**: Cópiala inmediatamente, no podrás verla después

5. **Pega la API Key en tu archivo `.env`**
   ```env
   VITE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Opción 2: Google Cloud Console (Más Control)

1. **Ve a Google Cloud Console**
   - https://console.cloud.google.com/

2. **Crea o selecciona un proyecto**
   - Click en el selector de proyecto (arriba)
   - "New Project" → Dale un nombre → "Create"

3. **Habilita la API de Generative Language**
   - Ve a: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Click en "Enable"

4. **Crea credenciales**
   - Ve a: APIs & Services > Credentials
   - Click en "Create Credentials" → "API Key"
   - Copia la API key generada

5. **Restringe la API Key (Opcional pero recomendado)**
   - Click en la key recién creada
   - En "API restrictions":
     - Selecciona "Restrict key"
     - Marca solo: "Generative Language API"
   - En "Application restrictions":
     - Selecciona "HTTP referrers"
     - Agrega: `http://localhost:*` y tu dominio de producción
   - Click "Save"

## Verificar que funcione

Una vez que hayas configurado tu nueva API key:

1. **Actualiza tu archivo `.env`**
   ```env
   VITE_API_KEY=tu_nueva_api_key_aqui
   ```

2. **Reinicia el servidor de desarrollo**
   ```bash
   # Detén el servidor (Ctrl+C)
   # Inicia de nuevo
   npm run dev
   ```

3. **Verifica en la consola del navegador**
   - No deberían aparecer errores de Gemini
   - Si intentas usar la función de escanear recibos, debería funcionar

## Solución de Problemas

### Error: "API key not valid"
- Verifica que hayas copiado la key completa
- Asegúrate de no tener espacios al inicio o final
- La variable debe llamarse exactamente `VITE_API_KEY`

### Error: "Generative Language API has not been used"
- Ve a: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Click en "Enable"
- Espera 1-2 minutos y prueba de nuevo

### Error: "models/gemini-pro-vision is not found"
- Tu API key es válida pero el modelo no está disponible
- Esto es normal, algunos modelos están en preview
- El código ya maneja esto con fallbacks

### La app funciona pero sin IA
- Revisa que el archivo `.env` esté en la raíz del proyecto
- Verifica que la variable se llame `VITE_API_KEY` (con VITE_ al inicio)
- Reinicia el servidor después de modificar .env

## Límites de Uso (Free Tier)

Con la cuenta gratuita de Gemini tienes:
- ✅ 60 requests por minuto
- ✅ 1,500 requests por día
- ✅ Suficiente para desarrollo y uso personal

## Seguridad

⚠️ **NUNCA** compartas tu API key públicamente
⚠️ **NUNCA** la subas a GitHub o repositorios públicos
✅ Siempre usa variables de entorno (archivo `.env`)
✅ Agrega `.env` a tu `.gitignore` (ya está configurado)

## Más Información

- Documentación oficial: https://ai.google.dev/docs
- Límites y cuotas: https://ai.google.dev/pricing
- Soporte: https://ai.google.dev/support
