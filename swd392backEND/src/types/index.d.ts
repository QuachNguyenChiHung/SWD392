import { Request } from "express";
import type { UserGetFromTokenDTO } from "../dto/UserDTO.ts";
declare global {
    namespace Express {
        interface Request {
            user?: UserGetFromTokenDTO; // hoặc User nếu có type cụ thể
        }
    }
}