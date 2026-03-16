# Backend API

## Getting Started

### Installation & Development

To start the development server, run:

```bash
npm i
npm run dev
```

### Build

If you want to build the project, run:

```bash
npm run build
```

### API Documentation

To see API body (input and output), navigate to:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** after starting the server

---

## Project Structure

### Interface Folder

The `interface` folder is for defining the shape of entities.

**Example:**

```typescript
export const User = mongoose.model<IUser>('User', UserSchema);
```

When typing in repo, service, controller, properties like `role`, `username`, `email` will be suggested.

```typescript
export const User = mongoose.model('User', UserSchema);
```

When typing in repo, service, controller, properties will not be suggested, leading to possible typos and bugs:
- ❌ `user.userName`
- ✅ `user.username`

### DTO Folder

You may see in the `dto` folder, there are types and schemas defined using Zod.

- **Types**: For typing only in TypeScript (using in function parameters). Check it in `service` and `repo` folders.
- **Schemas**: For runtime validation (using in controller to validate `req.body`).

---

## Known Issues

### Bugs

- The upload/delete/update function in `utils/cloudinary.ts` file is broken, but upload/update/delete image routes are working. You can test it via Swagger.

### Fixed Bugs

- `route.patch('/me', UserController.updateSelf);` - Updates username and password but does not update role, status, and token.