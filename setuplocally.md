### 🔹 Step 1: Global git hooks folder banaye

```powershell
mkdir C:\Users\Acer\.git-hooks
```

Ye folder system-wide hook store karega.

---

### 🔹 Step 2: Git ko global hooks path bata

```powershell
git config --global core.hooksPath C:\Users\Acer\.git-hooks
```

- Ab har repo ye folder use karega hook ke liye.
- Matlab ab se **har commit**, chaahe repo purana ho ya naya, ye global hook trigger hoga.

---

### 🔹 Step 3: Global post-commit hook banaye

1. `C:\Users\Acer\.git-hooks\post-commit` file create karo.

2. Isme apna AI script run karne ka command daal do:

```bash
#!/bin/sh
# Windows compatible using node
node "C:/Users/Acer/github-pr-ai/review.js"
```

3. File ko executable banaye (PowerShell me admin run karo):

```powershell
icacls C:\Users\Acer\.git-hooks\post-commit /grant Everyone:F
```

- Windows me `chmod +x` nahi hai, isliye ACL permissions use karte hain.

---

### 🔹 Step 4: Test karo

Kisi bhi repo me jao aur commit karo:

```bash
git commit -m "Test global hook"
```

- Ab **review\.js** automatic run hoga.
- Jo purani repos thi, unme bhi ye hook chal jaayega.
