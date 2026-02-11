In order to start this, run:
npm i
npm run dev

if you want to build it, run:
npm run build

if you want to see api body(input and output), go to http://localhost:3000/api-docs after starting the server

Interface folder is for defining shape of entities
for example:
export const User = mongoose.model<IUser>('User', UserSchema);
when typing in repo, service, controller, properties like role, username, email will be suggested

export const User = mongoose.model('User', UserSchema) ;
when type in repo, service, controller, properties will not be suggested, leading to possible typos and bugs
user.userName X
user.username O

You may see in dto folder, there are types and schemas defined using zod

types are for typing only in typescript(using in function parameters)(check it in service and repo folders)
schemas are for runtime validation(using in controller to validate req.body)

route.patch('/me', UserController.updateSelf); update username, password but does not update role and status and token