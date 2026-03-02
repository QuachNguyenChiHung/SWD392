import { Request } from "express";
import type { UserGetFromTokenDTO } from "../dto/UserDTO.ts";
import type { ITeacher } from "../interface/ITeacher";
import type { IAdmin } from "../interface/IAdmin";

declare global {
    namespace Express {
        interface Request {
            user?: UserGetFromTokenDTO;
            teacher?: ITeacher;
            admin?: IAdmin;
        }
    }
}