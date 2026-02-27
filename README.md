# Prompt Manager & Testing Tool 🚀

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)

*[Leer en Español abajo](#spanish-version)*

A visual and modular platform (builder-style) designed to **boost the creativity of your internal team** while delivering **top-tier AI Prompt solutions to your customers**.

This project solves the "prompt chaos" problem by providing a highly creative sandbox. Move beyond static documents into a dynamic environment where your team can design, store, and test prompts with real variables, then deliver professional results to clients.

---

## ✨ Key Features (EN)

### 🎨 Internal Creativity & Efficiency
- **Persistent Variable Catalog:** Store and manage a library of global variables. Re-use them across different prompts ensuring consistency and saving time during the engineering process.
- **Fearless Iteration & Versioning:** Every execution is automatically saved. If a new experiment fails, your team can instantly ROLLBACK or RECYCLE a successful past setup from the history.
- **Visual Builder (Drag & Drop):** Construct prompts using modular, reusable fragments. Arrange system instructions and business logic like Lego blocks to pivot creative directions in seconds.
- **Real-time Variable Injection:** Type variables like `{{ client.name }}` and the UI instantly generates input fields. Test edge cases by swapping data on the fly.

### 🤝 Professional Customer Delivery
- **Download as Word (.docx):** Found a winning response? Export individual runs or side-by-side multi-variation comparisons directly to a **professionally styled Word document**. Perfect for high-stakes B2B presentations and audits.
- **Instant Shareable Links:** Send live results to customers or stakeholders using **Stateless Sharing**. The compressed data travels directly in the URL hash, allowing anyone with the link to view the panoramic result without needing an account.

---

## 🚀 Local Installation & Deployment (EN)

### 1. Clone the repository
```bash
git clone https://github.com/your-user/prompt-manager.git
cd prompt-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Rename `.env.example` to `.env` and set:
```env
# Database Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=mydb
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# OpenAI API Key
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 4. Running with Docker (Recommended) 🐳
The project is configured to synchronize your `.env` variables with Docker Compose.
```bash
docker-compose up -d --build
```
This will start both the PostgreSQL database and the Next.js application.

### 5. Manual Setup (Alternative)
First, initialize the database:
```bash
npx prisma generate
npx prisma db push
```
Then run the development server:
```bash
npm run dev
```


---
---

<a name="spanish-version"></a>

# 🇪🇸 Versión en Español

Una plataforma modular y visual (tipo "builder") diseñada para **potenciar la creatividad de tu equipo interno** y entregar **soluciones de Prompts de IA de alta fidelidad a tus clientes**.

### 🚀 Funcionalidades Clave

#### 🎨 Creatividad y Almacenamiento Interno
- **Catálogo Permanente de Variables:** Almacena y gestiona una librería global de variables reutilizables. No más copiar y pegar los mismos datos; mantén todo organizado y centralizado para tu equipo.
- **Iteración y Versionamiento:** Cada ejecución se guarda automáticamente. Recicla prompts pasados o vuelve a una versión anterior con un solo clic si el experimento actual no convence.
- **Constructor Visual (Drag & Drop):** Crea prompts complejos uniendo bloques modulares. Une reglas de sistema y contextos de negocio como piezas de un rompecabezas.

#### 🤝 Entrega Profesional a Clientes
- **Bájalo en Word (.docx):** Exporta las vistas panorámicas (individuales o comparativas) a documentos de Word con **estilos visuales premium**. Olvida las impresiones de navegador descuadradas; entrega reportes que impresionen a tus clientes.
- **Comparte vía Link Directo:** Genera enlaces instantáneos para mostrar resultados a tus clientes o stakeholders. La información viaja comprimida en el link, permitiendo la visualización sin que el cliente necesite crear una cuenta.

---

## 🏗️ Tecnología
- **Next.js 14** (App Router) & **TypeScript**.
- **Prisma** + **PostgreSQL** para persistencia de prompts y variables.
- **Tailwind CSS** + **Radix UI** para una interfaz moderna y Dark Mode nativo.
- **docx.js** para la generación profesional de documentos Word.
- **lz-string** para la compresión de datos compartidos en URL.

---

## 🚀 Instalación y Ejecución (ES)

### 1. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env` y configura tus credenciales:
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=mydb
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
OPENAI_API_KEY="tu-api-key-de-openai"
```

### 2. Ejecutar con Docker (Recomendado) 🐳
```bash
docker-compose up -d --build
```
Esto levantará automáticamente la base de datos y la aplicación sincronizando los valores de tu `.env`.

### 3. Ejecución Manual (Alternativa)
```bash
npm install
npx prisma db push
npm run dev
```


---
*Desarrollado con ❤️ para elevar el standard del Prompt Engineering.*
