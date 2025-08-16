# 🤖 Code Sentinel

AI-powered tool to **review GitHub commits & PRs automatically**, generate feedback, and send notifications via email.
Built with **Node.js, Gemini API, and Git hooks**. 🚀

---

## ✨ Features

- 🔍 **AI Commit Review** – Every commit is analyzed using Gemini AI.
- 📬 **Email Notifications** – Review summary automatically sent to configured email receivers.
- 📂 **Customizable Prompts** – Modify [`gemini_prompt.txt`](gemini_prompt.txt:1) to control AI review style.
- ⚙️ **Flexible Config** – Supports both project-specific `.env.local` and global `.env.global`.
- 🔒 **Secure Environment Handling** – No secrets are hardcoded; everything comes from `.env` files.

## 📦 Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/ashu-dwd/github-pr-ai.git
   cd github-pr-ai
   ```

2. Install dependencies:

   ```bash
   bun install # or npm install
   ```

## ⚙️ Configuration

Create a `.env.local` file in your project root:

```
# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.5-flash

# Gmail (for sending reviews)
GMAIL_USER_EMAIL=your_email@gmail.com
GMAIL_USER_PASSWORD=your_app_password
GMAIL_RECIEVERS=receiver1@example.com,receiver2@example.com
```

👉 Alternatively, you can maintain a **global config** file (Windows example):

```
C:/Users/<username>/.env.global
```

The project automatically loads `.env.global` and overrides with `.env.local` if available.

---

## ▶️ Usage

### 1. Run AI Commit Review Manually

```bash
bun run review
```

### 2. Install Git Hook (auto-review on commit)

```bash
bun run setup-hook
```

Now, whenever you commit:

```bash
git commit -m "Added new feature"
```

The AI will:

1. Analyze your changes 🧠
2. Generate a review 📝
3. Store results in `/reviews` 📂
4. Send an email 📬

---

## 📂 Project Structure

```
github-pr-ai/
├── config.js         # Configuration handling (dotenv, validation)
├── gemini.service.js # AI (Gemini API) integration
├── email.service.js  # Gmail sending logic
├── review.js         # Main commit review script
├── gemini_prompt.txt # System prompt for Gemini
├── /reviews          # Stores review results
└── .env.local        # Local environment variables
```

---

## 🛠 Tech Stack

- **Node.js (ESM)**
- **Bun** (or npm/yarn)
- **Google Gemini API**
- **Nodemailer (Gmail SMTP)**
- **Git Hooks**

---

## 📧 Email Example

When a commit is pushed, the reviewer email looks like this:

```
Subject: AI Review for Commit <hash>

✅ Positive: Code structure is clean
⚠️ Suggestion: Add error handling for API failures
❌ Issue: Hardcoded values detected in [`config.js`](config.js:1)
```

---

## 🚀 Roadmap

- [ ] GitHub Actions integration (auto-review PRs)
- [ ] Support for multiple AI models
- [ ] Web dashboard for commit history
- [ ] Slack/Discord notifications

---

## 🤝 Contributing

Pull requests are welcome! 🎉
For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

MIT License © 2025 [Ashu Dwivedi](https://github.com/ashu-dwd)
