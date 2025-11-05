Excelente observación 👏
Tienes razón: en el README que te di, la parte de **“Instalar dependencias”** y **“Configurar el entorno”** quedó visualmente un poco fuera de la estructura del paso anterior.
Aquí te dejo la **versión corregida y perfectamente ordenada** del README.md para tu proyecto **Renfi**, con esos pasos bien integrados y la estructura final lista para copiar directamente 👇

---

````markdown
# 🏡 Renfi

**Renfi** es una plataforma completa para la **gestión de reservas de fincas**, desarrollada con el objetivo de ofrecer una experiencia sencilla, rápida y segura tanto para administradores como para usuarios.  
Este repositorio contiene el **backend/API REST** del sistema.

---

## 🚀 Características principales

- 🔐 Autenticación y autorización con **JSON Web Tokens (JWT)**  
- 🧾 CRUD completo para las entidades principales:
  - Usuarios  
  - Roles  
  - Fincas  
  - Reservas  
  - Métodos de Pago  
  - Municipios
- 🧠 Validación de datos y manejo centralizado de errores
- 🧩 Arquitectura modular, escalable y limpia
- 💾 Conexión con base de datos **SQL Server**
- 🧰 Compatible con integraciones frontend y móviles

---

## 🧰 Tecnologías utilizadas

| Tecnología | Descripción |
|-------------|-------------|
| **Node.js** | Entorno de ejecución de JavaScript |
| **Express.js** | Framework para crear APIs REST |
| **SQL Server** | Base de datos relacional |
| **JWT** | Autenticación basada en tokens |
| **dotenv** | Gestión de variables de entorno |
| **mssql / Sequelize** | ORM o driver de conexión con SQL Server |
| **Nodemon** | Recarga automática en desarrollo |

---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Ache-dev/Renfi.git
cd Renfi
````

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar el entorno

Crea un archivo `.env` en la raíz del proyecto y agrega tus variables de entorno:

```env
PORT=3000
DB_SERVER=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=RenfiDB
JWT_SECRET=tu_secreto_jwt
```

### 4️⃣ Ejecutar el servidor

* **Modo desarrollo:**

  ```bash
  npm run dev
  ```
* **Modo producción:**

  ```bash
  npm start
  ```

---

## 📚 Endpoints principales

| Método   | Ruta                 | Descripción                        |
| -------- | -------------------- | ---------------------------------- |
| `POST`   | `/api/auth/login`    | Iniciar sesión y obtener token JWT |
| `POST`   | `/api/auth/register` | Registrar nuevo usuario            |
| `GET`    | `/api/fincas`        | Listar todas las fincas            |
| `GET`    | `/api/fincas/:id`    | Obtener finca por ID               |
| `POST`   | `/api/fincas`        | Crear una nueva finca              |
| `PUT`    | `/api/fincas/:id`    | Actualizar una finca               |
| `DELETE` | `/api/fincas/:id`    | Eliminar una finca                 |
| `GET`    | `/api/reservas`      | Listar todas las reservas          |
| `POST`   | `/api/reservas`      | Crear nueva reserva                |
| `GET`    | `/api/usuarios`      | Listar todos los usuarios          |

---

### 🧩 Ejemplo de respuesta (GET `/api/fincas`)

```json
[
  {
    "IdFinca": 1,
    "Nombre": "Finca El Paraíso",
    "Direccion": "Cra 50 #30-20",
    "Descripcion": "Piscina y zona BBQ",
    "Capacidad": 10,
    "PrecioNoche": 500000,
    "Estado": "Disponible"
  }
]
```

---

## 🧱 Estructura del proyecto

```bash
Renfi/
├── src/
│   ├── controllers/       # Lógica de negocio y controladores de endpoints
│   ├── routes/            # Definición de rutas y middlewares
│   ├── models/            # Modelos de base de datos / entidades
│   ├── middlewares/       # Autenticación, validación, manejo de errores
│   ├── config/            # Configuración de base de datos y variables
│   └── app.js             # Archivo principal de configuración
├── .env.example           # Ejemplo de archivo de entorno
├── package.json
├── README.md
└── server.js
```

---

## 🧪 Scripts disponibles

| Comando       | Descripción                               |
| ------------- | ----------------------------------------- |
| `npm run dev` | Inicia el servidor en modo desarrollo     |
| `npm start`   | Inicia el servidor en modo producción     |
| `npm test`    | Ejecuta los tests (si están configurados) |

---

## 🛡️ Buenas prácticas

* ✅ Usar HTTPS en entornos productivos
* ✅ Validar y sanitizar todos los datos de entrada
* ✅ Encriptar contraseñas con bcrypt
* ✅ Implementar control de acceso por roles
* ✅ Evitar exponer datos sensibles en las respuestas
* ✅ Aplicar límites de peticiones (rate-limiting)

---

## 📦 Despliegue

Puedes desplegar la API en plataformas como:

* ☁️ **Render**
* 🚀 **Railway**
* 🧩 **Vercel (solo backend Express)**
* 🐳 **Docker**
* 🧱 **Azure / AWS EC2**

### Ejemplo de despliegue con Docker

```bash
docker build -t renfi-api .
docker run -p 3000:3000 renfi-api
```

---

## 👥 Autor

**Harbey Alexander Camaron Diaz**
📍 *Tecnológico de Antioquia*
🎓 Estudiante de Técnica Profesional en Sistemas
💻 Apasionado por la tecnología, la programación y la innovación.
❤️ Futuro programador enfocado en desarrollo backend y soluciones inteligentes.

---

## 🪪 Licencia

Este proyecto está licenciado bajo la **MIT License**.
Puedes usarlo, modificarlo y distribuirlo libremente, siempre que se mantenga el reconocimiento al autor original.

---

## ⭐ Contribuciones

¡Las contribuciones son bienvenidas!
Si deseas colaborar:

1. Haz un **fork** del repositorio
2. Crea una **rama** con tu nueva funcionalidad

   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus **cambios y commits**
4. Envía un **Pull Request** con una descripción clara

---

### 📷 Vista previa (si aplica)

> Si Renfi tiene un frontend asociado, puedes añadir aquí capturas de pantalla o GIFs mostrando la interfaz del sistema.

---

```

---

¿Quieres que te agregue al principio del README unos **badges (insignias)** de GitHub?  
Por ejemplo: versión de Node, estado del proyecto, licencia, y “Made with ❤️ by Harbey Alexander”.  
Le daría un toque más profesional visualmente.
```
