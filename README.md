# Venda Fácil 🧾📦

Sistema simples de controle de produtos, categorias, clientes e vendas, pensado para pequenos negócios que hoje fazem tudo no papel.

O objetivo do projeto é facilitar o dia a dia, trazendo organização, controle de custos e visão de lucro de forma prática.

---

## 🚀 Funcionalidades

- 🔐 Autenticação com Firebase (login, cadastro e recuperação de senha)
- 📦 Cadastro de produtos
- 🏷️ Categorias personalizadas por usuário
- 👤 Cada usuário vê apenas seus próprios dados
- 💰 Cadastro de vendas
- 📊 Controle básico de valores e custos
- 🔒 Regras de segurança no Firestore

---

## 🧠 Regras de Negócio

- Categorias são **exclusivas por usuário**
- Um novo usuário começa com **zero categorias**
- Produtos, categorias e vendas ficam vinculados ao usuário logado
- Recuperação de senha disponível via e-mail

---

## 🛠️ Tecnologias Utilizadas

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Firebase**
  - Authentication
  - Firestore
- **Tailwind CSS**

---

## 🔐 Autenticação

O sistema utiliza o **Firebase Authentication**, com suporte a:

- Login com e-mail e senha
- Criação de conta
- Recuperação de senha (Forgot Password)

---

## 📂 Estrutura Básica

src/
├── contexts/
│ └── AuthContext.tsx
├── services/
│ ├── categoryService.ts
│ └── productService.ts
├── types/
├── lib/
│ └── firebase.ts
├── app/

---

## ⚙️ Configuração do Projeto

1. Clone o repositório

````bash
git clone https://github.com/seu-usuario/venda-facil.git

2. Instale as dependências
```bash
npm install

3.	Crie um projeto no Firebase e configure:

	•	Authentication (Email/Password)
	•	Firestore Database

4.	Crie o arquivo .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

5.	Rode o projeto
```bash
npm run dev
````
