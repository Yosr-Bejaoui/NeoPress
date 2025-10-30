# 🔐 Admin User Setup Guide

## Creating Your First Admin User

You need to create an admin user in your MongoDB database before you can login.

### Option 1: Using Render Shell (Recommended for Production)

1. Go to your Render dashboard
2. Click on your NeoPress service
3. Click **Shell** in the left menu
4. Run this command:

```bash
node server/seed-admin.js --email admin@neopress.com --password YourSecurePassword123! --name "Admin User"
```

Replace:
- `admin@neopress.com` with your desired email
- `YourSecurePassword123!` with a strong password (min 6 characters)
- `"Admin User"` with your name

### Option 2: Using Environment Variables

1. In Render dashboard, go to Environment Variables
2. Add these:
   ```
   DEFAULT_ADMIN_EMAIL=admin@neopress.com
   DEFAULT_ADMIN_PASSWORD=YourSecurePassword123!
   DEFAULT_ADMIN_NAME=Admin User
   ```
3. Open Shell and run:
   ```bash
   node server/seed-admin.js
   ```

### Option 3: Locally (For Development)

```bash
cd server
node seed-admin.js --email admin@test.com --password test123 --name "Test Admin"
```

## Resetting Password

If you forget your password:

```bash
node server/seed-admin.js --email admin@neopress.com --password NewPassword123! --force
```

The `--force` flag will update the existing admin's password.

## Verify Admin Exists

Run this in Render Shell or locally:

```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Admin = mongoose.model('Admin', new mongoose.Schema({
    email: String,
    fullName: String,
    role: String,
    createdAt: Date
  }));
  const admins = await Admin.find({}).select('email fullName role createdAt');
  console.log('Admins in database:', admins);
  process.exit(0);
});
"
```

## After Creating Admin

1. Go to your NeoPress URL
2. Click "Login" or go to `/login`
3. Enter your email and password
4. You should be redirected to the dashboard

## Troubleshooting

### "Admin not found" error
- Make sure you created the admin user
- Check the email is correct (lowercase)
- Verify in MongoDB that the admin exists

### "Invalid credentials" error
- Password is incorrect
- Reset password with `--force` flag

### "JWT secret is not configured" error
- Add `JWT_SECRET` environment variable in Render
- Value: any random string (e.g., `your-super-secret-jwt-key-123`)

---

**Need Help?** Check the Render logs for detailed error messages with the new logging.
