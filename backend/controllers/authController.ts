import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

import { z } from "zod";

const authSchema = z.object({
    username: z.string().min(3, "Username must be greater than 3 characters"),
    password: z.string()
})


export const signup = async (req: any, res: any) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "All Field Required"
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if (existingUser) {
            return res.status(400).json({
                message: "User Already Exists"
            })
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPass,
            },
        })

        return res.status(200).json({
            message: "Signup Successfully",
            user
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Signup Error",
            error: err
        })
    }
}

export const login = async (req: any, res: any) => {
    try {
        const { username, password } = req.body;

        const result = authSchema.safeParse(req.body);

        if (result.success) {
            console.log("Input data is valid")
        }
        else {
            return res.status(400).json({
                message: "validation failed",
                error: result.error.message
            })
        }

        const userFind = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (!userFind) {
            return res.json({
                status: 400,
                message: "User is not registered"
            })
        }

        const matchPass = await bcrypt.compare(password, userFind.password);
        if (!matchPass) {
            return res.json({
                status: 400,
                message: "Password Incorrect"
            })
        }

        const token = jwt.sign(
            {
                userId: userFind.id,
                username: userFind.username
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7d"
            }
        )

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: userFind.id,
                username: userFind.username,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }



}

