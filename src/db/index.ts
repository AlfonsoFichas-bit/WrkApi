import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../../prisma/generated/client";

export const db = new PrismaClient().$extends(withAccelerate());
