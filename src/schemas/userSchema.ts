import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

export const usernameParamsSchema = z.object({
    username: usernameValidation,
});